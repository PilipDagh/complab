import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Compass,
  Cpu,
  Monitor,
  Tag,
  ShieldCheck,
  Settings,
  BookOpen,
  Zap,
} from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tabHint?: string;
  badge?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-brand',
    title: 'Welcome to TradeTech Bench Assistant',
    description:
      'The unified vocational engineering workspace for Fred W. Eberle Technical Center. Designed for hands-on PC repair, CompTIA A+ hardware triage, and shop management.',
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    badge: 'Overview',
  },
  {
    targetId: 'tour-modules',
    title: '6 Vocational Engineering Modules',
    description:
      'Explore 6 specialized lab suites: 01. Board-Level Triage, 02. Network & SysAdmin, 03. CompTIA Certification, 04. Lab Floor Operations, 05. Forensics & Firmware, and 06. Signals & Scopes.',
    icon: <Cpu className="w-5 h-5 text-sky-400" />,
    badge: 'Diagnostics',
  },
  {
    targetId: 'tour-comlab',
    title: 'ComLab Status Aerial Twin',
    description:
      'Enter an ultra-immersive full-screen top-down digital twin of the lab workstation rows A through D. Spot unplugged cables, hardware emergencies, and bench telemetry in real-time.',
    icon: <Monitor className="w-5 h-5 text-emerald-400" />,
    badge: 'Digital Twin',
  },
  {
    targetId: 'tour-assets',
    title: 'Asset Inventory & AI Photo Autofill',
    description:
      'Track laptops, towers, and network gear. Snap a photo of any serial number or bottom QR sticker—Gemini AI vision automatically decodes and autofills specs, leaving you to just mark defects.',
    icon: <Tag className="w-5 h-5 text-purple-400" />,
    badge: 'AI Vision',
  },
  {
    targetId: 'tour-roles',
    title: 'Vocational Job Assignments & Quick Tools',
    description:
      'Technicians receive assigned shop roles (Safety Manager, Foreman, Ambassador, Environment, Asset, Clock In, Cart, and Teacher Mr. McKismic) with custom 1-click Quick Action bars while keeping full platform access.',
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
    badge: 'Roles',
  },
  {
    targetId: 'tour-settings',
    title: 'Settings & Theme Switcher',
    description:
      'Toggle seamlessly between the Dark Industrial theme and the High Contrast Light mode designed for bright technical classrooms and digital projectors.',
    icon: <Settings className="w-5 h-5 text-teal-400" />,
    badge: 'Customization',
  },
  {
    targetId: 'tour-manual',
    title: 'Full Website Field Manual',
    description:
      'Need a refresher at any time? The new Manual tab provides comprehensive, easy-to-read documentation explaining every module, tool, procedure, and shortcut on the site.',
    icon: <BookOpen className="w-5 h-5 text-cyan-300" />,
    badge: 'Documentation',
  },
];

export const OnboardingTour: React.FC = () => {
  const { isTourOpen, closeTour, setActiveTab } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Update target bounding box
  useEffect(() => {
    if (!isTourOpen) return;

    const updateRect = () => {
      const el = document.querySelector(`[data-tour="${step.targetId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isTourOpen, currentStepIndex, step.targetId]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTour(true);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, currentStepIndex]);

  if (!isTourOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      closeTour(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    closeTour(true);
  };

  // Determine tooltip placement based on target
  let tooltipTop = '50%';
  let tooltipLeft = '50%';
  let transform = 'translate(-50%, -50%)';

  if (targetRect) {
    const isMobile = window.innerWidth < 768;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;

    if (isMobile) {
      // On mobile, stick to bottom of screen with padding
      tooltipTop = 'auto';
      tooltipLeft = '16px';
      transform = 'none';
    } else {
      // Desktop: place below target if space permits, else above
      if (targetRect.bottom + 260 < window.innerHeight) {
        tooltipTop = `${targetRect.bottom + 16}px`;
        tooltipLeft = `${Math.max(20, Math.min(window.innerWidth - 440, targetCenterX - 200))}px`;
        transform = 'none';
      } else {
        tooltipTop = `${Math.max(20, targetRect.top - 240)}px`;
        tooltipLeft = `${Math.max(20, Math.min(window.innerWidth - 440, targetCenterX - 200))}px`;
        transform = 'none';
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* Darkened Spotlight Backdrop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 7, 18, 0.82)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Glowing Target Ring */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Floating Spotlight Card */}
      <div
        className="fixed z-50 w-[calc(100vw-32px)] max-w-md bg-[#0f172a] text-gray-100 rounded-2xl border border-cyan-500/40 shadow-2xl p-5 font-mono text-xs transition-all duration-300"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          bottom: tooltipTop === 'auto' ? '20px' : 'auto',
          transform,
        }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-inner">
              {step.icon}
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider uppercase">
                {step.badge}
              </span>
              <span className="text-[10px] text-gray-400 ml-2">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Content */}
        <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
          {step.title}
        </h4>
        <p className="text-gray-300 text-[11px] leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex
                    ? 'w-5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                    : 'w-1.5 bg-gray-700 hover:bg-gray-500'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition-all"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
