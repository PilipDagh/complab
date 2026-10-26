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
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import {
  User,
  DailyActivityLog,
  ProjectWorkOrder,
  HardwareAsset,
  AssetRepairLog,
  ComLabWorkstation,
  ComLabLayoutConfig,
  LabInventoryItem,
  LabLocation,
  QualityInspection,
} from '../types';

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

export function mapDocToHardwareAsset(d: any): HardwareAsset {
  const data = d.data ? d.data() : d;
  return {
    id: d.id || data.id || data.assetTag,
    assetTag: data.assetTag || d.id,
    serialNumber: data.serialNumber || 'UNKNOWN-SN',
    model: data.model || 'Generic Hardware Unit',
    deviceType: data.deviceType || 'Desktop Tower',
    assignedBench: data.assignedBench || 'Bench #1',
    department: data.department || 'Vocational IT Lab',
    status: data.status || 'In Service',
    kanbanStage: data.kanbanStage || 'deployed',
    isCurrentlyOnHand: data.isCurrentlyOnHand !== undefined ? data.isCurrentlyOnHand : true,
    problemLabel: data.problemLabel || undefined,
    specs: data.specs || {},
    qaReview: data.qaReview || undefined,
    purchaseDate: data.purchaseDate || undefined,
    warrantyExpiry: data.warrantyExpiry || undefined,
    notes: data.notes || '',
    repairHistory: Array.isArray(data.repairHistory) ? data.repairHistory : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    authorUid: data.authorUid || undefined,
  };
}

