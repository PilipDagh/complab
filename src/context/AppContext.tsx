import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  DiagnosticCategory,
  ChatMessage,
  DailyActivityLog,
  ProjectWorkOrder,
  DiagnosticNode,
  HardwareAsset,
  AssetRepairLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DIAGNOSTIC_CATEGORIES,
  INITIAL_CALENDAR_LOGS,
  INITIAL_PROJECT_WORK_ORDERS,
  INITIAL_HARDWARE_ASSETS,
} from '../data/seedData';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  syncUserInFirestore,
  fetchUsersFromFirestore,
  fetchCalendarLogsFromFirestore,
  saveCalendarLogToFirestore,
  fetchProjectsFromFirestore,
  saveProjectToFirestore,
  updateProjectInFirestore,
  deleteProjectFromFirestore,
  fetchHardwareAssetsFromFirestore,
  getHardwareAssetFromFirestore,
  saveHardwareAssetToFirestore,
  updateHardwareAssetInFirestore,
  addRepairLogToAssetInFirestore,
  deleteHardwareAssetFromFirestore,
} from '../lib/firestoreService.ts';

export type AppTab = 'diagnostic' | 'reference' | 'gemini' | 'calendar';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Auth & RBAC
  currentUser: User | null;
  users: User[];
  isOwner: boolean;
  isGuest: boolean;
  loginUser: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signupUser: (usernameOrEmail: string, password?: string, displayName?: string) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<void>;
  logoutUser: () => void;
  switchUserQuick: (userId: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAuthLoading: boolean;

  // Diagnostics
  categories: DiagnosticCategory[];
  activeCategoryId: string;
  setActiveCategoryId: (catId: string) => void;
  currentNodeId: string;
  setCurrentNodeId: (nodeId: string) => void;
  diagnosticHistory: string[];
  selectDiagnosticOption: (nextNodeId: string) => void;
  resetDiagnostic: (categoryId?: string) => void;
  jumpToBreadcrumb: (nodeId: string) => void;
  sendDiagnosticToGemini: (solutionNode: any, categoryName: string, path: string[]) => void;

  // Gemini AI Chat
  chatMessages: ChatMessage[];
  isAiLoading: boolean;
  selectedModel: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  setSelectedModel: (model: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite') => void;
  isThinkingMode: boolean;
  setIsThinkingMode: (enabled: boolean) => void;
  sendMessageToGemini: (text: string, image?: { data: string; mimeType: string }) => Promise<void>;
  clearChatHistory: () => void;
  getOwnerContextPayload: () => string;

  // Lab Calendar & Work Orders
  calendarLogs: DailyActivityLog[];
  saveCalendarLog: (log: Partial<DailyActivityLog> & { dateString: string }) => Promise<void>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  projects: ProjectWorkOrder[];
  addProject: (project: Omit<ProjectWorkOrder, 'id' | 'dateCreated' | 'status'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectWorkOrder>) => Promise<void>;
  archiveProject: (id: string, outcomeNotes: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  exportDataJson: () => void;
  exportDataTxt: () => string;

  // Hardware Assets & QR Scanner (Firestore persistent)
  hardwareAssets: HardwareAsset[];
  activeScannedAsset: HardwareAsset | null;
  setActiveScannedAsset: (asset: HardwareAsset | null) => void;
  isScannerModalOpen: boolean;
  setIsScannerModalOpen: (open: boolean) => void;
  lookupHardwareAsset: (assetTagOrId: string) => Promise<HardwareAsset | null>;
  saveHardwareAsset: (asset: HardwareAsset) => Promise<void>;
  addAssetRepairLog: (assetId: string, log: Omit<AssetRepairLog, 'id' | 'date'>) => Promise<void>;
  deleteHardwareAsset: (assetId: string) => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('diagnostic');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Standard Web User Login: GUEST by default unless previously logged in via Chrome/Browser session!
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Hardware Assets & QR Scanner State
  const [hardwareAssets, setHardwareAssets] = useState<HardwareAsset[]>(INITIAL_HARDWARE_ASSETS);
  const [activeScannedAsset, setActiveScannedAsset] = useState<HardwareAsset | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to format usernames into standard email addresses for Firebase Auth
  const formatEmail = (input: string): string => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
    // Format local usernames (e.g. 'tech_alex') into email format
    return `${trimmed.replace(/[^a-z0-9._-]/g, '')}@tradetech.edu`;
  };

  // 1. Firebase Auth state listener: Restores previous session automatically like a normal website
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const syncedUser = await syncUserInFirestore(
            fbUser.uid,
            fbUser.email || `${fbUser.uid}@tradetech.edu`,
            fbUser.displayName || undefined
          );
          setCurrentUser(syncedUser);
        } catch (err) {
          console.error('Failed to sync authenticated user with Firestore:', err);
        }
      } else {
        // User is not logged in: Guest user by default
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Firestore Data (Users, Calendar Logs, Projects) on boot
  useEffect(() => {
    const loadFirestoreData = async () => {
      try {
        // Fetch Users from Firestore
        const fsUsers = await fetchUsersFromFirestore();
        if (fsUsers && fsUsers.length > 0) {
          setUsers(fsUsers);
        }

        // Fetch Daily Calendar Logs from Firestore
        const fsLogs = await fetchCalendarLogsFromFirestore();
        if (fsLogs && fsLogs.length > 0) {
          setCalendarLogs(fsLogs);
        } else {
          setCalendarLogs(INITIAL_CALENDAR_LOGS);
          // Seed initial demo logs to Firestore asynchronously
          for (const initLog of INITIAL_CALENDAR_LOGS) {
            try {
              await saveCalendarLogToFirestore(initLog);
            } catch (seedErr) {
              console.warn('Initial calendar log seed fallback:', seedErr);
            }
          }
        }

        // Fetch Projects / Work Orders from Firestore
        const fsProjects = await fetchProjectsFromFirestore();
        if (fsProjects && fsProjects.length > 0) {
          setProjects(fsProjects);
        } else {
          setProjects(INITIAL_PROJECT_WORK_ORDERS);
          // Seed initial projects to Firestore asynchronously
          for (const initProj of INITIAL_PROJECT_WORK_ORDERS) {
            try {
              await saveProjectToFirestore(initProj);
            } catch (seedErr) {
              console.warn('Initial project seed fallback:', seedErr);
            }
          }
        }

        // Fetch Hardware Assets from Firestore
        const fsAssets = await fetchHardwareAssetsFromFirestore();
        if (fsAssets && fsAssets.length > 0) {
          setHardwareAssets(fsAssets);
        } else {
          setHardwareAssets(INITIAL_HARDWARE_ASSETS);
          // Seed initial hardware assets to Firestore asynchronously
          for (const initAsset of INITIAL_HARDWARE_ASSETS) {
            try {
              await saveHardwareAssetToFirestore(initAsset);
            } catch (seedErr) {
              console.warn('Initial asset seed fallback:', seedErr);
            }
          }
        }
      } catch (err) {
        console.warn('Firestore initial data load notice (using memory defaults):', err);
      }
    };

    loadFirestoreData();
  }, []);

  // Auth Operations
  const isOwner = currentUser?.role === 'ROLE_OWNER';
  const isGuest = currentUser === null;

  const loginUser = async (usernameOrEmail: string, password = ''): Promise<{ success: boolean; message: string }> => {
    if (!usernameOrEmail.trim()) {
      addToast({ type: 'error', title: 'Login Failed', message: 'Username or email cannot be blank.' });
      return { success: false, message: 'Username required.' };
    }

    try {
      const emailToUse = formatEmail(usernameOrEmail);
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);

      // Sync and retrieve user record from Firestore
      const user = await syncUserInFirestore(
        userCredential.user.uid,
        userCredential.user.email || emailToUse,
        userCredential.user.displayName || usernameOrEmail.split('@')[0]
      );

      setCurrentUser(user);
      setIsAuthModalOpen(false);

      addToast({
        type: 'success',
        title: 'Logged In Successfully',
        message: `Welcome back, ${user.displayName}! Logged in as ${user.role === 'ROLE_OWNER' ? 'Instructor / Owner' : 'Bench Tech'}.`,
      });

      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Firebase Login Error:', error);
      let errorMsg = 'Failed to authenticate.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect username, email, or password. If you need an account, click "Sign up here".';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else {
        errorMsg = error.message || 'Authentication error.';
      }

      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: errorMsg,
      });

      return { success: false, message: errorMsg };
    }
  };

  const signupUser = async (
    usernameOrEmail: string,
    password = '',
    displayName = ''
  ): Promise<{ success: boolean; message: string }> => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    if (!trimmed) {
      addToast({ type: 'error', title: 'Sign Up Failed', message: 'Username is required.' });
      return { success: false, message: 'Username required.' };
    }

    if (password.length < 6) {
      addToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters in length.',
      });
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    try {
      const emailToUse = formatEmail(trimmed);
      const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, password);

      const resolvedName = displayName.trim() || trimmed.split('@')[0];
      await updateProfile(userCredential.user, { displayName: resolvedName });

      // First User rule enforced inside Firestore syncUserInFirestore:
      const newUser = await syncUserInFirestore(userCredential.user.uid, emailToUse, resolvedName);

      setCurrentUser(newUser);
      setUsers((prev) => [...prev, newUser]);
      setIsAuthModalOpen(false);

      addToast({
        type: 'success',
        title: 'Account Registered & Synced to Firestore',
        message: newUser.role === 'ROLE_OWNER'
          ? `First User Flagged: You have been granted permanent ROLE_OWNER (Instructor/Lead Tech)!`
          : `Technician account created in Firestore with ROLE_STUDENT permissions. Welcome!`,
      });

      return { success: true, message: 'Account created successfully.' };
    } catch (error: any) {
      console.error('Firebase Signup Error:', error);
      let errorMsg = 'Failed to register account.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = `The technician account "${usernameOrEmail}" is already registered. Please log in instead.`;
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      } else {
        errorMsg = error.message || 'Registration failed.';
      }

      addToast({
        type: 'error',
        title: 'Registration Error',
        message: errorMsg,
      });

      return { success: false, message: errorMsg };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const email = result.user.email || `${result.user.uid}@tradetech.edu`;
      const name = result.user.displayName || email.split('@')[0];

      // Sync and flag First User in Firestore
      const user = await syncUserInFirestore(result.user.uid, email, name);

      setCurrentUser(user);
      setUsers((prev) => {
        if (!prev.find((u) => u.id === user.id)) {
          return [...prev, user];
        }
        return prev.map((u) => (u.id === user.id ? user : u));
      });
      setIsAuthModalOpen(false);

      addToast({
        type: 'success',
        title: 'Google & Firestore Authenticated',
        message: `Welcome, ${user.displayName}! Logged in as ${user.role === 'ROLE_OWNER' ? 'Instructor / Lead Tech (Owner)' : 'Bench Tech'}.`,
      });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Failed to authenticate via Google.',
      });
    }
  };

  const logoutUser = () => {
    fbSignOut(auth).catch(() => {});
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You are now browsing as a Guest Technician. Log in anytime to restore owner or student roles.',
    });
  };

  const switchUserQuick = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      addToast({
        type: 'info',
        title: 'Switched Technician Profile',
        message: `Active session now running as: ${found.displayName} (${found.role === 'ROLE_OWNER' ? 'Owner' : 'Student'}).`,
      });
    }
  };

  // Diagnostic Wizard State
  const categories = INITIAL_DIAGNOSTIC_CATEGORIES;
  const [activeCategoryId, setActiveCategoryId] = useState<string>('power_post');
  const [currentNodeId, setCurrentNodeId] = useState<string>('node_pwr_start');
  const [diagnosticHistory, setDiagnosticHistory] = useState<string[]>(['node_pwr_start']);

  const selectDiagnosticOption = (nextNodeId: string) => {
    setCurrentNodeId(nextNodeId);
    setDiagnosticHistory((prev) => [...prev, nextNodeId]);
  };

  const resetDiagnostic = (categoryId?: string) => {
    const targetCatId = categoryId || activeCategoryId;
    const cat = categories.find((c) => c.id === targetCatId) || categories[0];
    setActiveCategoryId(targetCatId);
    setCurrentNodeId(cat.rootNodeId);
    setDiagnosticHistory([cat.rootNodeId]);
  };

  const jumpToBreadcrumb = (nodeId: string) => {
    const idx = diagnosticHistory.indexOf(nodeId);
    if (idx !== -1) {
      setCurrentNodeId(nodeId);
      setDiagnosticHistory(diagnosticHistory.slice(0, idx + 1));
    }
  };

  // Lab Calendar & Projects (PERSISTED IN FIRESTORE)
  const [calendarLogs, setCalendarLogs] = useState<DailyActivityLog[]>(INITIAL_CALENDAR_LOGS);
  const [projects, setProjects] = useState<ProjectWorkOrder[]>(INITIAL_PROJECT_WORK_ORDERS);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const saveCalendarLog = async (logData: Partial<DailyActivityLog> & { dateString: string }) => {
    const idx = calendarLogs.findIndex((item) => item.dateString === logData.dateString);
    const newEntry: DailyActivityLog = {
      id: idx >= 0 ? calendarLogs[idx].id : 'log_' + Date.now(),
      dateString: logData.dateString,
      status: logData.status || 'in_progress',
      topicsCovered: logData.topicsCovered || '',
      benchRepairsPerformed: logData.benchRepairsPerformed || '',
      partsUsedOrOrdered: logData.partsUsedOrOrdered || '',
      specialNotesAndSafety: logData.specialNotesAndSafety || '',
      updatedAt: new Date().toISOString(),
    };

    // Update local state
    setCalendarLogs((prev) => {
      const existingIdx = prev.findIndex((item) => item.dateString === logData.dateString);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newEntry;
        return updated;
      } else {
        return [...prev, newEntry];
      }
    });

    // Persist in Firestore
    try {
      await saveCalendarLogToFirestore(newEntry);
      addToast({
        type: 'success',
        title: 'Saved to Firestore',
        message: `Activity log for ${logData.dateString} saved in Firestore cloud database.`,
      });
    } catch (e) {
      console.error('Firestore saveCalendarLog error:', e);
    }
  };

  const addProject = async (p: Omit<ProjectWorkOrder, 'id' | 'dateCreated' | 'status'>) => {
    const newProject: ProjectWorkOrder = {
      ...p,
      id: 'wo_' + Date.now().toString().substring(6),
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'ongoing',
    };

    setProjects((prev) => [newProject, ...prev]);

    // Persist in Firestore
    try {
      await saveProjectToFirestore(newProject);
      addToast({
        type: 'success',
        title: 'Work Order Saved to Firestore',
        message: `Added: ${newProject.title} to Bench ${newProject.benchNumber}`,
      });
    } catch (e) {
      console.error('Firestore addProject error:', e);
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectWorkOrder>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );

    // Persist in Firestore
    try {
      await updateProjectInFirestore(id, updates);
      addToast({
        type: 'info',
        title: 'Firestore Updated',
        message: 'Work order updated in cloud database.',
      });
    } catch (e) {
      console.error('Firestore updateProject error:', e);
    }
  };

  const archiveProject = async (id: string, outcomeNotes: string) => {
    const updates = {
      status: 'archived' as const,
      stage: 'Completed' as const,
      dateCompleted: new Date().toISOString().split('T')[0],
      repairOutcomeNotes: outcomeNotes,
    };

    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );

    // Persist in Firestore
    try {
      await updateProjectInFirestore(id, updates);
      addToast({
        type: 'success',
        title: 'Archived to Firestore',
        message: 'Repair moved to Completed History in Firestore.',
      });
    } catch (e) {
      console.error('Firestore archiveProject error:', e);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));

    // Delete in Firestore
    try {
      await deleteProjectFromFirestore(id);
      addToast({
        type: 'warning',
        title: 'Removed from Firestore',
        message: 'Work order was deleted from cloud database.',
      });
    } catch (e) {
      console.error('Firestore deleteProject error:', e);
    }
  };

  // --- HARDWARE ASSET & QR SCANNER OPERATIONS ---

  const lookupHardwareAsset = async (assetTagOrId: string): Promise<HardwareAsset | null> => {
    const cleanTag = assetTagOrId.trim();
    if (!cleanTag) return null;

    // 1. Check local state first for fast response
    const foundLocal = hardwareAssets.find(
      (a) =>
        a.assetTag.toLowerCase() === cleanTag.toLowerCase() ||
        a.id.toLowerCase() === cleanTag.toLowerCase() ||
        a.serialNumber.toLowerCase() === cleanTag.toLowerCase()
    );

    if (foundLocal) {
      setActiveScannedAsset(foundLocal);
      return foundLocal;
    }

    // 2. Query Firestore directly
    try {
      const fsAsset = await getHardwareAssetFromFirestore(cleanTag);
      if (fsAsset) {
        setHardwareAssets((prev) => {
          const exists = prev.some((a) => a.id === fsAsset.id);
          return exists ? prev.map((a) => (a.id === fsAsset.id ? fsAsset : a)) : [fsAsset, ...prev];
        });
        setActiveScannedAsset(fsAsset);
        return fsAsset;
      }
    } catch (err) {
      console.error('Error looking up hardware asset from Firestore:', err);
    }

    return null;
  };

  const saveHardwareAsset = async (asset: HardwareAsset) => {
    setHardwareAssets((prev) => {
      const exists = prev.some((a) => a.id === asset.id || a.assetTag === asset.assetTag);
      return exists
        ? prev.map((a) => (a.id === asset.id || a.assetTag === asset.assetTag ? asset : a))
        : [asset, ...prev];
    });

    if (activeScannedAsset?.id === asset.id || activeScannedAsset?.assetTag === asset.assetTag) {
      setActiveScannedAsset(asset);
    }

    // Persist to Firestore
    try {
      await saveHardwareAssetToFirestore(asset);
      addToast({
        type: 'success',
        title: 'Asset Saved to Firestore',
        message: `Hardware asset [${asset.assetTag}] stored in cloud database.`,
      });
    } catch (err) {
      console.error('Error saving hardware asset to Firestore:', err);
    }
  };

  const addAssetRepairLog = async (
    assetId: string,
    logData: Omit<AssetRepairLog, 'id' | 'date'>
  ) => {
    const newLog: AssetRepairLog = {
      id: 'rep_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...logData,
    };

    const targetAsset = hardwareAssets.find((a) => a.id === assetId || a.assetTag === assetId);
    const currentHistory = targetAsset ? targetAsset.repairHistory || [] : [];
    const updatedHistory = [newLog, ...currentHistory];

    setHardwareAssets((prev) =>
      prev.map((a) =>
        a.id === assetId || a.assetTag === assetId
          ? { ...a, repairHistory: updatedHistory, updatedAt: new Date().toISOString() }
          : a
      )
    );

    if (activeScannedAsset?.id === assetId || activeScannedAsset?.assetTag === assetId) {
      setActiveScannedAsset((prev) =>
        prev
          ? {
              ...prev,
              repairHistory: updatedHistory,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    // Persist in Firestore
    try {
      await addRepairLogToAssetInFirestore(assetId, newLog, currentHistory);
      addToast({
        type: 'success',
        title: 'Repair Record Appended',
        message: `Added repair entry to Firestore for asset [${assetId}].`,
      });
    } catch (err) {
      console.error('Error appending repair log in Firestore:', err);
    }
  };

  const deleteHardwareAsset = async (assetId: string) => {
    setHardwareAssets((prev) => prev.filter((a) => a.id !== assetId && a.assetTag !== assetId));
    if (activeScannedAsset?.id === assetId || activeScannedAsset?.assetTag === assetId) {
      setActiveScannedAsset(null);
    }

    try {
      await deleteHardwareAssetFromFirestore(assetId);
      addToast({
        type: 'warning',
        title: 'Asset Deleted',
        message: `Hardware asset [${assetId}] deleted from Firestore.`,
      });
    } catch (err) {
      console.error('Error deleting hardware asset from Firestore:', err);
    }
  };

  // Helper to compile owner context
  const getOwnerContextPayload = (): string => {
    if (!currentUser || currentUser.role !== 'ROLE_OWNER') {
      return '';
    }

    // Today or recent calendar log
    const todayLog = calendarLogs.find((l) => l.dateString === selectedDate) || calendarLogs[0];
    const activeProjects = projects.filter((p) => p.status === 'ongoing');
    const pastProjects = projects.filter((p) => p.status === 'archived').slice(0, 3);

    return `
[INSTRUCTOR / BENCH OWNER CONTEXT]
Instructor Name: ${currentUser.displayName} (${currentUser.benchStation || 'Master Bench'})
Current Lab Date: ${selectedDate}
Lab Topics Covered Today: ${todayLog?.topicsCovered || 'Hardware diagnostics lab'}
Bench Repairs In Progress Today: ${todayLog?.benchRepairsPerformed || 'Standard technician bench rotation'}
Parts Used / Ordered: ${todayLog?.partsUsedOrOrdered || 'None recorded'}
Safety / Lab Directives: ${todayLog?.specialNotesAndSafety || 'Standard ESD grounding wrist straps required'}
${
  activeScannedAsset
    ? `\nActive Scanned Hardware Target: [${activeScannedAsset.assetTag}] ${activeScannedAsset.model} (${activeScannedAsset.deviceType})
Specs: CPU: ${activeScannedAsset.specs.cpu || 'N/A'}, RAM: ${activeScannedAsset.specs.ram || 'N/A'}, Storage: ${activeScannedAsset.specs.storage || 'N/A'}, Motherboard: ${activeScannedAsset.specs.motherboard || 'N/A'}, PSU: ${activeScannedAsset.specs.psu || 'N/A'}
Recent Repairs: ${activeScannedAsset.repairHistory.map((r) => `${r.date}: ${r.faultReported} -> ${r.diagnosis}`).join('; ')}`
    : ''
}

Active Bench Work Orders Currently on Station:
${activeProjects
  .map(
    (p, i) =>
      `${i + 1}. [${p.benchNumber}] ${p.title} | Assigned to: ${p.technicianName} | Device: ${p.deviceType} | Stage: ${p.stage} | Fault: ${p.reportedFault}`
  )
  .join('\n')}

Recently Resolved Bench Projects (For Cross-Reference):
${pastProjects
  .map(
    (p, i) =>
      `${i + 1}. [${p.benchNumber}] ${p.title} -> OUTCOME: ${p.repairOutcomeNotes || 'Repaired and verified.'}`
  )
  .join('\n')}
`;
  };

  // Gemini AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "👋 **Welcome to TradeTech Bench Assistant!** I am your CompTIA A+ & Cisco certified repair co-pilot.\n\n" +
        "You can ask me anything about:\n" +
        "- Motherboard POST failure isolation and Multimeter voltage tests\n" +
        "- PSU pinout readings (+3.3V, +5V, +12V, -12V, +5VSB, PS_ON#)\n" +
        "- Network APIPA (169.254.x.x) resolution, DNS flush, and switch VLANs\n" +
        "- Step-by-step disassembly, BGA rework, and thermal paste application\n\n" +
        "💡 *Pro-Tip: When logged in as Lead Tech / Owner, I automatically inspect today's ongoing lab work orders to tailor my repair advice to your bench!*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'
  >('gemini-3.1-flash-lite');
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'msg_reset_' + Date.now(),
        role: 'assistant',
        content: '🔄 Chat history cleared. Ready for your next bench diagnosis.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sendMessageToGemini = async (text: string, image?: { data: string; mimeType: string }) => {
    if (!text && !image) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedImage: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const ownerContext = isOwner ? getOwnerContextPayload() : '';
      const baseSystemPrompt = `You are the TradeTech Bench Assistant, an expert Master PC Technician, Cisco CCNA, and CompTIA A+ Vocational Trade School Instructor.
Your audience includes computer repair technicians, vocational trade students, and shop lead techs.
Give precise, actionable, electrical and architectural advice.
Use clear Markdown formatting with bold headings, bullet lists, pin numbers, specific multimeter test points (expected voltages, tolerance ranges), and diagnostic safety precautions (ESD, dangerous high-voltage capacitors).
If the user provides an image, carefully analyze the visual hardware clues (e.g. burn marks, swollen caps, unseated RAM, bent pins, thermal paste spillage).
${ownerContext ? `\nActive Lab Master Context:\n${ownerContext}\n*Notice: You have access to the above bench context. Reference active projects and lab notes when answering to provide personalized shop assistance.*` : ''}
`;

      let data: any = null;
      let lastError: any = null;
      const maxClientRetries = 3;

      for (let attempt = 0; attempt < maxClientRetries; attempt++) {
        try {
          const response = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: text,
              history: chatMessages.slice(-8),
              systemInstruction: baseSystemPrompt,
              model: selectedModel,
              thinkingMode: isThinkingMode,
              image: image || null,
            }),
          });

          data = await response.json();

          if (response.ok && data?.reply) {
            break; // Success!
          }

          if (response.status === 503 || data?.status === 'notice') {
            if (attempt < maxClientRetries - 1) {
              const backoffMs = 800 * Math.pow(1.8, attempt) + Math.random() * 200;
              addToast({
                type: 'info',
                title: 'High Demand Detected',
                message: `Retrying with exponential backoff (${attempt + 1}/${maxClientRetries})...`,
              });
              await new Promise((r) => setTimeout(r, backoffMs));
              continue;
            }
          }

          if (data?.reply) {
            break;
          }
          throw new Error(data?.error || `HTTP ${response.status}`);
        } catch (fetchErr: any) {
          lastError = fetchErr;
          if (attempt < maxClientRetries - 1) {
            const backoffMs = 800 * Math.pow(1.8, attempt) + Math.random() * 200;
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
          }
        }
      }

      const botReply: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: data?.reply || 'Diagnostic assistant response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data?.modelUsed || selectedModel,
        contextInjected: !!ownerContext,
      };

      setChatMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      let cleanError = err.message || 'Unable to connect to Gemini engine.';
      try {
        if (cleanError.startsWith('{')) {
          const parsed = JSON.parse(cleanError);
          if (parsed?.error?.message) {
            cleanError = parsed.error.message;
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      if (
        cleanError.includes('503') ||
        cleanError.includes('UNAVAILABLE') ||
        cleanError.includes('high demand')
      ) {
        cleanError =
          '⚠️ **High Demand Notice**: The AI model is currently handling elevated cloud traffic. We recommend selecting **gemini-3.1-flash-lite** from the model dropdown in the chat header for immediate, high-throughput assistance.\n\n*In the meantime: For POST issues, reseat single RAM DIMM in Slot A2 and verify ATX Pin 9 +5VSB.*';
      }

      const errorMsg: ChatMessage = {
        id: 'bot_err_' + Date.now(),
        role: 'assistant',
        content: cleanError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendDiagnosticToGemini = (solutionNode: any, categoryName: string, path: string[]) => {
    let summaryPrompt = `I just completed a diagnostic session in the "${categoryName}" wizard.
Path taken: ${path.join(' ➔ ')}
Preliminary Result: "${solutionNode.title || 'Hardware Fault'}"
Probable Root Cause: "${solutionNode.probableRootCause || 'Unspecified'}"`;

    if (activeScannedAsset) {
      summaryPrompt += `\n\nTarget Hardware Asset Tag: [${activeScannedAsset.assetTag}] ${activeScannedAsset.model} (${activeScannedAsset.deviceType})
Assigned Bench: ${activeScannedAsset.assignedBench} | Serial: ${activeScannedAsset.serialNumber}
Specifications: CPU: ${activeScannedAsset.specs.cpu || 'N/A'}, RAM: ${activeScannedAsset.specs.ram || 'N/A'}, Motherboard: ${activeScannedAsset.specs.motherboard || 'N/A'}, PSU: ${activeScannedAsset.specs.psu || 'N/A'}
Previous Repairs: ${activeScannedAsset.repairHistory.map((r) => `[${r.date}] ${r.faultReported} -> ${r.diagnosis}`).join('; ') || 'No prior repairs logged'}`;
    }

    summaryPrompt += `\n\nCould you evaluate this diagnosis, provide an advanced second opinion, detail specific multimeter test points / resistance values, and explain any potential gotchas or edge-case motherboard quirks related to this fault?`;

    setActiveTab('gemini');
    sendMessageToGemini(summaryPrompt);
    addToast({
      type: 'info',
      title: 'Transferred to Gemini AI',
      message: 'Decision tree results forwarded to the Bench Repair Chatbot.',
    });
  };

  // Export functions
  const exportDataJson = () => {
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      institution: 'TradeTech Bench Assistant & Diagnostic Lab Suite (Firestore Synced)',
      leadTechnician: currentUser?.displayName || 'Guest Technician',
      calendarLogs,
      activeProjects: projects.filter((p) => p.status === 'ongoing'),
      archivedProjects: projects.filter((p) => p.status === 'archived'),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TradeTech_Firestore_Export_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Data Exported',
      message: 'TradeTech Firestore records exported as clean JSON.',
    });
  };

  const exportDataTxt = (): string => {
    let report = `=======================================================================\n`;
    report += `TRADETECH BENCH ASSISTANT - FIRESTORE VOCATIONAL LAB REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Lead Technician / Instructor: ${currentUser?.displayName || 'Guest'} (${currentUser?.role || 'Guest'})\n`;
    report += `=======================================================================\n\n`;

    report += `--- SECTION 1: ACTIVE BENCH WORK ORDERS (FIRESTORE) ---\n`;
    const ongoing = projects.filter((p) => p.status === 'ongoing');
    if (ongoing.length === 0) {
      report += `No active work orders currently logged.\n`;
    } else {
      ongoing.forEach((p, idx) => {
        report += `[${idx + 1}] ${p.title}\n`;
        report += `    Bench: ${p.benchNumber} | Assigned: ${p.technicianName} | Priority: ${p.priority}\n`;
        report += `    Device: ${p.deviceType} | Stage: ${p.stage}\n`;
        report += `    Reported Fault: ${p.reportedFault}\n`;
        if (p.partsReplaced && p.partsReplaced.length > 0) {
          report += `    Parts: ${p.partsReplaced.join(', ')}\n`;
        }
        report += `\n`;
      });
    }

    report += `\n--- SECTION 2: COMPLETED PAST REPAIRS ---\n`;
    const archived = projects.filter((p) => p.status === 'archived');
    archived.forEach((p, idx) => {
      report += `[${idx + 1}] ${p.title} (Completed: ${p.dateCompleted || 'N/A'})\n`;
      report += `    Bench: ${p.benchNumber} | Client/Dept: ${p.clientOrDepartment}\n`;
      report += `    Outcome: ${p.repairOutcomeNotes || 'No notes'}\n\n`;
    });

    report += `\n--- SECTION 3: DAILY ACTIVITY LOGS ---\n`;
    calendarLogs.forEach((log) => {
      report += `Date: ${log.dateString} [Status: ${log.status.toUpperCase()}]\n`;
      report += `Topics: ${log.topicsCovered}\n`;
      report += `Repairs: ${log.benchRepairsPerformed}\n`;
      report += `Parts Used/Ordered: ${log.partsUsedOrOrdered}\n`;
      report += `Special / Safety Notes: ${log.specialNotesAndSafety}\n`;
      report += `-----------------------------------------------------------------------\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `TradeTech_Firestore_Report_${todayStr}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();

    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: 'Printable text bench summary generated.',
    });

    return report;
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        users,
        isOwner,
        isGuest,
        loginUser,
        signupUser,
        signInWithGoogle,
        logoutUser,
        switchUserQuick,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAuthLoading,

        categories,
        activeCategoryId,
        setActiveCategoryId,
        currentNodeId,
        setCurrentNodeId,
        diagnosticHistory,
        selectDiagnosticOption,
        resetDiagnostic,
        jumpToBreadcrumb,
        sendDiagnosticToGemini,

        chatMessages,
        isAiLoading,
        selectedModel,
        setSelectedModel,
        isThinkingMode,
        setIsThinkingMode,
        sendMessageToGemini,
        clearChatHistory,
        getOwnerContextPayload,

        calendarLogs,
        saveCalendarLog,
        selectedDate,
        setSelectedDate,
        projects,
        addProject,
        updateProject,
        archiveProject,
        deleteProject,
        exportDataJson,
        exportDataTxt,

        hardwareAssets,
        activeScannedAsset,
        setActiveScannedAsset,
        isScannerModalOpen,
        setIsScannerModalOpen,
        lookupHardwareAsset,
        saveHardwareAsset,
        addAssetRepairLog,
        deleteHardwareAsset,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
