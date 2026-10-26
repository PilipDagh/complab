import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ComLabWorkstation,
  ComLabStatusLevel,
  ComLabTelemetryPayload,
} from '../../types';
import { ComLabCanvasEngine } from './ComLabCanvasEngine';
import { WorkstationStatusModal } from './WorkstationStatusModal';
import { AgentTelemetryDocsModal } from './AgentTelemetryDocsModal';
import { TelemetryLiveSimulator } from './TelemetryLiveSimulator';
import { ConnectAgentModal } from './ConnectAgentModal';

export const ComLabStatusSuite: React.FC = () => {
  const {
    comLabWorkstations,
    isOwner,
    users,
    switchUserQuick,
    openAuthModal,
    updateComLabWorkstationStatus,
    exitComLab,
    addToast,
  } = useApp();

  // Selected workstation for modal inspection
  const [selectedWorkstation, setSelectedWorkstation] = useState<ComLabWorkstation | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Secondary tools modals (accessible via sleek HUD icons)
  const [isConnectAgentOpen, setIsConnectAgentOpen] = useState(false);
  const [isTelemetrySimulatorOpen, setIsTelemetrySimulatorOpen] = useState(false);
  const [isTelemetryDocsOpen, setIsTelemetryDocsOpen] = useState(false);

  // Cinematic fade-to-black entry/exit transition state (600ms)
  const [transitionState, setTransitionState] = useState<'entering' | 'idle' | 'exiting'>('entering');

  // Real-Time Zero-Latency Server-Sent Events (SSE) telemetry stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/comlab/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init' && Array.isArray(data.workstations)) {
            data.workstations.forEach((ws: ComLabWorkstation) => {
              updateComLabWorkstationStatus(ws.id, ws);
            });
          } else if (data.type === 'telemetry_update' && data.workstation) {
            updateComLabWorkstationStatus(data.pcId, data.workstation);
          }
        } catch {
          // ignore keepalive comments
        }
      };

      eventSource.onerror = () => {
        // Browser automatically retries SSE connection
      };
    } catch (e) {
      console.warn('SSE stream notice:', e);
    }

    return () => {
      eventSource?.close();
    };
  }, [updateComLabWorkstationStatus]);

  useEffect(() => {
    // Attempt fullscreen on entry safely
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignore if sandbox prevents fullscreen
    }

    // Fade in from black over 600ms
    const timer = setTimeout(() => {
      setTransitionState('idle');
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Handle Exit Lab View with cinematic fade-to-black transition
  const handleExitLabView = () => {
    setTransitionState('exiting');
    setTimeout(() => {
      exitComLab();
    }, 600);
  };

  // Keep selected workstation in sync if updated in the background
  const currentSelectedWorkstation = selectedWorkstation
    ? comLabWorkstations.find((ws) => ws.id === selectedWorkstation.id) || selectedWorkstation
    : null;

  // Handle incoming automated telemetry payload from either window event or live simulator
  const handleIngestTelemetry = useCallback(
    async (payload: ComLabTelemetryPayload) => {
      const normalizedId = payload.pc_id.startsWith('pc_')
        ? payload.pc_id
        : `pc_${payload.pc_id.replace(/^([A-Da-d])(\d)$/, '$1_$2')}`;

      const targetWs = comLabWorkstations.find(
        (ws) =>
          ws.id.toLowerCase() === normalizedId.toLowerCase() ||
          ws.displayName.toLowerCase() === `pc ${payload.pc_id}`.toLowerCase() ||
          ws.displayName.toLowerCase() === payload.pc_id.toLowerCase()
      );

      if (!targetWs) {
        console.warn('Unknown PC target in telemetry event:', payload.pc_id);
        return;
      }

      const statusMap: Record<string, ComLabStatusLevel> = {
        BLINKING_RED: 'red',
        RED: 'red',
        ORANGE: 'orange',
        GREEN: 'green',
        BLANK: 'unconfigured',
        UNCONFIGURED: 'unconfigured',
      };

      const newLevel: ComLabStatusLevel = statusMap[payload.status] || 'unconfigured';
      const hasHardware =
        payload.hardware_detected &&
        (!!payload.hardware_detected.cpu ||
          (payload.hardware_detected.ram_gb ?? 0) > 0 ||
          (payload.hardware_detected.storage_count ?? 0) > 0);

      await updateComLabWorkstationStatus(targetWs.id, {
        statusLevel: newLevel,
        powerState: payload.power_connected ? 'powered_on' : 'no_power_cable',
        ethernetConnected: payload.ethernet_connected ?? true,
        isConfigured: true,
        issueDescription: payload.alert_message || targetWs.issueDescription,
        notes: payload.notes || targetWs.notes,
        lastInspected: new Date().toISOString(),
        components: {
          hasParts: hasHardware,
          cpu: payload.hardware_detected?.cpu || (hasHardware ? targetWs.components.cpu : 'MISSING (Empty Socket)'),
          ram: payload.hardware_detected?.ram_gb
            ? `${payload.hardware_detected.ram_gb}GB DDR4`
            : hasHardware
            ? targetWs.components.ram
            : 'MISSING (0 DIMMs)',
          storage:
            payload.hardware_detected?.storage_count && payload.hardware_detected.storage_count > 0
              ? `${payload.hardware_detected.storage_count}x NVMe/SSD`
              : hasHardware
              ? targetWs.components.storage
              : 'MISSING',
          gpu: payload.hardware_detected?.gpu || targetWs.components.gpu,
          motherboard: payload.hardware_detected?.motherboard || targetWs.components.motherboard,
          powerSupply: payload.hardware_detected?.power_supply || targetWs.components.powerSupply,
          cpuCooler: payload.hardware_detected?.cpu_cooler || targetWs.components.cpuCooler,
          missingPartsDescription: !hasHardware
            ? payload.alert_message || 'Chassis completely empty — ZERO parts inside.'
            : undefined,
        },
      });
    },
    [comLabWorkstations, updateComLabWorkstationStatus]
  );

  // Listen to window-level 'comlab:telemetry' CustomEvent
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ComLabTelemetryPayload>;
      if (customEvent.detail) {
        handleIngestTelemetry(customEvent.detail);
      }
    };

    window.addEventListener('comlab:telemetry', handleCustomEvent);
    return () => window.removeEventListener('comlab:telemetry', handleCustomEvent);
  }, [handleIngestTelemetry]);

  // Handle Workstation Node click
  const handleSelectWorkstation = (ws: ComLabWorkstation) => {
    setSelectedWorkstation(ws);
    setIsStatusModalOpen(true);
  };

  // Toggle user profile between Julian (Owner/Admin) and Student (Guest)
  const handleToggleAdminMode = () => {
    if (isOwner) {
      const studentUser = users.find((u) => u.role === 'ROLE_STUDENT');
      if (studentUser) {
        switchUserQuick(studentUser.id);
        addToast({
          type: 'info',
          title: 'Switched to Student View',
          message: 'Viewing ComLab in student inspection mode.',
        });
      } else {
        openAuthModal('profiles_menu');
      }
    } else {
      const julian = users.find((u) => u.username === 'julian' || u.role === 'ROLE_OWNER') || users[0];
      if (julian) {
        switchUserQuick(julian.id);
        addToast({
          type: 'success',
          title: 'Owner / Admin Mode Activated',
          message: 'Signed in as Julian (Owner). Full node status editing unlocked.',
        });
      } else {
        openAuthModal('profiles_menu');
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030508] text-gray-100 select-none">
      {/* Total Screen Fade-To-Black Overlay for Entry & Exit Transitions */}
      <div
        className={`fixed inset-0 z-50 bg-[#030508] pointer-events-none transition-opacity duration-600 ease-in-out ${
          transitionState === 'entering' || transitionState === 'exiting'
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      />

      {/* Endless Space Pan & Smooth Zoom Canvas Engine */}
      <ComLabCanvasEngine
        workstations={comLabWorkstations}
        onSelectWorkstation={handleSelectWorkstation}
        onExitLabView={handleExitLabView}
        onOpenTelemetrySimulator={() => setIsTelemetrySimulatorOpen(true)}
        onOpenApiDocs={() => setIsTelemetryDocsOpen(true)}
        onOpenConnectAgent={() => setIsConnectAgentOpen(true)}
        isOwner={isOwner}
        onToggleAdminMode={handleToggleAdminMode}
      />

      {/* Workstation Advanced Status & Diagnostics Inspection Modal */}
      <WorkstationStatusModal
        workstation={currentSelectedWorkstation}
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedWorkstation(null);
        }}
      />

      {/* Connect Physical PC / Agent Setup Modal */}
      <ConnectAgentModal
        isOpen={isConnectAgentOpen}
        onClose={() => setIsConnectAgentOpen(false)}
        workstations={comLabWorkstations}
        onSelectWorkstation={handleSelectWorkstation}
      />

      {/* Live Telemetry Heartbeat Dispatcher Simulator */}
      <TelemetryLiveSimulator
        isOpen={isTelemetrySimulatorOpen}
        onClose={() => setIsTelemetrySimulatorOpen(false)}
        onDispatchPayload={handleIngestTelemetry}
      />

      {/* Telemetry Agent Documentation Modal */}
      <AgentTelemetryDocsModal
        isOpen={isTelemetryDocsOpen}
        onClose={() => setIsTelemetryDocsOpen(false)}
      />
    </div>
  );
};
