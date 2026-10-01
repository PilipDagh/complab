import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  ENTERPRISE_MAC_OUI_DATABASE,
  SYSADMIN_SCRIPT_PRESETS,
  SWITCH_VENDOR_TEMPLATES,
  RJ45_PINOUT_MATRIX,
  MacOuiEntry,
  SysadminScriptPreset,
  SwitchVendorTemplate,
} from '../data/networkDatabase';
import {
  Terminal,
  Network,
  Wifi,
  Server,
  Route,
  Activity,
  Cable,
  Globe,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Trash2,
  Key,
  X,
  RefreshCw,
  Sliders,
  Send,
  SlidersHorizontal,
  Code2,
  FileCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  Radio,
} from 'lucide-react';

type Module2ToolId =
  | 'script_generator'
  | 'switch_configurator'
  | 'wifi_analyzer'
  | 'mac_profiler'
  | 'terminal_sandbox'
  | 'subnet_calculator'
  | 'cable_tdr'
  | 'dns_route_triage';

export const NetworkSysadminSuite: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool state
  const [activeTool, setActiveTool] = useState<Module2ToolId>('script_generator');

  // AI Drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 2.1 State: Repair Script Generator
  // -------------------------------------------------------------
  const [selectedScriptId, setSelectedScriptId] = useState<string>('sfc_dism');
  const [scriptLang, setScriptLang] = useState<'bat' | 'ps1' | 'sh'>('ps1');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // -------------------------------------------------------------
  // Tool 2.2 State: Enterprise Switch CLI Configurator
  // -------------------------------------------------------------
  const [switchVendor, setSwitchVendor] = useState<string>('cisco_ios');
  const [switchHostname, setSwitchHostname] = useState<string>('SW-CORE-BENCH01');
  const [switchAdminPass, setSwitchAdminPass] = useState<string>('C1sco!TradeTech2026');
  const [mgmtVlan, setMgmtVlan] = useState<number>(10);
  const [mgmtIp, setMgmtIp] = useState<string>('192.168.10.2');
  const [mgmtMask, setMgmtMask] = useState<string>('255.255.255.0');
  const [accessVlans, setAccessVlans] = useState<string>('20, 30, 40, 50');
  const [trunkPorts, setTrunkPorts] = useState<string>('GigabitEthernet0/1 - 2');
  const [allowedVlans, setAllowedVlans] = useState<string>('10,20,30,40,50');
  const [nativeVlan, setNativeVlan] = useState<number>(99);
  const [enableStp, setEnableStp] = useState<boolean>(true);
  const [enablePortFast, setEnablePortFast] = useState<boolean>(true);
  const [enableSsh, setEnableSsh] = useState<boolean>(true);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // -------------------------------------------------------------
  // Tool 2.3 State: Wi-Fi Channel Overlap & RSSI Analyzer
  // -------------------------------------------------------------
  const [wifiBand, setWifiBand] = useState<'2.4GHz' | '5GHz' | '6GHz'>('2.4GHz');
  const [wifiNetworks, setWifiNetworks] = useState<
    Array<{ id: string; ssid: string; channel: number; width: number; rssi: number; bssid: string }>
  >([
    { id: '1', ssid: 'TradeTech-Lab-Corp', channel: 1, width: 20, rssi: -48, bssid: '70:69:79:A1:B2:C3' },
    { id: '2', ssid: 'Vocational-Student-Guest', channel: 6, width: 20, rssi: -58, bssid: 'F0:9F:C2:44:55:66' },
    { id: '3', ssid: 'Bench-Neighbor-AP', channel: 3, width: 20, rssi: -65, bssid: 'AC:BC:32:99:88:77' }, // Rogue overlapping channel 3!
    { id: '4', ssid: 'Lab-IoT-SmartSensors', channel: 11, width: 20, rssi: -52, bssid: 'B8:27:EB:12:34:56' },
  ]);

  // -------------------------------------------------------------
  // Tool 2.4 State: MAC Address OUI Profiler
  // -------------------------------------------------------------
  const [inputMac, setInputMac] = useState<string>('00:00:0C:4A:2B:11');
  const [matchedMacEntry, setMatchedMacEntry] = useState<MacOuiEntry | null>(null);

  // -------------------------------------------------------------
  // Tool 2.5 State: Interactive Web Terminal Sandbox
  // -------------------------------------------------------------
  const [terminalOs, setTerminalOs] = useState<'windows' | 'linux'>('windows');
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: 'prompt' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'TradeTech Virtual Diagnostic Sandbox [Version 2.0.26]' },
    { type: 'output', text: 'Type "help", "ipconfig /all", "ping 8.8.8.8", "tracert 1.1.1.1", or "netstat -ano".' },
  ]);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------
  // Tool 2.6 State: Subnetting & CIDR Topology Engine
  // -------------------------------------------------------------
  const [subnetIp, setSubnetIp] = useState<string>('192.168.10.0');
  const [cidrBits, setCidrBits] = useState<number>(24);
  const [vlsmCount, setVlsmCount] = useState<number>(4);

  // -------------------------------------------------------------
  // Tool 2.7 State: Ethernet TDR Cable Fault & Pinout Tester
  // -------------------------------------------------------------
  const [cableStandard, setCableStandard] = useState<'T568A' | 'T568B'>('T568B');
  const [cableLengthMeters, setCableLengthMeters] = useState<number>(45);
  const [cableNvp, setCableNvp] = useState<number>(0.7); // Nominal Velocity of Propagation (Cat6)
  const [tdrSignalTimeNs, setTdrSignalTimeNs] = useState<number>(210); // nanoseconds round-trip
  const [simulatedWireFault, setSimulatedWireFault] = useState<string>('pair_2_open'); // e.g. Open on Pin 1/2

  // -------------------------------------------------------------
  // Tool 2.8 State: DNS & Route Propagation Triage Suite
  // -------------------------------------------------------------
  const [dnsQueryDomain, setDnsQueryDomain] = useState<string>('tradetech.edu');
  const [dnsRecordType, setDnsRecordType] = useState<string>('A');
  const [tracerouteTarget, setTracerouteTarget] = useState<string>('8.8.8.8');
  const [simulatedHops, setSimulatedHops] = useState<
    Array<{ hop: number; ip: string; latency: number; name: string; loss: number }>
  >([
    { hop: 1, ip: '192.168.10.1', latency: 0.8, name: 'default-gateway.local', loss: 0 },
    { hop: 2, ip: '10.240.0.1', latency: 4.2, name: 'isp-aggregation-router.net', loss: 0 },
    { hop: 3, ip: '172.16.12.8', latency: 8.5, name: 'core-backbone-edge.wan', loss: 0 },
    { hop: 4, ip: '142.250.231.14', latency: 12.1, name: 'google-peer-as15169.net', loss: 0 },
    { hop: 5, ip: '8.8.8.8', latency: 13.4, name: 'dns.google', loss: 0 },
  ]);

  // Load API Key & saved Module 2 state
  useEffect(() => {
    const key = getStoredGeminiApiKey();
    setCustomApiKey(key);

    const savedState = localStorage.getItem('tradetech_module2_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.activeTool) setActiveTool(parsed.activeTool);
        if (parsed.switchHostname) setSwitchHostname(parsed.switchHostname);
        if (parsed.subnetIp) setSubnetIp(parsed.subnetIp);
        if (parsed.cidrBits) setCidrBits(parsed.cidrBits);
        if (parsed.inputMac) setInputMac(parsed.inputMac);
      } catch (e) {
        console.warn('Could not restore Module 2 state', e);
      }
    }
  }, []);

  // Save Module 2 state
  useEffect(() => {
    try {
      localStorage.setItem(
        'tradetech_module2_state',
        JSON.stringify({
          activeTool,
          switchHostname,
          subnetIp,
          cidrBits,
          inputMac,
        })
      );
    } catch (e) {
      console.warn('Failed saving module 2 state', e);
    }
  }, [activeTool, switchHostname, subnetIp, cidrBits, inputMac]);

  // Match MAC Address
  useEffect(() => {
    lookupMacAddress(inputMac);
  }, [inputMac]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (activeTool === 'terminal_sandbox') {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTool]);

  // -------------------------------------------------------------
  // Tool 2.4 MAC Lookup Engine
  // -------------------------------------------------------------
  const lookupMacAddress = (raw: string) => {
    const clean = raw.trim().toUpperCase().replace(/[-.]/g, ':');
    if (clean.length < 8) {
      setMatchedMacEntry(null);
      return;
    }
    const prefix3 = clean.substring(0, 8); // e.g. "00:00:0C"
    const match = ENTERPRISE_MAC_OUI_DATABASE.find((item) => item.prefix === prefix3);
    setMatchedMacEntry(match || null);
  };

  // -------------------------------------------------------------
  // Tool 2.6 Subnet Calculation Engine
  // -------------------------------------------------------------
  const calculateSubnet = (ipStr: string, maskBits: number) => {
    const ipParts = ipStr.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }

    const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const maskInt = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | ~maskInt) >>> 0;

    const netIp = [
      (netInt >>> 24) & 255,
      (netInt >>> 16) & 255,
      (netInt >>> 8) & 255,
      netInt & 255,
    ].join('.');

    const bcastIp = [
      (bcastInt >>> 24) & 255,
      (bcastInt >>> 16) & 255,
      (bcastInt >>> 8) & 255,
      bcastInt & 255,
    ].join('.');

    const maskIp = [
      (maskInt >>> 24) & 255,
      (maskInt >>> 16) & 255,
      (maskInt >>> 8) & 255,
      maskInt & 255,
    ].join('.');

    const wildcardIp = [
      (~maskInt >>> 24) & 255,
      (~maskInt >>> 16) & 255,
      (~maskInt >>> 8) & 255,
      ~maskInt & 255,
    ].join('.');

    const totalHosts = Math.pow(2, 32 - maskBits);
    const usableHosts = maskBits >= 31 ? 0 : totalHosts - 2;

    const firstUsableInt = maskBits >= 31 ? netInt : netInt + 1;
    const lastUsableInt = maskBits >= 31 ? bcastInt : bcastInt - 1;

    const firstUsableIp = [
      (firstUsableInt >>> 24) & 255,
      (firstUsableInt >>> 16) & 255,
      (firstUsableInt >>> 8) & 255,
      firstUsableInt & 255,
    ].join('.');

    const lastUsableIp = [
      (lastUsableInt >>> 24) & 255,
      (lastUsableInt >>> 16) & 255,
      (lastUsableInt >>> 8) & 255,
      lastUsableInt & 255,
    ].join('.');

    // Scope check
    let ipClass = 'Class C';
    if (ipParts[0] < 128) ipClass = 'Class A';
    else if (ipParts[0] < 192) ipClass = 'Class B';
    else if (ipParts[0] < 224) ipClass = 'Class C';
    else if (ipParts[0] < 240) ipClass = 'Class D (Multicast)';
    else ipClass = 'Class E (Experimental)';

    let scope = 'Public Internet Routable';
    if (ipParts[0] === 10) scope = 'RFC 1918 Private (10.0.0.0/8)';
    else if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31)
      scope = 'RFC 1918 Private (172.16.0.0/12)';
    else if (ipParts[0] === 192 && ipParts[1] === 168)
      scope = 'RFC 1918 Private (192.168.0.0/16)';
    else if (ipParts[0] === 169 && ipParts[1] === 254)
      scope = 'RFC 3927 Link-Local APIPA (DHCP Failure)';
    else if (ipParts[0] === 127) scope = 'RFC 1122 Loopback (127.0.0.0/8)';

    return {
      netIp,
      bcastIp,
      maskIp,
      wildcardIp,
      totalHosts,
      usableHosts,
      firstUsableIp,
      lastUsableIp,
      ipClass,
      scope,
    };
  };

  const subnetDetails = calculateSubnet(subnetIp, cidrBits);

  // -------------------------------------------------------------
  // Tool 2.5 Terminal Simulator Engine
  // -------------------------------------------------------------
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    setTerminalHistory((prev) => [...prev, cmd]);
    setHistoryPointer(-1);

    const promptSymbol =
      terminalOs === 'windows' ? `C:\\Users\\Technician> ${cmd}` : `student@tradetech-bench:~$ ${cmd}`;

    const newLogs: Array<{ type: 'prompt' | 'output' | 'error'; text: string }> = [
      ...terminalLogs,
      { type: 'prompt', text: promptSymbol },
    ];

    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    }

    if (lower === 'help') {
      newLogs.push({
        type: 'output',
        text:
          'Available Bench Commands:\n' +
          ' - Windows: ipconfig /all, ping, tracert, nslookup, netsh, getmac, systeminfo, sfc, dism\n' +
          ' - Linux: ip a, ping -c 4, traceroute, lsblk, dmidecode, journalctl -p 3 -b, cat /etc/resolv.conf\n' +
          ' - Utility: clear / cls, help',
      });
    } else if (lower.startsWith('ipconfig')) {
      newLogs.push({
        type: 'output',
        text:
          `Windows IP Configuration\n\n` +
          `Ethernet adapter Local Area Connection 1:\n` +
          `   Connection-specific DNS Suffix  . : tradetech.lab\n` +
          `   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM\n` +
          `   Physical Address. . . . . . . . . : 68-05-CA-33-81-FA\n` +
          `   DHCP Enabled. . . . . . . . . . . : Yes\n` +
          `   IPv4 Address. . . . . . . . . . . : 192.168.10.145(Preferred)\n` +
          `   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n` +
          `   Lease Obtained. . . . . . . . . . : Thursday, October 1, 2026 6:15:00 AM\n` +
          `   Default Gateway . . . . . . . . . : 192.168.10.1\n` +
          `   DHCP Server . . . . . . . . . . . : 192.168.10.1\n` +
          `   DNS Servers . . . . . . . . . . . : 192.168.10.1, 1.1.1.1`,
      });
    } else if (lower.startsWith('ip a') || lower === 'ip addr') {
      newLogs.push({
        type: 'output',
        text:
          `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default\n` +
          `    inet 127.0.0.1/8 scope host lo\n` +
          `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default\n` +
          `    link/ether dc:a6:32:11:45:90 brd ff:ff:ff:ff:ff:ff\n` +
          `    inet 192.168.10.145/24 brd 192.168.10.255 scope global dynamic eth0\n` +
          `    inet6 fe80::dea6:32ff:fe11:4590/64 scope link`,
      });
    } else if (lower.startsWith('ping')) {
      const target = cmd.split(' ')[1] || '8.8.8.8';
      newLogs.push({
        type: 'output',
        text:
          `Pinging ${target} with 32 bytes of data:\n` +
          `Reply from ${target}: bytes=32 time=12ms TTL=118\n` +
          `Reply from ${target}: bytes=32 time=11ms TTL=118\n` +
          `Reply from ${target}: bytes=32 time=13ms TTL=118\n` +
          `Reply from ${target}: bytes=32 time=12ms TTL=118\n\n` +
          `Ping statistics for ${target}:\n` +
          `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\n` +
          `Approximate round trip times in milli-seconds:\n` +
          `    Minimum = 11ms, Maximum = 13ms, Average = 12ms`,
      });
    } else if (lower.startsWith('tracert') || lower.startsWith('traceroute')) {
      const target = cmd.split(' ')[1] || '1.1.1.1';
      newLogs.push({
        type: 'output',
        text:
          `Tracing route to ${target} over a maximum of 30 hops:\n` +
          `  1    <1 ms    <1 ms    <1 ms  192.168.10.1 [Default Gateway]\n` +
          `  2     3 ms     3 ms     4 ms  10.240.0.1 [ISP Metro-Aggregation]\n` +
          `  3     8 ms     7 ms     8 ms  172.16.12.8 [Core Transit Gateway]\n` +
          `  4    12 ms    11 ms    12 ms  one.one.one.one [${target}]\n\n` +
          `Trace complete.`,
      });
    } else if (lower.startsWith('nslookup')) {
      const domain = cmd.split(' ')[1] || 'google.com';
      newLogs.push({
        type: 'output',
        text:
          `Server:  one.one.one.one\n` +
          `Address:  1.1.1.1\n\n` +
          `Non-authoritative answer:\n` +
          `Name:    ${domain}\n` +
          `Addresses:  142.250.190.46\n` +
          `          2607:f8b0:4004:800::200e`,
      });
    } else if (lower.startsWith('getmac')) {
      newLogs.push({
        type: 'output',
        text:
          `Physical Address    Transport Name\n` +
          `=================== ==========================================================\n` +
          `68-05-CA-33-81-FA   \\Device\\Tcpip_{8F25C742-3B48-4B5D-800B-C429FA001A98}\n` +
          `AC-BC-32-44-12-89   Media disconnected`,
      });
    } else if (lower.startsWith('systeminfo')) {
      newLogs.push({
        type: 'output',
        text:
          `Host Name:                 TRADETECH-BENCH01\n` +
          `OS Name:                   Microsoft Windows 11 Enterprise\n` +
          `OS Version:                10.0.22631 N/A Build 22631\n` +
          `System Manufacturer:       Dell Inc.\n` +
          `System Model:              OptiPlex 7090 MT\n` +
          `System Type:               x64-based PC\n` +
          `Processor(s):              1 Processor(s) Installed. Intel Core i7-11700 @ 2.50GHz\n` +
          `BIOS Version:              Dell Inc. 1.18.0, 1/15/2026\n` +
          `Total Physical Memory:     32,642 MB\n` +
          `Network Card(s):           1 NIC(s) Installed.\n` +
          `                           [01]: Intel(R) Ethernet Connection I219-LM`,
      });
    } else {
      newLogs.push({
        type: 'error',
        text: `'${cmd}' is not recognized as an internal or external command.\nClick "Gemini AI Terminal Mentor" for real-time syntax instruction.`,
      });
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  // -------------------------------------------------------------
  // Universal AI Dispatcher for Module 2
  // -------------------------------------------------------------
  const handleRunAiAnalysis = async (toolTitle: string, payload: any) => {
    setAiLoading(true);
    setIsAiDrawerOpen(true);

    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 2: COMMAND LINE, NETWORKING & SYSADMIN SUITE',
        toolName: toolTitle,
        inputPayload: payload,
        userRole: isOwner ? 'ROLE_OWNER' : 'ROLE_STUDENT',
        customPrompt: aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Sysadmin Co-Pilot Analyzed',
        message: `Generated networking and CLI triage for ${toolTitle}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sysadmin AI Error',
        message: err?.message || 'Check network connection or API Key.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Navigation for the 8 SysAdmin Tools
  // -------------------------------------------------------------
  const toolNav: { id: Module2ToolId; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'script_generator', label: '1. Auto Batch & PowerShell Scripts', icon: <Code2 className="w-4 h-4" />, badge: '.bat/.ps1' },
    { id: 'switch_configurator', label: '2. Switch & Router CLI Configurator', icon: <Server className="w-4 h-4" />, badge: 'Cisco/Aruba' },
    { id: 'wifi_analyzer', label: '3. Wi-Fi Channel Overlap & RSSI', icon: <Wifi className="w-4 h-4" />, badge: 'Spectrum' },
    { id: 'mac_profiler', label: '4. MAC Address OUI & NIC Profiler', icon: <Network className="w-4 h-4" />, badge: '50+ OUIs' },
    { id: 'terminal_sandbox', label: '5. Interactive Terminal & Sandbox', icon: <Terminal className="w-4 h-4" />, badge: 'CLI Mentor' },
    { id: 'subnet_calculator', label: '6. IPv4/IPv6 Subnetting & CIDR', icon: <Globe className="w-4 h-4" />, badge: 'VLSM' },
    { id: 'cable_tdr', label: '7. Ethernet TDR Cable & RJ45 Pinout', icon: <Cable className="w-4 h-4" />, badge: 'T568A/B' },
    { id: 'dns_route_triage', label: '8. DNS & Route Propagation Triage', icon: <Route className="w-4 h-4" />, badge: 'Traceroute' },
  ];

  const activeScript = SYSADMIN_SCRIPT_PRESETS.find((s) => s.id === selectedScriptId) || SYSADMIN_SCRIPT_PRESETS[0];
  const activeSwitchVendor = SWITCH_VENDOR_TEMPLATES.find((v) => v.vendorId === switchVendor) || SWITCH_VENDOR_TEMPLATES[0];

  const generatedSwitchCli = activeSwitchVendor.generateConfig({
    hostname: switchHostname,
    adminPass: switchAdminPass,
    mgmtVlan,
    mgmtIp,
    mgmtMask,
    accessVlans,
    trunkPorts,
    allowedVlans,
    nativeVlan,
    enableStp,
    enablePortFast,
    enableSsh,
  });

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-[#38bdf8] font-bold">Module 02</span>
            <span className="text-gray-600">/</span>
            <span>Network Infrastructure & Systems Administration</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#38bdf8]" />
            Command Line, Networking & SysAdmin Suite
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Enterprise switch CLI generators, Wi-Fi spectrum analysis, MAC OUI lookup, and automated recovery scripts.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1f2937] hover:bg-[#374151] text-gray-300 border border-gray-700 transition-all"
          >
            <Key className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>API Key {customApiKey ? '• Saved' : '• Default'}</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              isAiDrawerOpen
                ? 'bg-[#06b6d4] text-black shadow-md shadow-[#06b6d4]/20'
                : 'bg-[#111827] text-[#06b6d4] border border-[#06b6d4]/40 hover:bg-[#06b6d4]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiDrawerOpen ? 'Hide AI Drawer' : 'Show AI Co-Pilot'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tool View + AI Co-Pilot */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 shadow-md">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider px-2 py-1 mb-1 font-semibold flex items-center justify-between">
              <span>8 SysAdmin & Network Tools</span>
              <span className="text-[#06b6d4]">Module 2</span>
            </div>
            <div className="space-y-1">
              {toolNav.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#06b6d4]/15 text-white border border-[#06b6d4]/60 font-semibold shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-[#06b6d4]' : 'text-gray-500'}>
                        {tool.icon}
                      </span>
                      <span className="truncate">{tool.label}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-1 shrink-0 ${
                        isActive
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-gray-800 text-xs text-gray-300 space-y-2 font-sans">
            <div className="flex items-center gap-1.5 text-[#06b6d4] font-mono font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              CompTIA Network+ N10-008
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Enforce strict VLAN isolation between management planes and client access ports. Never leave Native VLAN 1 untagged on production 802.1Q trunks.
            </p>
          </div>
        </div>

        {/* Workspace Container */}
        <div className={`space-y-6 ${isAiDrawerOpen ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          {/* ======================================================== */}
          {/* TOOL 2.1: Automated Batch & PowerShell Repair Scripts */}
          {/* ======================================================== */}
          {activeTool === 'script_generator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#06b6d4]" />
                    Automated Repair Script Generator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Generates copy-pasteable, error-handled scripts for Windows Batch, PowerShell 7+, and Linux Bash.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  {(['bat', 'ps1', 'sh'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setScriptLang(lang)}
                      className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-all ${
                        scriptLang === lang
                          ? 'bg-[#06b6d4] text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      .{lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Selection Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-gray-400">Select Automated Task Preset:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SYSADMIN_SCRIPT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedScriptId(p.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedScriptId === p.id
                          ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white'
                          : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Code Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Target: {scriptLang === 'bat' ? 'Windows Batch (.bat)' : scriptLang === 'ps1' ? 'PowerShell 7+ (.ps1)' : 'Linux Bash (.sh)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const code =
                          scriptLang === 'bat'
                            ? activeScript.windowsBat
                            : scriptLang === 'ps1'
                            ? activeScript.powershell
                            : activeScript.linuxBash;
                        navigator.clipboard.writeText(code);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                        addToast({ type: 'success', title: 'Script Copied', message: 'Ready to paste into terminal.' });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const code =
                          scriptLang === 'bat'
                            ? activeScript.windowsBat
                            : scriptLang === 'ps1'
                            ? activeScript.powershell
                            : activeScript.linuxBash;
                        const ext = scriptLang;
                        const blob = new Blob([code], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `tradetech_${activeScript.id}.${ext}`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700"
                    >
                      <Download className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xs text-gray-200 overflow-x-auto max-h-72">
                  <pre className="whitespace-pre">
                    {scriptLang === 'bat'
                      ? activeScript.windowsBat
                      : scriptLang === 'ps1'
                      ? activeScript.powershell
                      : activeScript.linuxBash}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Automated Batch & PowerShell Repair Script Generator', {
                      scriptName: activeScript.name,
                      language: scriptLang,
                      requiresAdmin: activeScript.requiresAdmin,
                      codeSample: (scriptLang === 'bat' ? activeScript.windowsBat : activeScript.powershell).slice(0, 300),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Script Auditor & Enhancer</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.2: Enterprise Switch & Router CLI Configurator */}
          {/* ======================================================== */}
          {activeTool === 'switch_configurator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#06b6d4]" />
                    Enterprise Switch & Router CLI Configurator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Generates syntax-perfect, hardened switch configurations for Cisco IOS-XE, Aruba CX, MikroTik, and Ubiquiti.
                  </p>
                </div>
                <div>
                  <select
                    value={switchVendor}
                    onChange={(e) => setSwitchVendor(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-[#06b6d4] focus:outline-none"
                  >
                    {SWITCH_VENDOR_TEMPLATES.map((v) => (
                      <option key={v.vendorId} value={v.vendorId}>
                        {v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-gray-400 block mb-1">Hostname</label>
                  <input
                    type="text"
                    value={switchHostname}
                    onChange={(e) => setSwitchHostname(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Admin Secret</label>
                  <input
                    type="password"
                    value={switchAdminPass}
                    onChange={(e) => setSwitchAdminPass(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Management VLAN ID</label>
                  <input
                    type="number"
                    value={mgmtVlan}
                    onChange={(e) => setMgmtVlan(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Management IP Address</label>
                  <input
                    type="text"
                    value={mgmtIp}
                    onChange={(e) => setMgmtIp(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Management Subnet Mask</label>
                  <input
                    type="text"
                    value={mgmtMask}
                    onChange={(e) => setMgmtMask(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Native Trunk VLAN</label>
                  <input
                    type="number"
                    value={nativeVlan}
                    onChange={(e) => setNativeVlan(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableStp}
                    onChange={(e) => setEnableStp(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-[#06b6d4]"
                  />
                  <span>Rapid PVST+ Spanning Tree</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePortFast}
                    onChange={(e) => setEnablePortFast(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-[#06b6d4]"
                  />
                  <span>PortFast Edge Mode</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSsh}
                    onChange={(e) => setEnableSsh(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-[#06b6d4]"
                  />
                  <span>Enforce SSHv2 2048-bit</span>
                </label>
              </div>

              {/* Live CLI Output Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Terminal CLI Output ({activeSwitchVendor.vendorName}):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSwitchCli);
                      setCopiedCli(true);
                      setTimeout(() => setCopiedCli(false), 2000);
                      addToast({ type: 'success', title: 'CLI Copied', message: 'Ready to paste into serial console.' });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCli ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xs text-[#06b6d4] overflow-x-auto max-h-64">
                  <pre className="whitespace-pre">{generatedSwitchCli}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Enterprise Switch & Router CLI Configurator', {
                      vendor: switchVendor,
                      hostname: switchHostname,
                      mgmtVlan,
                      nativeVlan,
                      trunkPorts,
                      allowedVlans,
                      cliSnippet: generatedSwitchCli.slice(0, 350),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Network Topology Auditor</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.3: Wi-Fi Channel Overlap & RSSI Analyzer */}
          {/* ======================================================== */}
          {activeTool === 'wifi_analyzer' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-[#06b6d4]" />
                    Wi-Fi Channel Overlap & Spectrum Analyzer
                  </h3>
                  <p className="text-xs text-gray-400">
                    Visualizes 2.4 GHz, 5 GHz, and 6 GHz channel bell curves to pinpoint co-channel and adjacent-channel interference.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  {(['2.4GHz', '5GHz', '6GHz'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setWifiBand(b)}
                      className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                        wifiBand === b
                          ? 'bg-[#06b6d4] text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spectrum Chart (SVG) */}
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>RF Spectrum Curve (-30 dBm Excellent ➔ -90 dBm Weak)</span>
                  <span className="text-amber-400">Channels 1, 6, 11 (Non-Overlapping Standard)</span>
                </div>

                <div className="relative h-48 w-full border-b border-l border-gray-800">
                  <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                    {/* Background Grids */}
                    <line x1="0" y1="45" x2="600" y2="45" stroke="#1f2937" strokeDasharray="4" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#1f2937" strokeDasharray="4" />
                    <line x1="0" y1="135" x2="600" y2="135" stroke="#1f2937" strokeDasharray="4" />

                    {/* Network Bell Curves */}
                    {wifiNetworks.map((net, idx) => {
                      // Map channel 1..13 across 600 width (approx 45px per channel)
                      const centerX = ((net.channel - 0.5) / 12) * 550 + 25;
                      const widthPx = net.width === 40 ? 140 : 80;
                      // Height based on RSSI (-30 = high, -90 = low)
                      const peakY = Math.max(20, Math.min(160, ((net.rssi + 30) / -60) * 140 + 20));

                      const colors = [
                        { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.25)' },
                        { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.25)' },
                        { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.25)' }, // Rogue channel 3!
                        { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)' },
                      ];
                      const c = colors[idx % colors.length];

                      return (
                        <g key={net.id}>
                          <path
                            d={`M ${centerX - widthPx} 175 Q ${centerX} ${peakY} ${centerX + widthPx} 175 Z`}
                            fill={c.fill}
                            stroke={c.stroke}
                            strokeWidth="2"
                          />
                          <text
                            x={centerX}
                            y={peakY - 6}
                            fill={c.stroke}
                            fontSize="10"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {net.ssid} ({net.rssi}dBm)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Channel Labels along X Axis */}
                <div className="flex justify-between text-[10px] font-mono text-gray-500 px-2 pt-1">
                  <span>Ch 1 (2412 MHz)</span>
                  <span>Ch 3 (Overlap!)</span>
                  <span>Ch 6 (2437 MHz)</span>
                  <span>Ch 9</span>
                  <span>Ch 11 (2462 MHz)</span>
                </div>
              </div>

              {/* Detected SSID List */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Scanned BSSIDs on Bench:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {wifiNetworks.map((net) => (
                    <div
                      key={net.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        net.channel === 3
                          ? 'bg-red-950/40 border-red-500/50 text-red-200'
                          : 'bg-gray-900 border-gray-800 text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {net.ssid}
                          {net.channel === 3 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-400">
                              CCI Hazard
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          BSSID: {net.bssid} • {net.width}MHz
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#06b6d4] font-bold">Ch {net.channel}</span>
                        <div className="text-[10px] text-gray-400">{net.rssi} dBm</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Wi-Fi Channel Overlap & RSSI Analyzer', {
                      band: wifiBand,
                      networks: wifiNetworks,
                      interferenceNote: 'Detected rogue SSID on Channel 3 bleeding into Channels 1 and 6.',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Wireless Optimization Engine</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.4: MAC Address OUI & NIC Profiler */}
          {/* ======================================================== */}
          {activeTool === 'mac_profiler' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-[#06b6d4]" />
                    MAC Address OUI & NIC Hardware Profiler
                  </h3>
                  <p className="text-xs text-gray-400">
                    Instantly resolves IEEE Organizationally Unique Identifiers (OUIs) across 50+ enterprise hardware vendors.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Enter 6-digit or 12-digit MAC Address
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    value={inputMac}
                    onChange={(e) => setInputMac(e.target.value)}
                    placeholder="e.g. 00:00:0C:4A:2B:11, B8-27-EB-99-88-77, 6805.CA11.2233"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Matched Details */}
              {matchedMacEntry ? (
                <div className="p-4 rounded-xl bg-gray-950 border border-emerald-500/40 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div>
                      <span className="text-[10px] text-[#06b6d4] uppercase">Identified OEM Manufacturer</span>
                      <div className="text-lg font-bold text-white">{matchedMacEntry.vendor}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      OUI: [{matchedMacEntry.prefix}]
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Device Category</span>
                      <strong className="text-gray-200">{matchedMacEntry.category}</strong>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Hardware Bus</span>
                      <strong className="text-gray-200">{matchedMacEntry.typicalBus}</strong>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Max Link Rate</span>
                      <strong className="text-cyan-400">{matchedMacEntry.maxLinkRate}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900/80 rounded border border-gray-800 text-xs text-gray-300 space-y-1">
                    <div className="text-gray-400">
                      <strong>Typical Silicon / PHY:</strong> {matchedMacEntry.commonChipset}
                    </div>
                    <div className="text-amber-400">
                      <strong>802.1X / Security Recommendation:</strong> {matchedMacEntry.securityRecommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-950/40 border border-gray-800 text-center text-xs text-gray-500 font-mono">
                  Type a MAC prefix (e.g. B8:27:EB for Raspberry Pi, 00:00:0C for Cisco, AC:BC:32 for Apple, 68:05:CA for Intel).
                </div>
              )}

              {/* Quick OUI Preset Buttons */}
              <div>
                <span className="text-xs font-mono text-gray-400 block mb-2">Common Bench Hardware Targets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ENTERPRISE_MAC_OUI_DATABASE.slice(0, 8).map((item) => (
                    <button
                      key={item.prefix}
                      onClick={() => setInputMac(item.prefix + ':AA:BB:CC')}
                      className="px-2 py-1 text-[11px] font-mono bg-gray-900 hover:bg-gray-800 text-gray-300 rounded border border-gray-800"
                    >
                      {item.vendor.split(' ')[0]} ({item.prefix})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('MAC Address OUI & NIC Profiler', {
                      macAddress: inputMac,
                      matchedVendor: matchedMacEntry?.vendor || 'Unknown OUI',
                      category: matchedMacEntry?.category || 'Endpoint',
                      bus: matchedMacEntry?.typicalBus || 'Unknown',
                      linkRate: matchedMacEntry?.maxLinkRate || 'Unknown',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Security & Device Profiler</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.5: Interactive Web Terminal Sandbox */}
          {/* ======================================================== */}
          {activeTool === 'terminal_sandbox' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#06b6d4]" />
                    Interactive Practice Web Terminal Sandbox
                  </h3>
                  <p className="text-xs text-gray-400">
                    Live interactive sandbox simulating real Windows Command Prompt / PowerShell and Linux diagnostic outputs.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setTerminalOs('windows')}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      terminalOs === 'windows' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    Windows
                  </button>
                  <button
                    onClick={() => setTerminalOs('linux')}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      terminalOs === 'linux' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    Linux (Bash)
                  </button>
                </div>
              </div>

              {/* Terminal Screen Container */}
              <div className="bg-black rounded-xl p-4 border border-gray-800 font-mono text-xs h-80 overflow-y-auto space-y-2 shadow-inner">
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      log.type === 'prompt'
                        ? 'text-cyan-400 font-bold'
                        : log.type === 'error'
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* Terminal Input Bar */}
              <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-cyan-400 font-mono text-xs font-bold">
                    {terminalOs === 'windows' ? 'CMD>' : '$'}
                  </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type diagnostic command (e.g. ipconfig /all, ping 8.8.8.8)..."
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-14 pr-3 py-2 text-white font-mono text-xs focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs rounded-lg border border-gray-700 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Quick tests: "ipconfig", "ping 8.8.8.8", "nslookup google.com", "getmac", "help"</span>
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Interactive Web Terminal & Command Sandbox', {
                      activeOs: terminalOs,
                      lastCommand: terminalHistory[terminalHistory.length - 1] || 'None',
                      recentLogs: terminalLogs.slice(-4),
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06b6d4] text-black font-bold text-xs shadow"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Gemini Real-Time Terminal Mentor</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.6: IPv4/IPv6 Subnetting & CIDR Topology Engine */}
          {/* ======================================================== */}
          {activeTool === 'subnet_calculator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#06b6d4]" />
                    IPv4 / CIDR Topology & Subnetting Engine
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculates network ID, usable host scopes, wildcard masks, binary representation, and VLSM slicing.
                  </p>
                </div>
              </div>

              {/* Subnet Input & Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Target Network IP
                  </label>
                  <input
                    type="text"
                    value={subnetIp}
                    onChange={(e) => setSubnetIp(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-gray-400">CIDR Prefix Length</span>
                    <span className="text-[#06b6d4] font-bold">/{cidrBits}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={cidrBits}
                    onChange={(e) => setCidrBits(parseInt(e.target.value, 10))}
                    className="w-full accent-[#06b6d4]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-500">
                    <span>/8 (16M)</span>
                    <span>/16 (65k)</span>
                    <span>/24 (254)</span>
                    <span>/30 (2)</span>
                    <span>/32 (Host)</span>
                  </div>
                </div>
              </div>

              {/* Calculations Card */}
              {subnetDetails && (
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-sm font-bold text-white">
                      {subnetDetails.netIp} /{cidrBits}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {subnetDetails.usableHosts.toLocaleString()} Usable Hosts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Subnet Mask</span>
                      <strong className="text-gray-200">{subnetDetails.maskIp}</strong>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Broadcast Address</span>
                      <strong className="text-amber-400">{subnetDetails.bcastIp}</strong>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">First Usable Host</span>
                      <strong className="text-cyan-400">{subnetDetails.firstUsableIp}</strong>
                    </div>
                    <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">Last Usable Host</span>
                      <strong className="text-cyan-400">{subnetDetails.lastUsableIp}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-900/60 rounded border border-gray-800 flex items-center justify-between">
                    <span>
                      Wildcard Mask: <strong>{subnetDetails.wildcardIp}</strong> • {subnetDetails.ipClass}
                    </span>
                    <span className="text-emerald-400">{subnetDetails.scope}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('IPv4/IPv6 Subnetting & CIDR Topology Engine', {
                      ip: subnetIp,
                      cidr: `/${cidrBits}`,
                      calculatedSubnet: subnetDetails,
                      planningRequest: 'Generate 4 segmented VLAN subnets for VoIP, Management, Staff, and Guest Wi-Fi.',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini IP Architecture Planner</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.7: Ethernet TDR Cable Fault & Pinout Tester */}
          {/* ======================================================== */}
          {activeTool === 'cable_tdr' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Cable className="w-5 h-5 text-[#06b6d4]" />
                    Ethernet TDR Cable Fault & RJ45 Pinout Tester
                  </h3>
                  <p className="text-xs text-gray-400">
                    T568A vs T568B color coding standards and Time-Domain Reflectometry distance-to-fault calculations.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setCableStandard('T568A')}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      cableStandard === 'T568A' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    T568A
                  </button>
                  <button
                    onClick={() => setCableStandard('T568B')}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      cableStandard === 'T568B' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    T568B (Commercial Standard)
                  </button>
                </div>
              </div>

              {/* Pinout Visualizer */}
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3 font-mono">
                <span className="text-xs text-gray-400 block font-bold">
                  RJ45 Connector Pin Assignment ({cableStandard}):
                </span>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                  {RJ45_PINOUT_MATRIX.map((pin) => {
                    const colorLabel = cableStandard === 'T568A' ? pin.t568A : pin.t568B;
                    const isOrange = colorLabel.includes('Orange');
                    const isGreen = colorLabel.includes('Green');
                    const isBlue = colorLabel.includes('Blue');
                    const isBrown = colorLabel.includes('Brown');

                    return (
                      <div
                        key={pin.pin}
                        className="p-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col items-center justify-between h-28"
                      >
                        <span className="text-[10px] text-gray-500 font-bold">Pin {pin.pin}</span>
                        <div
                          className={`w-3.5 h-12 rounded ${
                            isOrange
                              ? 'bg-orange-500'
                              : isGreen
                              ? 'bg-emerald-500'
                              : isBlue
                              ? 'bg-blue-500'
                              : isBrown
                              ? 'bg-amber-900'
                              : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-[9px] text-gray-300 leading-tight">{colorLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated TDR Distance Calculation */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm font-bold text-white">Simulated TDR Distance-to-Fault</span>
                  <span className="text-amber-400">Speed of Light in Copper: ~{cableNvp * 100}% c</span>
                </div>

                {(() => {
                  // Distance = (Speed of Light in Vacuum * NVP * time) / 2
                  // c = 0.29979 meters per nanosecond
                  const c_m_ns = 0.299792;
                  const faultDistMeters = ((c_m_ns * cableNvp * tdrSignalTimeNs) / 2).toFixed(1);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Measured Signal Return Time:</span>
                        <strong className="text-cyan-400">{tdrSignalTimeNs} ns</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Calculated Distance-to-Break:</span>
                        <strong className="text-amber-400 text-sm">{faultDistMeters} meters (~{(parseFloat(faultDistMeters) * 3.28084).toFixed(1)} ft)</strong>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Indicates an electrical reflection (open circuit or crushed kink) at {faultDistMeters} meters from bench patch panel.
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Ethernet TDR Cable Fault & Pinout Tester', {
                      standard: cableStandard,
                      cableLength: `${cableLengthMeters}m`,
                      tdrReturnTime: `${tdrSignalTimeNs}ns`,
                      nvpFactor: cableNvp,
                      faultType: simulatedWireFault,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Cable Infrastructure Copilot</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 2.8: DNS, Ping & Route Propagation Triage Suite */}
          {/* ======================================================== */}
          {activeTool === 'dns_route_triage' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Route className="w-5 h-5 text-[#06b6d4]" />
                    DNS, Ping & Route Propagation Triage
                  </h3>
                  <p className="text-xs text-gray-400">
                    Node-by-node hop latency analysis, jitter gauges, and DNS authoritative resolution verification.
                  </p>
                </div>
              </div>

              {/* Hop Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Traceroute Hop Route to {tracerouteTarget}:</span>
                  <span className="text-emerald-400">5 Hops • Average 12.1ms</span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {simulatedHops.map((h) => (
                    <div
                      key={h.hop}
                      className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center text-[10px] font-bold">
                          {h.hop}
                        </span>
                        <div>
                          <strong className="text-white">{h.ip}</strong>
                          <span className="text-[10px] text-gray-500 ml-2">({h.name})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400 font-bold">{h.latency} ms</span>
                        <span className="text-[10px] text-gray-500 ml-2">0% loss</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('DNS, Ping & Route Propagation Triage Suite', {
                      destination: tracerouteTarget,
                      hops: simulatedHops,
                      averageLatency: '12.1ms',
                      dnsDomain: dnsQueryDomain,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Routing & Latency Diagnostician</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Universal AI Co-Pilot Panel */}
        {isAiDrawerOpen && (
          <div className="xl:col-span-1 bg-[#111827] border border-[#06b6d4]/40 rounded-xl p-4 shadow-xl space-y-4 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                <span className="font-mono font-bold text-white text-xs">
                  Gemini SysAdmin & Network Co-Pilot
                </span>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Question Box */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                SysAdmin / Network Question
              </label>
              <textarea
                rows={2}
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ask specific networking question (e.g. How to prevent STP loops?)..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-200 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            {/* AI Output Container */}
            <div className="flex-1 bg-gray-950 rounded-xl p-3.5 border border-gray-800/80 overflow-y-auto space-y-3 font-mono text-xs">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#06b6d4] animate-spin" />
                  <span className="text-gray-400">
                    Querying Gemini Cisco CCNA & SysAdmin Engine...
                  </span>
                </div>
              ) : aiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
                    <span className="text-[#06b6d4] font-bold">{aiResponse.modelUsed}</span>
                    <span>{aiResponse.timestamp}</span>
                  </div>
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {aiResponse.analysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <Bot className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-[11px]">
                    Select any of the 8 SysAdmin tools and click the AI button to audit configs and analyze packet topologies.
                  </p>
                </div>
              )}
            </div>

            {/* Prompt Shortcut Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Shortcut Queries:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setAiCustomPrompt('Audit this switch configuration for Native VLAN hopping vulnerabilities.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  VLAN Hopping?
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Explain how BPDU Guard prevents accidental rogue switch insertions.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  BPDU Guard
                </button>
                <button
                  onClick={() => setAiCustomPrompt('What causes an APIPA 169.254.x.x address and how to isolate it on the bench?')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  APIPA Fix
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#06b6d4]" />
                Gemini API Key Configuration
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Enter your Google AI Studio Gemini API Key below. When saved, Module 2 executes direct client-side requests to{' '}
              <code className="text-[#06b6d4] font-mono">gemini-1.5-flash:generateContent</code>. If left empty, requests automatically use the server backend proxy.
            </p>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                GEMINI_API_KEY
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setCustomApiKey('');
                  setStoredGeminiApiKey('');
                  addToast({
                    type: 'info',
                    title: 'API Key Cleared',
                    message: 'Module 2 will use the server-side proxy fallback.',
                  });
                  setIsKeyModalOpen(false);
                }}
                className="text-xs font-mono text-red-400 hover:underline"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStoredGeminiApiKey(customApiKey);
                    addToast({
                      type: 'success',
                      title: 'API Key Saved',
                      message: 'Client-side Gemini API calls enabled in localStorage.',
                    });
                    setIsKeyModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
