import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ComLabWorkstation, ComLabStatusLevel } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LogOut,
  Radio,
  FileCode,
  Shield,
  UserCheck,
  User,
  Sliders,
  CheckCircle,
  AlertTriangle,
  ZapOff,
} from 'lucide-react';

interface ComLabCanvasEngineProps {
  workstations: ComLabWorkstation[];
  onSelectWorkstation: (ws: ComLabWorkstation) => void;
  onExitLabView: () => void;
  onOpenTelemetrySimulator: () => void;
  onOpenApiDocs: () => void;
  isOwner: boolean;
  onToggleAdminMode: () => void;
}

// Fixed dimensions for the lab spatial coordinate space
const LAB_WIDTH = 1200;
const LAB_HEIGHT = 980;

// Deterministic fine star particle field
const STAR_PARTICLES = Array.from({ length: 90 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const x = (seed % LAB_WIDTH);
  const y = ((seed * 7) % LAB_HEIGHT);
  const size = (i % 3 === 0 ? 1.8 : i % 2 === 0 ? 1.2 : 0.8);
  const opacity = 0.15 + ((i % 5) * 0.14);
  return { id: i, x, y, size, opacity };
});

export const ComLabCanvasEngine: React.FC<ComLabCanvasEngineProps> = ({
  workstations,
  onSelectWorkstation,
  onExitLabView,
  onOpenTelemetrySimulator,
  onOpenApiDocs,
  isOwner,
  onToggleAdminMode,
}) => {
  // Canvas transform state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isExitHovered, setIsExitHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Bounds for zoom (0.3x to 3.0x as requested)
  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3.0;

  // Center and fit canvas neatly into the full viewport
  const centerCanvas = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const scaleX = (clientWidth - 60) / LAB_WIDTH;
    const scaleY = (clientHeight - 60) / LAB_HEIGHT;
    const optimalScale = Math.min(scaleX, scaleY, 1.15);
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, optimalScale));

    const centerX = (clientWidth - LAB_WIDTH * clampedScale) / 2;
    const centerY = (clientHeight - LAB_HEIGHT * clampedScale) / 2;

    setScale(Number(clampedScale.toFixed(2)));
    setPan({ x: Math.round(centerX), y: Math.round(centerY) });
  }, []);

  useEffect(() => {
    centerCanvas();
    window.addEventListener('resize', centerCanvas);
    return () => window.removeEventListener('resize', centerCanvas);
  }, [centerCanvas]);

  // Handle zoom in / out increments
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleResetZoom = () => {
    centerCanvas();
  };

  // Scroll wheel for ultra-smooth inertia zooming anchored to mouse cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * zoomFactor));

    if (Math.abs(newScale - scale) < 0.001) return;

    // Anchor zoom to mouse pointer
    const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
    const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

    setScale(Number(newScale.toFixed(3)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Mouse / Pointer drag panning (Supports BOTH Left-Click + Drag OR Right-Click + Drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Left click (0), middle click (1), or right click (2)
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: pan.x, y: pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasMoved(true);
    }

    setPan({
      x: Math.round(panStart.x + dx),
      y: Math.round(panStart.y + dy),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent browser context menu on right-click so right-drag works seamlessly
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Touch handlers for mobile (Single finger pan, two-finger pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setHasMoved(false);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setPanStart({ x: pan.x, y: pan.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      lastTouchDistRef.current = dist;
      lastTouchCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true);
      }
      setPan({
        x: Math.round(panStart.x + dx),
        y: Math.round(panStart.y + dy),
      });
    } else if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = currentDist / lastTouchDistRef.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));

      if (containerRef.current && lastTouchCenterRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = lastTouchCenterRef.current.x - rect.left;
        const centerY = lastTouchCenterRef.current.y - rect.top;

        const newPanX = centerX - (centerX - pan.x) * (newScale / scale);
        const newPanY = centerY - (centerY - pan.y) * (newScale / scale);

        setScale(Number(newScale.toFixed(3)));
        setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
      }

      lastTouchDistRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
  };

  // Map workstations by row and slot for instant O(1) lookup
  const wsMap = useMemo(() => {
    const map = new Map<string, ComLabWorkstation>();
    workstations.forEach((ws) => {
      map.set(`${ws.rowLabel}_${ws.slotNumber}`, ws);
    });
    return map;
  }, [workstations]);

  // Click on a node (guaranteed to not fire if user was dragging/panning)
  const handleNodeClick = (ws: ComLabWorkstation) => {
    if (!hasMoved) {
      onSelectWorkstation(ws);
    }
  };

  const handleExitClick = () => {
    if (!hasMoved) {
      onExitLabView();
    }
  };

  // Workstation slot layout definition (Strictly RIGHT-TO-LEFT)
  // Slot 1 is on the far right (X = 890), Slot 4 is on the far left (X = 230)
  const SLOT_COORDINATES = [
    { slot: 4, x: 220 }, // Far Left
    { slot: 3, x: 440 },
    { slot: 2, x: 660 },
    { slot: 1, x: 880 }, // Far Right
  ];

  const DESK_WIDTH = 190;
  const DESK_HEIGHT = 100;

  // Island 1: Row A (Front) and Row B (Rear)
  // Island 2: Row C (Front) and Row D (Rear)
  const ROW_Y = {
    A: 220,
    B: 370,
    C: 600,
    D: 750,
  };

  // Helper to render LED indicator dot
  const renderLedDot = (status: ComLabStatusLevel | undefined) => {
    if (status === 'green') {
      return (
        <circle
          cx="170"
          cy="18"
          r="4.5"
          fill="#10b981"
          className="animate-glow-green"
          stroke="#059669"
          strokeWidth="1"
        />
      );
    }
    if (status === 'orange') {
      return (
        <circle
          cx="170"
          cy="18"
          r="4.5"
          fill="#f59e0b"
          className="animate-glow-orange"
          stroke="#d97706"
          strokeWidth="1"
        />
      );
    }
    if (status === 'red') {
      return (
        <circle
          cx="170"
          cy="18"
          r="5"
          fill="#ef4444"
          className="animate-strobe-1hz"
          stroke="#b91c1c"
          strokeWidth="1"
        />
      );
    }
    // Muted/gray unconfigured dot
    return (
      <circle
        cx="170"
        cy="18"
        r="4"
        fill="#64748b"
        stroke="#475569"
        strokeWidth="1"
        opacity="0.75"
      />
    );
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden bg-[#030508] select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* SVG Spatial Canvas Viewport */}
      <svg
        className="w-full h-full pointer-events-none"
        style={{
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Subtle deep-space nebula radial gradients */}
          <radialGradient id="nebula1" cx="30%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#1e1b4b" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#030508" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula2" cx="75%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#030508" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula3" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.03" />
            <stop offset="70%" stopColor="#030508" stopOpacity="0" />
          </radialGradient>

          {/* Circuit board trace glow */}
          <filter id="traceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Monitor glass drop shadow */}
          <filter id="monitorShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Dynamic Panning & Zooming Spatial World Container */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}
          className="pointer-events-auto"
        >
          {/* Deep Space Atmosphere & Nebulae */}
          <rect
            x="-400"
            y="-400"
            width={LAB_WIDTH + 800}
            height={LAB_HEIGHT + 800}
            fill="#030508"
          />
          <rect
            x="0"
            y="0"
            width={LAB_WIDTH}
            height={LAB_HEIGHT}
            fill="url(#nebula1)"
          />
          <rect
            x="0"
            y="0"
            width={LAB_WIDTH}
            height={LAB_HEIGHT}
            fill="url(#nebula2)"
          />
          <rect
            x="0"
            y="0"
            width={LAB_WIDTH}
            height={LAB_HEIGHT}
            fill="url(#nebula3)"
          />

          {/* Fine Star Particle Field */}
          {STAR_PARTICLES.map((star) => (
            <circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="#ffffff"
              opacity={star.opacity}
            />
          ))}

          {/* Minimal Schematic Room Boundary Grid Lines */}
          <rect
            x="180"
            y="40"
            width="930"
            height="860"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.08"
          />

          {/* Circuit-board trace lines connecting bench clusters to Master Server Switch */}
          <g opacity="0.4" filter="url(#traceGlow)">
            {/* Main bus trunk from server rack */}
            <path
              d="M 180 80 L 140 80 L 140 345 L 210 345"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <path
              d="M 140 345 L 140 725 L 210 725"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <circle cx="140" cy="80" r="3" fill="#38bdf8" />
            <circle cx="140" cy="345" r="3" fill="#38bdf8" />
            <circle cx="140" cy="725" r="3" fill="#38bdf8" />
          </g>

          {/* ========================================================= */}
          {/* 1. FRONT MARKER: WHITEBOARD & PROJECTOR WALL / INSTRUCTOR */}
          {/* ========================================================= */}
          <g transform="translate(180, 50)">
            {/* Whiteboard Frame */}
            <rect
              x="120"
              y="0"
              width="690"
              height="36"
              rx="4"
              fill="#060911"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              opacity="0.85"
            />
            <rect
              x="124"
              y="4"
              width="682"
              height="28"
              rx="2"
              fill="#0b1120"
            />
            <text
              x="465"
              y="22"
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="700"
              fontFamily="monospace"
              letterSpacing="0.25em"
            >
              WHITEBOARD & PROJECTOR WALL • INSTRUCTOR ZONE
            </text>

            {/* Central Projector Beam Glow Trap */}
            <polygon
              points="415,36 515,36 565,110 365,110"
              fill="#38bdf8"
              opacity="0.03"
            />

            {/* Master Server Rack / Switch Cabinet */}
            <g transform="translate(850, -10)">
              <rect
                x="0"
                y="0"
                width="64"
                height="56"
                rx="5"
                fill="#0a0f1d"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <text
                x="32"
                y="18"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="8"
                fontWeight="800"
                fontFamily="monospace"
              >
                SWITCH
              </text>
              <text
                x="32"
                y="28"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="7"
                fontFamily="monospace"
              >
                RACK 01
              </text>
              {/* Flashing switch activity LEDs */}
              <circle cx="14" cy="42" r="2" fill="#10b981" className="animate-pulse" />
              <circle cx="26" cy="42" r="2" fill="#10b981" className="animate-pulse" />
              <circle cx="38" cy="42" r="2" fill="#38bdf8" className="animate-pulse" />
              <circle cx="50" cy="42" r="2" fill="#f59e0b" className="animate-pulse" />
            </g>
          </g>

          {/* ========================================================= */}
          {/* 2. FLOATING EXIT DOOR MECHANISM: "EXIT LAB VIEW"          */}
          {/* ========================================================= */}
          {/* Positioned floating above and to the left of Row A */}
          <g
            transform="translate(45, 120)"
            className="cursor-pointer group"
            onClick={handleExitClick}
            onMouseEnter={() => setIsExitHovered(true)}
            onMouseLeave={() => setIsExitHovered(false)}
          >
            {/* Outer Door Frame with high-tech outline */}
            <rect
              x="0"
              y="0"
              width="105"
              height="150"
              rx="6"
              fill={isExitHovered ? '#081226' : '#040813'}
              stroke={isExitHovered ? '#38bdf8' : '#e2e8f0'}
              strokeWidth={isExitHovered ? '2' : '1.5'}
              className="transition-colors duration-200"
              filter={isExitHovered ? 'url(#traceGlow)' : undefined}
            />

            {/* Glowing Emergency Exit Sign Board */}
            <rect
              x="12"
              y="12"
              width="81"
              height="28"
              rx="4"
              fill={isExitHovered ? '#10b981' : '#064e3b'}
              stroke="#34d399"
              strokeWidth="1.2"
              className="animate-door-glow"
            />
            <text
              x="52"
              y="30"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="0.1em"
            >
              EXIT
            </text>

            {/* Door Leaf & Push Bar Graphic */}
            <rect
              x="12"
              y="48"
              width="81"
              height="90"
              rx="3"
              fill="#0a0f1d"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Push bar hardware */}
            <line
              x1="20"
              y1="90"
              x2="85"
              y2="90"
              stroke={isExitHovered ? '#38bdf8' : '#94a3b8'}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Glowing Label Below Door */}
            <text
              x="52"
              y="160"
              textAnchor="middle"
              fill={isExitHovered ? '#38bdf8' : '#ffffff'}
              fontSize="9.5"
              fontWeight="700"
              fontFamily="monospace"
              letterSpacing="0.08em"
              className="transition-colors duration-200"
            >
              EXIT LAB VIEW
            </text>
            <text
              x="52"
              y="172"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7.5"
              fontFamily="sans-serif"
            >
              (Click to return)
            </text>
          </g>

          {/* ========================================================= */}
          {/* 3. ISLAND ASSEMBLY 1: ROW A & ROW B (BACK-TO-BACK)        */}
          {/* ========================================================= */}

          {/* Row A Workstations (Front, facing whiteboard) */}
          <g>
            {SLOT_COORDINATES.map(({ slot, x }) => {
              const ws = wsMap.get(`A_${slot}`);
              const isHovered = hoveredNodeId === `A_${slot}`;

              // Row A Slot 4 is designated as [EMPTY DESK SPACE]
              if (slot === 4) {
                return (
                  <g
                    key={`A_slot_${slot}`}
                    transform={`translate(${x}, ${ROW_Y.A})`}
                    className="cursor-default"
                  >
                    {/* Empty Desk Space dashed wireframe */}
                    <rect
                      x="0"
                      y="0"
                      width={DESK_WIDTH}
                      height={DESK_HEIGHT}
                      rx="8"
                      fill="#070a12"
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="6 5"
                      opacity="0.6"
                    />
                    <text
                      x={DESK_WIDTH / 2}
                      y={DESK_HEIGHT / 2 - 4}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.1em"
                    >
                      [EMPTY DESK SPACE]
                    </text>
                    <text
                      x={DESK_WIDTH / 2}
                      y={DESK_HEIGHT / 2 + 14}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      SLOT A4 • OPEN WIREFRAME
                    </text>
                  </g>
                );
              }

              if (!ws) return null;

              return (
                <g
                  key={ws.id}
                  transform={`translate(${x}, ${ROW_Y.A})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(ws)}
                  onMouseEnter={() => setHoveredNodeId(`A_${slot}`)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Realistic Matte Dark Gray Desk Surface */}
                  <rect
                    x="0"
                    y="0"
                    width={DESK_WIDTH}
                    height={DESK_HEIGHT}
                    rx="8"
                    fill={isHovered ? '#161e2e' : '#101622'}
                    stroke={isHovered ? '#38bdf8' : '#222f44'}
                    strokeWidth={isHovered ? '2' : '1.5'}
                    className="transition-colors duration-200"
                  />

                  {/* Clean Crisp White Monospace Identifier printed directly on desk surface */}
                  <text
                    x="24"
                    y="42"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    A{slot}
                  </text>
                  <text
                    x="24"
                    y="56"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    PC A{slot}
                  </text>

                  {/* Monitor Top Profile Silhouette */}
                  <g transform="translate(68, 12)" filter="url(#monitorShadow)">
                    {/* Monitor Stand Base */}
                    <rect x="28" y="10" width="16" height="8" rx="2" fill="#1e293b" />
                    {/* Monitor Screen Bezel */}
                    <rect
                      x="0"
                      y="0"
                      width="72"
                      height="8"
                      rx="2"
                      fill="#0b0f19"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  </g>

                  {/* ATX Tower Silhouette */}
                  <g transform="translate(150, 22)">
                    <rect
                      x="0"
                      y="0"
                      width="28"
                      height="56"
                      rx="3"
                      fill="#070a12"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    {/* Tower top fan exhaust grill */}
                    <line x1="6" y1="12" x2="22" y2="12" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="16" x2="22" y2="16" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="20" x2="22" y2="20" stroke="#334155" strokeWidth="1" />
                  </g>

                  {/* Mechanical Keyboard Top-View Outline */}
                  <g transform="translate(64, 42)">
                    <rect
                      x="0"
                      y="0"
                      width="54"
                      height="22"
                      rx="2"
                      fill="#0d131f"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    {/* Spacebar keycap outline */}
                    <rect x="14" y="14" width="26" height="4" rx="1" fill="#1e293b" />
                  </g>

                  {/* Mousepad & Optical Mouse */}
                  <g transform="translate(124, 44)">
                    <rect x="0" y="0" width="18" height="22" rx="2" fill="#131c2d" />
                    <rect x="3" y="3" width="12" height="16" rx="5" fill="#090d16" stroke="#334155" strokeWidth="0.8" />
                  </g>

                  {/* Ergonomic Chair Backrest (Facing Desk toward top/south) */}
                  <path
                    d="M 70 88 C 80 82, 108 82, 118 88"
                    fill="none"
                    stroke="#273549"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Single Glowing LED Light Dot in top-right corner of monitor/tower */}
                  {renderLedDot(ws.statusLevel)}
                </g>
              );
            })}
          </g>

          {/* Central Horizontal Cable Trunking Barrier 1 (Separating Row A & Row B) */}
          <g transform="translate(200, 335)">
            <rect
              x="0"
              y="0"
              width="890"
              height="20"
              rx="4"
              fill="#080d1a"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            {/* Trunking conduit texture lines */}
            <line x1="10" y1="10" x2="880" y2="10" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" strokeDasharray="16 8" />
            <text
              x="445"
              y="14"
              textAnchor="middle"
              fill="#475569"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="0.2em"
            >
              ISLAND 01 • CENTRAL RACEWAY & POWER TRUNKING BARRIER
            </text>
          </g>

          {/* Row B Workstations (Rear of Island 1, facing south/rear) */}
          <g>
            {SLOT_COORDINATES.map(({ slot, x }) => {
              const ws = wsMap.get(`B_${slot}`);
              const isHovered = hoveredNodeId === `B_${slot}`;
              if (!ws) return null;

              return (
                <g
                  key={ws.id}
                  transform={`translate(${x}, ${ROW_Y.B})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(ws)}
                  onMouseEnter={() => setHoveredNodeId(`B_${slot}`)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Desk Surface */}
                  <rect
                    x="0"
                    y="0"
                    width={DESK_WIDTH}
                    height={DESK_HEIGHT}
                    rx="8"
                    fill={isHovered ? '#161e2e' : '#101622'}
                    stroke={isHovered ? '#38bdf8' : '#222f44'}
                    strokeWidth={isHovered ? '2' : '1.5'}
                    className="transition-colors duration-200"
                  />

                  {/* Clean Monospace Identifier */}
                  <text
                    x="24"
                    y="42"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    B{slot}
                  </text>
                  <text
                    x="24"
                    y="56"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    PC B{slot}
                  </text>

                  {/* Monitor Top Profile Silhouette */}
                  <g transform="translate(68, 12)" filter="url(#monitorShadow)">
                    <rect x="28" y="10" width="16" height="8" rx="2" fill="#1e293b" />
                    <rect
                      x="0"
                      y="0"
                      width="72"
                      height="8"
                      rx="2"
                      fill="#0b0f19"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  </g>

                  {/* ATX Tower Silhouette */}
                  <g transform="translate(150, 22)">
                    <rect
                      x="0"
                      y="0"
                      width="28"
                      height="56"
                      rx="3"
                      fill="#070a12"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <line x1="6" y1="12" x2="22" y2="12" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="16" x2="22" y2="16" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="20" x2="22" y2="20" stroke="#334155" strokeWidth="1" />
                  </g>

                  {/* Mechanical Keyboard */}
                  <g transform="translate(64, 42)">
                    <rect
                      x="0"
                      y="0"
                      width="54"
                      height="22"
                      rx="2"
                      fill="#0d131f"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <rect x="14" y="14" width="26" height="4" rx="1" fill="#1e293b" />
                  </g>

                  {/* Mousepad & Mouse */}
                  <g transform="translate(124, 44)">
                    <rect x="0" y="0" width="18" height="22" rx="2" fill="#131c2d" />
                    <rect x="3" y="3" width="12" height="16" rx="5" fill="#090d16" stroke="#334155" strokeWidth="0.8" />
                  </g>

                  {/* Chair */}
                  <path
                    d="M 70 88 C 80 82, 108 82, 118 88"
                    fill="none"
                    stroke="#273549"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Single Glowing LED Light Dot */}
                  {renderLedDot(ws.statusLevel)}
                </g>
              );
            })}
          </g>

          {/* ========================================================= */}
          {/* LAB CENTRAL AISLE WALKWAY                                 */}
          {/* ========================================================= */}
          <g transform="translate(200, 485)">
            <line x1="40" y1="50" x2="850" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="8 12" opacity="0.3" />
            <text
              x="445"
              y="54"
              textAnchor="middle"
              fill="#334155"
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.3em"
            >
              MAIN LAB WALKWAY • AISLE 02
            </text>
          </g>

          {/* ========================================================= */}
          {/* 4. ISLAND ASSEMBLY 2: ROW C & ROW D (BACK-TO-BACK)        */}
          {/* ========================================================= */}

          {/* Row C Workstations (Front of Island 2) */}
          <g>
            {SLOT_COORDINATES.map(({ slot, x }) => {
              const ws = wsMap.get(`C_${slot}`);
              const isHovered = hoveredNodeId === `C_${slot}`;
              if (!ws) return null;

              return (
                <g
                  key={ws.id}
                  transform={`translate(${x}, ${ROW_Y.C})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(ws)}
                  onMouseEnter={() => setHoveredNodeId(`C_${slot}`)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Desk Surface */}
                  <rect
                    x="0"
                    y="0"
                    width={DESK_WIDTH}
                    height={DESK_HEIGHT}
                    rx="8"
                    fill={isHovered ? '#161e2e' : '#101622'}
                    stroke={isHovered ? '#38bdf8' : '#222f44'}
                    strokeWidth={isHovered ? '2' : '1.5'}
                    className="transition-colors duration-200"
                  />

                  {/* Clean Monospace Identifier */}
                  <text
                    x="24"
                    y="42"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    C{slot}
                  </text>
                  <text
                    x="24"
                    y="56"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    PC C{slot}
                  </text>

                  {/* Monitor Top Profile Silhouette */}
                  <g transform="translate(68, 12)" filter="url(#monitorShadow)">
                    <rect x="28" y="10" width="16" height="8" rx="2" fill="#1e293b" />
                    <rect
                      x="0"
                      y="0"
                      width="72"
                      height="8"
                      rx="2"
                      fill="#0b0f19"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  </g>

                  {/* ATX Tower Silhouette */}
                  <g transform="translate(150, 22)">
                    <rect
                      x="0"
                      y="0"
                      width="28"
                      height="56"
                      rx="3"
                      fill="#070a12"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <line x1="6" y1="12" x2="22" y2="12" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="16" x2="22" y2="16" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="20" x2="22" y2="20" stroke="#334155" strokeWidth="1" />
                  </g>

                  {/* Mechanical Keyboard */}
                  <g transform="translate(64, 42)">
                    <rect
                      x="0"
                      y="0"
                      width="54"
                      height="22"
                      rx="2"
                      fill="#0d131f"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <rect x="14" y="14" width="26" height="4" rx="1" fill="#1e293b" />
                  </g>

                  {/* Mousepad & Mouse */}
                  <g transform="translate(124, 44)">
                    <rect x="0" y="0" width="18" height="22" rx="2" fill="#131c2d" />
                    <rect x="3" y="3" width="12" height="16" rx="5" fill="#090d16" stroke="#334155" strokeWidth="0.8" />
                  </g>

                  {/* Chair */}
                  <path
                    d="M 70 88 C 80 82, 108 82, 118 88"
                    fill="none"
                    stroke="#273549"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Single Glowing LED Light Dot */}
                  {renderLedDot(ws.statusLevel)}
                </g>
              );
            })}
          </g>

          {/* Central Horizontal Cable Trunking Barrier 2 (Separating Row C & Row D) */}
          <g transform="translate(200, 715)">
            <rect
              x="0"
              y="0"
              width="890"
              height="20"
              rx="4"
              fill="#080d1a"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <line x1="10" y1="10" x2="880" y2="10" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" strokeDasharray="16 8" />
            <text
              x="445"
              y="14"
              textAnchor="middle"
              fill="#475569"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="0.2em"
            >
              ISLAND 02 • CENTRAL RACEWAY & POWER TRUNKING BARRIER
            </text>
          </g>

          {/* Row D Workstations (Rear of Island 2) */}
          <g>
            {SLOT_COORDINATES.map(({ slot, x }) => {
              const ws = wsMap.get(`D_${slot}`);
              const isHovered = hoveredNodeId === `D_${slot}`;
              if (!ws) return null;

              return (
                <g
                  key={ws.id}
                  transform={`translate(${x}, ${ROW_Y.D})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(ws)}
                  onMouseEnter={() => setHoveredNodeId(`D_${slot}`)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Desk Surface */}
                  <rect
                    x="0"
                    y="0"
                    width={DESK_WIDTH}
                    height={DESK_HEIGHT}
                    rx="8"
                    fill={isHovered ? '#161e2e' : '#101622'}
                    stroke={isHovered ? '#38bdf8' : '#222f44'}
                    strokeWidth={isHovered ? '2' : '1.5'}
                    className="transition-colors duration-200"
                  />

                  {/* Clean Monospace Identifier */}
                  <text
                    x="24"
                    y="42"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    D{slot}
                  </text>
                  <text
                    x="24"
                    y="56"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    PC D{slot}
                  </text>

                  {/* Monitor Top Profile Silhouette */}
                  <g transform="translate(68, 12)" filter="url(#monitorShadow)">
                    <rect x="28" y="10" width="16" height="8" rx="2" fill="#1e293b" />
                    <rect
                      x="0"
                      y="0"
                      width="72"
                      height="8"
                      rx="2"
                      fill="#0b0f19"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  </g>

                  {/* ATX Tower Silhouette */}
                  <g transform="translate(150, 22)">
                    <rect
                      x="0"
                      y="0"
                      width="28"
                      height="56"
                      rx="3"
                      fill="#070a12"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <line x1="6" y1="12" x2="22" y2="12" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="16" x2="22" y2="16" stroke="#334155" strokeWidth="1" />
                    <line x1="6" y1="20" x2="22" y2="20" stroke="#334155" strokeWidth="1" />
                  </g>

                  {/* Mechanical Keyboard */}
                  <g transform="translate(64, 42)">
                    <rect
                      x="0"
                      y="0"
                      width="54"
                      height="22"
                      rx="2"
                      fill="#0d131f"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <rect x="14" y="14" width="26" height="4" rx="1" fill="#1e293b" />
                  </g>

                  {/* Mousepad & Mouse */}
                  <g transform="translate(124, 44)">
                    <rect x="0" y="0" width="18" height="22" rx="2" fill="#131c2d" />
                    <rect x="3" y="3" width="12" height="16" rx="5" fill="#090d16" stroke="#334155" strokeWidth="0.8" />
                  </g>

                  {/* Chair */}
                  <path
                    d="M 70 88 C 80 82, 108 82, 118 88"
                    fill="none"
                    stroke="#273549"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Single Glowing LED Light Dot */}
                  {renderLedDot(ws.statusLevel)}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* ========================================================= */}
      {/* MINIMALIST VOID HUD CONTROLS                              */}
      {/* ========================================================= */}

      {/* Top Left: Quick Exit fallback button */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button
          onClick={onExitLabView}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1525]/85 backdrop-blur-md border border-cyan-500/30 text-gray-200 hover:text-white hover:border-cyan-400 hover:bg-[#132038] shadow-lg transition-all text-xs font-mono group"
          title="Return to standard dashboard (or click physical EXIT door in canvas)"
        >
          <LogOut className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit Lab View</span>
        </button>

        {/* Lab Title Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-gray-800 text-gray-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-gray-300 font-bold">FETC ComLab Digital Twin</span>
          <span className="text-gray-600">•</span>
          <span className="text-[11px] text-gray-400">Right-to-Left Layout</span>
        </div>
      </div>

      {/* Top Right: Role switcher + Telemetry & Docs Triggers */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Telemetry Simulator Trigger */}
        <button
          onClick={onOpenTelemetrySimulator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1525]/85 backdrop-blur-md border border-gray-700/80 hover:border-cyan-500/60 text-gray-300 hover:text-cyan-300 transition-colors text-xs font-mono"
          title="Open Live Telemetry Heartbeat Dispatcher"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Telemetry</span>
        </button>

        {/* API Docs Trigger */}
        <button
          onClick={onOpenApiDocs}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1525]/85 backdrop-blur-md border border-gray-700/80 hover:border-purple-500/60 text-gray-300 hover:text-purple-300 transition-colors text-xs font-mono"
          title="View Telemetry Agent JSON Spec"
        >
          <FileCode className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Agent API</span>
        </button>

        {/* Role Toggle Pill (Julian Owner vs Student Guest) */}
        <button
          onClick={onToggleAdminMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono transition-all shadow-md ${
            isOwner
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 hover:bg-amber-900/80'
              : 'bg-blue-950/70 border-blue-500/60 text-blue-200 hover:bg-blue-900/80'
          }`}
          title="Click to switch between Owner/Admin mode and Student view"
        >
          {isOwner ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Julian (Admin)</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Student View</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Center / Left: Zoom and Navigation Controls */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center bg-[#0d1525]/85 backdrop-blur-md border border-gray-800 rounded-lg p-1 shadow-lg text-gray-300 text-xs font-mono">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1.5 hover:bg-[#1f2b42] hover:text-white rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 hover:bg-[#1f2b42] hover:text-white rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 hover:bg-[#1f2b42] hover:text-white rounded transition-colors text-[11px]"
            title="Fit to Lab"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-[#1f2b42] hover:text-white rounded transition-colors"
            title="Center Lab"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Navigation hint */}
        <div className="hidden lg:flex items-center px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-gray-900 text-gray-400 text-[11px] font-mono">
          Drag to Pan • Wheel to Zoom • Click Node to Inspect
        </div>
      </div>
    </div>
  );
};
