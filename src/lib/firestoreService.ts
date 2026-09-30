import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { User, DailyActivityLog, ProjectWorkOrder, HardwareAsset, AssetRepairLog } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory connection test on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection check: Client offline or initializing.');
    }
  }
}
testFirestoreConnection();

// --- USER & FIRST-USER OWNER ELEVATION IN FIRESTORE ---

export async function syncUserInFirestore(
  uid: string,
  email: string,
  displayName?: string,
  benchStation?: string
): Promise<User> {
  const userDocRef = doc(db, 'users', uid);
  const sysMetaRef = doc(db, 'system', 'metadata');

  try {
    // Check if user document already exists
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: uid,
        username: email.split('@')[0],
        displayName: data.displayName || displayName || email.split('@')[0],
        role: data.role || 'ROLE_STUDENT',
        benchStation: data.benchStation || benchStation || 'Student Station',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }

    // Check system metadata to see if this is the First User
    let isFirstUser = false;
    let assignedRole: 'ROLE_OWNER' | 'ROLE_STUDENT' = 'ROLE_STUDENT';

    try {
      const sysSnap = await getDoc(sysMetaRef);
      if (!sysSnap.exists() || !sysSnap.data()?.ownerUid) {
        // First User in Firestore!
        isFirstUser = true;
        assignedRole = 'ROLE_OWNER';
        await setDoc(sysMetaRef, {
          ownerUid: uid,
          initialized: true,
          userCount: 1,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const currentCount = sysSnap.data()?.userCount || 1;
        await setDoc(
          sysMetaRef,
          {
            userCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      // If system metadata check fails (e.g. permissions), check users collection
      console.warn('System meta lookup fallback:', e);
      const allUsersSnap = await getDocs(collection(db, 'users'));
      if (allUsersSnap.empty) {
        isFirstUser = true;
        assignedRole = 'ROLE_OWNER';
      }
    }

    const newUserRecord = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      role: assignedRole,
      benchStation: isFirstUser
        ? 'Instructor Master Station #1'
        : benchStation || 'Student Bench Station',
      createdAt: new Date().toISOString(),
      isFirstUser,
    };

    await setDoc(userDocRef, newUserRecord);

    return {
      id: uid,
      username: email.split('@')[0],
      displayName: newUserRecord.displayName,
      role: newUserRecord.role,
      benchStation: newUserRecord.benchStation,
      createdAt: newUserRecord.createdAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    throw error;
  }
}

export async function fetchUsersFromFirestore(): Promise<User[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        username: data.email?.split('@')[0] || d.id,
        displayName: data.displayName || data.email?.split('@')[0] || 'Technician',
        role: data.role || 'ROLE_STUDENT',
        benchStation: data.benchStation || 'Student Station',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// --- CALENDAR LOGS FIRESTORE CRUD ---

export async function fetchCalendarLogsFromFirestore(): Promise<DailyActivityLog[]> {
  const path = 'calendar_logs';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        dateString: data.dateString || d.id,
        status: data.status || 'in_progress',
        topicsCovered: data.topicsCovered || '',
        benchRepairsPerformed: data.benchRepairsPerformed || '',
        partsUsedOrOrdered: data.partsUsedOrOrdered || '',
        specialNotesAndSafety: data.specialNotesAndSafety || '',
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveCalendarLogToFirestore(log: DailyActivityLog): Promise<void> {
  const docId = log.dateString;
  const path = `calendar_logs/${docId}`;
  try {
    await setDoc(doc(db, 'calendar_logs', docId), {
      ...log,
      updatedAt: new Date().toISOString(),
      authorUid: auth.currentUser?.uid || 'anonymous',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- PROJECTS / WORK ORDERS FIRESTORE CRUD ---

export async function fetchProjectsFromFirestore(): Promise<ProjectWorkOrder[]> {
  const path = 'projects';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || 'Untitled Work Order',
        benchNumber: data.benchNumber || 'Bench #1',
        technicianName: data.technicianName || 'Technician',
        clientOrDepartment: data.clientOrDepartment || 'TradeTech Lab',
        deviceType: data.deviceType || 'Hardware Unit',
        reportedFault: data.reportedFault || 'Diagnostic needed',
        priority: data.priority || 'Normal',
        stage: data.stage || 'Intake',
        status: data.status || 'ongoing',
        dateCreated: data.dateCreated || new Date().toISOString().split('T')[0],
        dateCompleted: data.dateCompleted || undefined,
        repairOutcomeNotes: data.repairOutcomeNotes || undefined,
        partsReplaced: data.partsReplaced || [],
        estimatedCost: data.estimatedCost || 0,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveProjectToFirestore(project: ProjectWorkOrder): Promise<void> {
  const docId = project.id;
  const path = `projects/${docId}`;
  try {
    await setDoc(doc(db, 'projects', docId), {
      ...project,
      authorUid: auth.currentUser?.uid || 'anonymous',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProjectInFirestore(
  projectId: string,
  updates: Partial<ProjectWorkOrder>
): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- HARDWARE ASSETS & REPAIR HISTORY FIRESTORE CRUD ---

export async function fetchHardwareAssetsFromFirestore(): Promise<HardwareAsset[]> {
  const path = 'hardware_assets';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return [];
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        assetTag: data.assetTag || d.id,
        serialNumber: data.serialNumber || 'UNKNOWN-SN',
        model: data.model || 'Generic Hardware Unit',
        deviceType: data.deviceType || 'Desktop Tower',
        assignedBench: data.assignedBench || 'Bench #1',
        department: data.department || 'Vocational IT Lab',
        status: data.status || 'In Service',
        specs: data.specs || {},
        purchaseDate: data.purchaseDate || undefined,
        warrantyExpiry: data.warrantyExpiry || undefined,
        notes: data.notes || '',
        repairHistory: Array.isArray(data.repairHistory) ? data.repairHistory : [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        authorUid: data.authorUid || undefined,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getHardwareAssetFromFirestore(assetIdOrTag: string): Promise<HardwareAsset | null> {
  const cleanId = assetIdOrTag.trim();
  const path = `hardware_assets/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'hardware_assets', cleanId));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        assetTag: data.assetTag || snap.id,
        serialNumber: data.serialNumber || 'UNKNOWN-SN',
        model: data.model || 'Generic Hardware Unit',
        deviceType: data.deviceType || 'Desktop Tower',
        assignedBench: data.assignedBench || 'Bench #1',
        department: data.department || 'Vocational IT Lab',
        status: data.status || 'In Service',
        specs: data.specs || {},
        purchaseDate: data.purchaseDate || undefined,
        warrantyExpiry: data.warrantyExpiry || undefined,
        notes: data.notes || '',
        repairHistory: Array.isArray(data.repairHistory) ? data.repairHistory : [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveHardwareAssetToFirestore(asset: HardwareAsset): Promise<void> {
  const docId = asset.id || asset.assetTag;
  const path = `hardware_assets/${docId}`;
  try {
    await setDoc(doc(db, 'hardware_assets', docId), {
      ...asset,
      updatedAt: new Date().toISOString(),
      authorUid: auth.currentUser?.uid || 'anonymous',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateHardwareAssetInFirestore(
  assetId: string,
  updates: Partial<HardwareAsset>
): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    await updateDoc(doc(db, 'hardware_assets', assetId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addRepairLogToAssetInFirestore(
  assetId: string,
  newLog: AssetRepairLog,
  currentHistory: AssetRepairLog[]
): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    const updatedHistory = [newLog, ...currentHistory];
    await updateDoc(doc(db, 'hardware_assets', assetId), {
      repairHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteHardwareAssetFromFirestore(assetId: string): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    await deleteDoc(doc(db, 'hardware_assets', assetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