export async function fetchHardwareAssetsFromFirestore(): Promise<HardwareAsset[]> {
  const path = 'hardware_assets';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return [];
    return snap.docs.map(mapDocToHardwareAsset);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToHardwareAssets(
  onUpdate: (assets: HardwareAsset[]) => void,
  onError?: (error: any) => void
): () => void {
  const path = 'hardware_assets';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const assets = snapshot.docs.map(mapDocToHardwareAsset);
      onUpdate(assets);
    },
    (error) => {
      console.error('Real-time hardware_assets sync error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function getHardwareAssetFromFirestore(assetIdOrTag: string): Promise<HardwareAsset | null> {
  const cleanId = assetIdOrTag.trim();
  const path = `hardware_assets/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'hardware_assets', cleanId));
    if (snap.exists()) {
      return mapDocToHardwareAsset(snap);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Recursively removes all `undefined` values from an object or array.
 * Firestore throws a runtime error if any field is undefined.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean as T;
}

export const DEMO_ASSET_IDS = [
  'AST-DELL-7090',
  'AST-LENOVO-T14',
  'AST-CISCO-2960X',
  'AST-RIG-VRM01',
  'AST-CORSAIR-RM850',
  'AST-CISCO-C9200',
  'AST-PROXMOX-R740',
  'AST-RIG-AM5-BENCH',
  'AST-PC3000-EXP',
  'AST-FLUKE-DSX8000',
  'AST-QUICK-861DW',
  'AST-HAKKO-FM203',
  'AST-RIGOL-DS1054Z',
  'AST-CLEAN-HOOD-100',
];

export async function saveHardwareAssetToFirestore(asset: HardwareAsset): Promise<void> {
  const docId = (asset.id || asset.assetTag || `AST-${Date.now()}`).trim();
  const path = `hardware_assets/${docId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...asset,
      id: docId,
      assetTag: asset.assetTag || docId,
      updatedAt: new Date().toISOString(),
      authorUid: auth.currentUser?.uid || 'anonymous',
    });
    await setDoc(doc(db, 'hardware_assets', docId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function batchImportHardwareAssets(
  assets: HardwareAsset[]
): Promise<{ success: boolean; count: number }> {
  const path = 'hardware_assets';
  if (!assets || assets.length === 0) return { success: true, count: 0 };

  try {
    const now = new Date().toISOString();
    const BATCH_SIZE = 350; // Firestore limit is 500 operations per write batch
    let totalImported = 0;

    for (let i = 0; i < assets.length; i += BATCH_SIZE) {
      const chunk = assets.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      chunk.forEach((asset, idx) => {
        const docId = (
          asset.id ||
          asset.assetTag ||
          `AST-IMP-${Date.now()}-${i + idx}`
        ).trim();
        const ref = doc(db, 'hardware_assets', docId);
        const sanitized = sanitizeForFirestore({
          ...asset,
          id: docId,
          assetTag: asset.assetTag || docId,
          updatedAt: now,
          authorUid: auth.currentUser?.uid || 'import_tool',
        });
        batch.set(ref, sanitized, { merge: true });
      });

      await batch.commit();
      totalImported += chunk.length;
    }

    return { success: true, count: totalImported };
  } catch (error) {
    console.error('Error during batchImportHardwareAssets:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateHardwareAssetInFirestore(
  assetId: string,
  updates: Partial<HardwareAsset>
): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'hardware_assets', assetId), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function addRepairLogToAssetInFirestore(
  assetId: string,
  newLog: AssetRepairLog,
  currentHistory: AssetRepairLog[]
): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    const updatedHistory = sanitizeForFirestore([newLog, ...currentHistory]);
    await updateDoc(doc(db, 'hardware_assets', assetId), {
      repairHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteHardwareAssetFromFirestore(assetId: string): Promise<void> {
  const path = `hardware_assets/${assetId}`;
  try {
    await deleteDoc(doc(db, 'hardware_assets', assetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function purgeDemoAssetsFromFirestore(): Promise<number> {
  const path = 'hardware_assets';
  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const id of DEMO_ASSET_IDS) {
      batch.delete(doc(db, 'hardware_assets', id));
      count++;
    }
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function clearAllHardwareAssetsFromFirestore(): Promise<number> {
  const path = 'hardware_assets';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return 0;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return snap.docs.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// --- COMLAB WORKSTATIONS & LAYOUT CONFIG FIRESTORE SYNC ---

export async function fetchComLabWorkstationsFromFirestore(): Promise<ComLabWorkstation[]> {
  const path = 'comlab_workstations';
  try {
    const snap = await getDocs(collection(db, 'comlab_workstations'));
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        rowId: data.rowId || 'A',
        rowLabel: data.rowLabel || `Row ${data.rowId || 'A'}`,
        slotNumber: data.slotNumber ?? 1,
        displayName: data.displayName || `PC ${data.rowId || 'A'}${data.slotNumber ?? 1}`,
        statusLevel: data.statusLevel || 'unconfigured',
        powerState: data.powerState || 'standby',
        isConfigured: data.isConfigured ?? false,
        components: data.components || { hasParts: true },
        notes: data.notes || '',
        issueDescription: data.issueDescription || '',
        assignedTechnician: data.assignedTechnician || '',
        lastInspected: data.lastInspected || undefined,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        updatedBy: data.updatedBy || 'System',
        telemetry: data.telemetry || undefined,
      } as ComLabWorkstation;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToComLabWorkstations(
  onUpdate: (workstations: ComLabWorkstation[]) => void,
  onError?: (error: any) => void
): () => void {
  const path = 'comlab_workstations';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const workstations = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          rowId: data.rowId || 'A',
          rowLabel: data.rowLabel || `Row ${data.rowId || 'A'}`,
          slotNumber: data.slotNumber ?? 1,
          displayName: data.displayName || `PC ${data.rowId || 'A'}${data.slotNumber ?? 1}`,
          statusLevel: data.statusLevel || 'unconfigured',
          powerState: data.powerState || 'standby',
          isConfigured: data.isConfigured ?? false,
          components: data.components || { hasParts: true },
          notes: data.notes || '',
          issueDescription: data.issueDescription || '',
          assignedTechnician: data.assignedTechnician || '',
          lastInspected: data.lastInspected || undefined,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          updatedBy: data.updatedBy || 'System',
          telemetry: data.telemetry || undefined,
        } as ComLabWorkstation;
      });
      onUpdate(workstations);
    },
    (error) => {
      console.error('Real-time comlab_workstations sync error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveComLabWorkstationToFirestore(
  workstation: ComLabWorkstation
): Promise<void> {
  const docId = workstation.id;
  const path = `comlab_workstations/${docId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...workstation,
      id: docId,
      lastUpdated: new Date().toISOString(),
      updatedBy: auth.currentUser?.displayName || workstation.updatedBy || 'Technician',
    });
    await setDoc(doc(db, 'comlab_workstations', docId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function saveAllComLabWorkstationsToFirestore(
  workstations: ComLabWorkstation[]
): Promise<void> {
  const path = 'comlab_workstations';
  try {
    const batch = writeBatch(db);
    for (const ws of workstations) {
      const sanitized = sanitizeForFirestore(ws);
      batch.set(doc(db, 'comlab_workstations', ws.id), sanitized, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function fetchComLabLayoutFromFirestore(): Promise<ComLabLayoutConfig | null> {
  const path = 'comlab_config/main_layout';
  try {
    const snap = await getDoc(doc(db, 'comlab_config', 'main_layout'));
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: snap.id,
      labName: data.labName || 'Main TradeTech Computer Lab (ComLab)',
      direction: data.direction || 'right_to_left',
      rows: data.rows || [],
      updatedAt: data.updatedAt || new Date().toISOString(),
      updatedBy: data.updatedBy || 'Julian (Owner)',
    } as ComLabLayoutConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveComLabLayoutToFirestore(
  layout: ComLabLayoutConfig
): Promise<void> {
  const path = 'comlab_config/main_layout';
  try {
    await setDoc(doc(db, 'comlab_config', 'main_layout'), {
      ...layout,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.displayName || layout.updatedBy || 'Julian (Owner)',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==============================================================================
// LAB LOCATIONS FIRESTORE SERVICES
// ==============================================================================

export function subscribeToLabLocations(
  onUpdate: (locations: LabLocation[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'lab_locations';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const locations = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unassigned Location',
          zoneType: data.zoneType || 'tool_storage',
          description: data.description || '',
          itemCount: typeof data.itemCount === 'number' ? data.itemCount : 0,
          createdAt: data.createdAt || new Date().toISOString(),
          createdBy: data.createdBy || 'Technician',
          updatedAt: data.updatedAt,
        } as LabLocation;
      });
      // Sort alphabetically by name
      locations.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(locations);
    },
    (error) => {
      console.error('Real-time lab_locations sync error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveLabLocationToFirestore(loc: LabLocation): Promise<void> {
  const docId = loc.id || `loc_${Date.now()}`;
  const path = `lab_locations/${docId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...loc,
      id: docId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'lab_locations', docId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteLabLocationFromFirestore(locationId: string): Promise<void> {
  const path = `lab_locations/${locationId}`;
  try {
    await deleteDoc(doc(db, 'lab_locations', locationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ==============================================================================
// TOOLS & SUPPLIES INVENTORY FIRESTORE SERVICES
// ==============================================================================

export function subscribeToToolsAndSupplies(
  onUpdate: (items: LabInventoryItem[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'tools_supplies';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unnamed Item',
          itemType: data.itemType || 'tool',
          category: data.category || 'General',
          skuOrTag: data.skuOrTag || '',
          brand: data.brand || '',
          model: data.model || '',
          serialNumber: data.serialNumber || '',
          locationId: data.locationId || undefined,
          locationName: data.locationName || undefined,
          status: data.status || 'available',
          condition: data.condition || 'good',
          checkedOutBy: data.checkedOutBy || undefined,
          quantityOnHand: typeof data.quantityOnHand === 'number' ? data.quantityOnHand : undefined,
          unitOfMeasure: data.unitOfMeasure || 'units',
          minReorderLevel: typeof data.minReorderLevel === 'number' ? data.minReorderLevel : undefined,
          purchaseDate: data.purchaseDate || undefined,
          cost: typeof data.cost === 'number' ? data.cost : undefined,
          notes: data.notes || '',
          barcode: data.barcode || '',
          photoUrl: data.photoUrl || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          updatedBy: data.updatedBy || 'Technician',
        } as LabInventoryItem;
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Real-time tools_supplies sync error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveToolOrSupplyToFirestore(item: LabInventoryItem): Promise<void> {
  const docId = item.id || `item_${Date.now()}`;
  const path = `tools_supplies/${docId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...item,
      id: docId,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.displayName || item.updatedBy || 'Technician',
    });
    await setDoc(doc(db, 'tools_supplies', docId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteToolOrSupplyFromFirestore(itemId: string): Promise<void> {
  const path = `tools_supplies/${itemId}`;
  try {
    await deleteDoc(doc(db, 'tools_supplies', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ==============================================================================
// QUALITY INSPECTIONS FIRESTORE SERVICES
// ==============================================================================

export function subscribeToQualityInspections(
  onUpdate: (inspections: QualityInspection[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'quality_inspections';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const inspections = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          certificateNumber: data.certificateNumber || `TT-QA-${docSnap.id.slice(-4).toUpperCase()}`,
          workOrderId: data.workOrderId || undefined,
          assetTag: data.assetTag || undefined,
          deviceModel: data.deviceModel || 'General Device',
          serialNumber: data.serialNumber || undefined,
          deviceType: data.deviceType || 'Desktop Tower',
          clientOrRecipient: data.clientOrRecipient || 'Client',
          technicianName: data.technicianName || 'Technician',
          inspectorName: data.inspectorName || 'Lead Inspector',
          inspectionDate: data.inspectionDate || new Date().toISOString(),
          checks: data.checks || {
            powerSupplyGroundVerified: true,
            cablesInsulatedNoExposedWire: true,
            powerRailVoltagesNormal: true,
            esdGroundingDischarged: true,
            cpuThermalsUnderLoadPass: true,
            maxCpuTempCelsius: 65,
            ramMemtestStable: true,
            storageSmartHealthClean: true,
            gpuStabilityTestPass: true,
            coolingFansSpinFreely: true,
            cleanOsInstalledAndActivated: true,
            allDriversFunctionalNoUnknown: true,
            benchProfilesRemoved: true,
            biosFirmwareUpdated: true,
            antivirusEnabledAndUpdated: true,
            chassisCleanedAndSanitized: true,
            screenSpotlessNoFingerprints: true,
            portsDustFree: true,
            accessoriesAndPowerLeadBagged: true,
          },
          overallStatus: data.overallStatus || 'passed',
          inspectorNotes: data.inspectorNotes || '',
          benchVoltagesRecorded: data.benchVoltagesRecorded || '',
          approvedForOutboundRelease: data.approvedForOutboundRelease ?? true,
          certificateHash: data.certificateHash || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as QualityInspection;
      });
      // Sort newest first
      inspections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(inspections);
    },
    (error) => {
      console.error('Real-time quality_inspections sync error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveQualityInspectionToFirestore(
  inspection: QualityInspection
): Promise<void> {
  const docId = inspection.id || `qa_${Date.now()}`;
  const path = `quality_inspections/${docId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...inspection,
      id: docId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'quality_inspections', docId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteQualityInspectionFromFirestore(
  inspectionId: string
): Promise<void> {
  const path = `quality_inspections/${inspectionId}`;
  try {
    await deleteDoc(doc(db, 'quality_inspections', inspectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}



