import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  DiagnosticCategory,
  ChatMessage,
  DailyActivityLog,
  ProjectWorkOrder,
  DiagnosticNode,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DIAGNOSTIC_CATEGORIES,
  INITIAL_CALENDAR_LOGS,
  INITIAL_PROJECT_WORK_ORDERS,
} from '../data/seedData';

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
  loginUser: (username: string, password?: string) => { success: boolean; message: string };
  signupUser: (username: string, password?: string, displayName?: string) => { success: boolean; message: string };
  logoutUser: () => void;
  switchUserQuick: (userId: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

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
  saveCalendarLog: (log: Partial<DailyActivityLog> & { dateString: string }) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  projects: ProjectWorkOrder[];
  addProject: (project: Omit<ProjectWorkOrder, 'id' | 'dateCreated' | 'status'>) => void;
  updateProject: (id: string, updates: Partial<ProjectWorkOrder>) => void;
  archiveProject: (id: string, outcomeNotes: string) => void;
  deleteProject: (id: string) => void;
  exportDataJson: () => void;
  exportDataTxt: () => string;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'tradetech_users_v1',
  CURRENT_USER: 'tradetech_curr_user_v1',
  CALENDAR: 'tradetech_calendar_v1',
  PROJECTS: 'tradetech_projects_v1',
  CHAT: 'tradetech_chat_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('diagnostic');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Users & Auth
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading users from storage:', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading current user:', e);
    }
    // Default to the first owner user for instant exploration
    return INITIAL_USERS[0] || null;
  });

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  }, [users]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Error saving current user:', e);
    }
  }, [currentUser]);

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

  // Auth Operations
  const isOwner = currentUser?.role === 'ROLE_OWNER';

  const loginUser = (username: string, password?: string) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      addToast({ type: 'error', title: 'Login Failed', message: 'Please enter a valid username.' });
      return { success: false, message: 'Username cannot be blank.' };
    }

    const found = users.find((u) => u.username.toLowerCase() === trimmed);
    if (!found) {
      addToast({
        type: 'error',
        title: 'Account Not Found',
        message: `No technician account found matching "${username}". Click "Need an account?" below to sign up.`,
      });
      return { success: false, message: 'User not found in registry.' };
    }

    setCurrentUser(found);
    setIsAuthModalOpen(false);
    addToast({
      type: 'success',
      title: 'Authenticated Successfully',
      message: `Welcome back, ${found.displayName}! Logged in as ${found.role === 'ROLE_OWNER' ? 'Instructor / Lead Tech (Owner)' : 'Bench Tech (Student)'}.`,
    });
    return { success: true, message: 'Login successful' };
  };

  const signupUser = (username: string, password = '', displayName = '') => {
    const trimmed = username.trim().toLowerCase();
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

    const existing = users.find((u) => u.username.toLowerCase() === trimmed);
    if (existing) {
      addToast({
        type: 'error',
        title: 'Username Taken',
        message: `The username "${username}" is already assigned to a bench technician.`,
      });
      return { success: false, message: 'Username is already taken.' };
    }

    // Automatic Owner Elevation Rule:
    // If there are zero accounts in registry, or this is the very first account, grant ROLE_OWNER.
    const isFirstAccount = users.length === 0;
    const assignedRole = isFirstAccount ? 'ROLE_OWNER' : 'ROLE_STUDENT';

    const newUser: User = {
      id: 'user_' + Date.now(),
      username: trimmed,
      displayName: displayName.trim() || username,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      benchStation: isFirstAccount ? 'Instructor Master Station #1' : `Student Station #${users.length + 1}`,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);

    addToast({
      type: 'success',
      title: 'Account Registered',
      message: isFirstAccount
        ? `First Registered User Elevation: You have been granted ROLE_OWNER (Instructor/Lead Tech)!`
        : `Technician account created with ROLE_STUDENT permissions. Welcome to the lab!`,
    });

    return { success: true, message: 'Account created successfully.' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have logged out of TradeTech Bench Assistant.',
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

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

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

  // Lab Calendar & Projects
  const [calendarLogs, setCalendarLogs] = useState<DailyActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading calendar:', e);
    }
    return INITIAL_CALENDAR_LOGS;
  });

  const [projects, setProjects] = useState<ProjectWorkOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading projects:', e);
    }
    return INITIAL_PROJECT_WORK_ORDERS;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarLogs));
    } catch (e) {
      console.error('Error saving calendar:', e);
    }
  }, [calendarLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects:', e);
    }
  }, [projects]);

  const saveCalendarLog = (logData: Partial<DailyActivityLog> & { dateString: string }) => {
    setCalendarLogs((prev) => {
      const idx = prev.findIndex((item) => item.dateString === logData.dateString);
      const newEntry: DailyActivityLog = {
        id: idx >= 0 ? prev[idx].id : 'log_' + Date.now(),
        dateString: logData.dateString,
        status: logData.status || 'in_progress',
        topicsCovered: logData.topicsCovered || '',
        benchRepairsPerformed: logData.benchRepairsPerformed || '',
        partsUsedOrOrdered: logData.partsUsedOrOrdered || '',
        specialNotesAndSafety: logData.specialNotesAndSafety || '',
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newEntry;
        return updated;
      } else {
        return [...prev, newEntry];
      }
    });

    addToast({
      type: 'success',
      title: 'Lab Activity Saved',
      message: `Activity log updated for date: ${logData.dateString}. Synchronized with AI context.`,
    });
  };

  const addProject = (p: Omit<ProjectWorkOrder, 'id' | 'dateCreated' | 'status'>) => {
    const newProject: ProjectWorkOrder = {
      ...p,
      id: 'wo_' + Date.now().toString().substring(6),
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'ongoing',
    };
    setProjects((prev) => [newProject, ...prev]);
    addToast({
      type: 'success',
      title: 'Work Order Created',
      message: `Added: ${newProject.title} to Bench ${newProject.benchNumber}`,
    });
  };

  const updateProject = (id: string, updates: Partial<ProjectWorkOrder>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );
    addToast({
      type: 'info',
      title: 'Work Order Updated',
      message: 'Project status and bench notes have been updated.',
    });
  };

  const archiveProject = (id: string, outcomeNotes: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === id
          ? {
              ...proj,
              status: 'archived',
              stage: 'Completed',
              dateCompleted: new Date().toISOString().split('T')[0],
              repairOutcomeNotes: outcomeNotes,
            }
          : proj
      )
    );
    addToast({
      type: 'success',
      title: 'Project Archived',
      message: 'Repair successfully moved to Completed Bench History.',
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast({
      type: 'warning',
      title: 'Work Order Removed',
      message: 'Work order was deleted from the bench board.',
    });
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading chat:', e);
    }
    return [
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
    ];
  });

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'
  >('gemini-3.8-flash');
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Error saving chat:', e);
    }
  }, [chatMessages]);

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
      // Build owner context
      const ownerContext = isOwner ? getOwnerContextPayload() : '';
      const baseSystemPrompt = `You are the TradeTech Bench Assistant, an expert Master PC Technician, Cisco CCNA, and CompTIA A+ Vocational Trade School Instructor.
Your audience includes computer repair technicians, vocational trade students, and shop lead techs.
Give precise, actionable, electrical and architectural advice.
Use clear Markdown formatting with bold headings, bullet lists, pin numbers, specific multimeter test points (expected voltages, tolerance ranges), and diagnostic safety precautions (ESD, dangerous high-voltage capacitors).
If the user provides an image, carefully analyze the visual hardware clues (e.g. burn marks, swollen caps, unseated RAM, bent pins, thermal paste spillage).
${ownerContext ? `\nActive Lab Master Context:\n${ownerContext}\n*Notice: You have access to the above bench context. Reference active projects and lab notes when answering to provide personalized shop assistance.*` : ''}
`;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: chatMessages.slice(-8), // Send recent context turns
          systemInstruction: baseSystemPrompt,
          model: selectedModel,
          thinkingMode: isThinkingMode,
          image: image || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error.');
      }

      const botReply: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'No response received from diagnostic assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        contextInjected: !!ownerContext,
      };

      setChatMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'bot_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Diagnostic Bridge Notice:** ${err.message || 'Unable to connect to Gemini engine.'}\n\n*Bench Fallback Tip: Double check standard ATX Power Good delay and single-channel RAM seating.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendDiagnosticToGemini = (solutionNode: any, categoryName: string, path: string[]) => {
    const summaryPrompt = `I just completed a diagnostic session in the "${categoryName}" wizard.
Path taken: ${path.join(' ➔ ')}
Preliminary Result: "${solutionNode.title || 'Hardware Fault'}"
Probable Root Cause: "${solutionNode.probableRootCause || 'Unspecified'}"

Could you evaluate this diagnosis, provide an advanced second opinion, detail specific multimeter test points / resistance values, and explain any potential gotchas or edge-case motherboard quirks related to this fault?`;

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
      institution: 'TradeTech Bench Assistant & Diagnostic Lab Suite',
      leadTechnician: currentUser?.displayName || 'Unauthenticated Session',
      calendarLogs,
      activeProjects: projects.filter((p) => p.status === 'ongoing'),
      archivedProjects: projects.filter((p) => p.status === 'archived'),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TradeTech_Lab_Export_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Data Exported',
      message: 'TradeTech database exported as clean JSON.',
    });
  };

  const exportDataTxt = (): string => {
    let report = `=======================================================================\n`;
    report += `TRADETECH BENCH ASSISTANT - VOCATIONAL LAB SUMMARY REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Lead Technician / Instructor: ${currentUser?.displayName || 'N/A'} (${currentUser?.role || 'Guest'})\n`;
    report += `=======================================================================\n\n`;

    report += `--- SECTION 1: ACTIVE BENCH WORK ORDERS ---\n`;
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

    // Auto download text file
    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `TradeTech_Bench_Report_${todayStr}.txt`;
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
        loginUser,
        signupUser,
        logoutUser,
        switchUserQuick,
        isAuthModalOpen,
        setIsAuthModalOpen,

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
