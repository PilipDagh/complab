/**
 * Comprehensive Enterprise Networking, MAC OUI, CLI Config & Hardware Database
 * Pre-loaded with dozens of real-world enterprise vendors, scripts, and diagnostic presets.
 */

export interface MacOuiEntry {
  prefix: string; // e.g. "00:1A:2B" or "B8:27:EB"
  vendor: string;
  category: 'Enterprise Switch/Router' | 'Compute / Server' | 'Workstation / Laptop' | 'IoT / Embedded' | 'Virtualization' | 'Network Appliance';
  typicalBus: 'PCIe 3.0/4.0' | 'Integrated SoC' | 'USB 3.0' | 'Thunderbolt' | 'SFP+ / QSFP';
  maxLinkRate: '100 Mbps' | '1 Gbps' | '2.5 Gbps' | '10 Gbps' | '25/40 Gbps' | '40 Gbps' | '100 Gbps';
  commonChipset: string;
  securityRecommendation: string;
}

export const ENTERPRISE_MAC_OUI_DATABASE: MacOuiEntry[] = [
  // Cisco Systems
  { prefix: '00:00:0C', vendor: 'Cisco Systems', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'Catalyst ASIC (Doppler/UADP)', securityRecommendation: 'Enforce 802.1X, DAI (Dynamic ARP Inspection), and DHCP Snooping on edge ports.' },
  { prefix: '00:01:42', vendor: 'Cisco Systems', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '100 Gbps', commonChipset: 'Nexus Cloud Scale ASIC', securityRecommendation: 'Isolate management VRF from user data plane; disable Telnet/HTTP.' },
  { prefix: '00:1B:54', vendor: 'Cisco Meraki', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'Qualcomm / Broadcom Enterprise', securityRecommendation: 'Check Meraki Dashboard for rogue AP rogue isolation rules.' },
  { prefix: '70:69:79', vendor: 'Cisco Systems', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '40 Gbps', commonChipset: 'Catalyst 9000 Silicon', securityRecommendation: 'Enable Control Plane Policing (CoPP) to mitigate DoS attacks.' },

  // Intel Corporation
  { prefix: '00:1B:21', vendor: 'Intel Corporation', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'Intel 82574L / I210-T1 Gigabit Controller', securityRecommendation: 'Standard client workstation. Apply DHCP reservation or MAC sticky port security.' },
  { prefix: '68:05:CA', vendor: 'Intel Corporation', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'Intel I219-V / I219-LM PHY', securityRecommendation: 'Enable Intel AMT remote management security locks if vPro is provisioned.' },
  { prefix: '94:C6:91', vendor: 'Intel Corporation', category: 'Compute / Server', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '2.5 Gbps', commonChipset: 'Intel I225-V / I226-V (B3 stepping)', securityRecommendation: 'Verify firmware 1.45+ to prevent 2.5G sleep packet drop micro-stutters.' },
  { prefix: '00:1E:67', vendor: 'Intel Corporation', category: 'Compute / Server', typicalBus: 'SFP+ / QSFP', maxLinkRate: '10 Gbps', commonChipset: 'Intel X520 / X540 / X550 10GbE', securityRecommendation: 'Server hypervisor or SAN link. Bind to LACP port channel with Jumbo Frames (MTU 9000).' },

  // Apple Inc.
  { prefix: 'AC:BC:32', vendor: 'Apple Inc.', category: 'Workstation / Laptop', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'Apple Silicon Aquantia 10GbE / Broadcom', securityRecommendation: 'Mac Studio / MacBook Pro. Verify Private Wi-Fi Address randomized MAC toggle in macOS.' },
  { prefix: '3C:06:30', vendor: 'Apple Inc.', category: 'Workstation / Laptop', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'Apple Wi-Fi 6E / Broadcom BCM4378', securityRecommendation: 'Ensure WPA3 Enterprise 802.1X PEAP/MSCHAPv2 profile is installed via MDM.' },
  { prefix: 'F0:18:98', vendor: 'Apple Inc.', category: 'IoT / Embedded', typicalBus: 'Integrated SoC', maxLinkRate: '100 Mbps', commonChipset: 'Apple TV / HomePod / Watch', securityRecommendation: 'Segment into IoT/Media VLAN; isolate from corporate Active Directory subnets.' },

  // Raspberry Pi Foundation
  { prefix: 'B8:27:EB', vendor: 'Raspberry Pi Foundation', category: 'IoT / Embedded', typicalBus: 'Integrated SoC', maxLinkRate: '100 Mbps', commonChipset: 'Microchip LAN9512 / LAN9514 USB NIC', securityRecommendation: 'RPi 1/2/3. Check for default username/password (pi / raspberry). Change root SSH key.' },
  { prefix: 'DC:A6:32', vendor: 'Raspberry Pi Trading', category: 'IoT / Embedded', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'Broadcom BCM54213PE Native Gigabit', securityRecommendation: 'RPi 4. Disable remote root password SSH login; restrict sudo privileges.' },
  { prefix: '2C:CF:67', vendor: 'Raspberry Pi Foundation', category: 'IoT / Embedded', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'RP1 I/O Controller ASIC', securityRecommendation: 'RPi 5. Isolate on Lab IoT VLAN with strictly controlled outbound ports.' },

  // Realtek Semiconductor
  { prefix: '00:E0:4C', vendor: 'Realtek Semiconductor', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'RTL8111H / RTL8168 Gigabit', securityRecommendation: 'Ubiquitous desktop motherboard NIC. Standard endpoint security.' },
  { prefix: '54:B8:0A', vendor: 'Realtek Semiconductor', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '2.5 Gbps', commonChipset: 'RTL8125B / RTL8125BG 2.5GbE', securityRecommendation: 'Modern gaming / workstation motherboard. Enable Flow Control (Rx/Tx) in switch settings.' },
  { prefix: '00:0A:CD', vendor: 'Realtek Semiconductor', category: 'Workstation / Laptop', typicalBus: 'USB 3.0', maxLinkRate: '1 Gbps', commonChipset: 'RTL8153 USB 3.0 Gigabit Dongle', securityRecommendation: 'USB Ethernet adapter. Watch for MAC address flapping if docked across multiple laptops.' },

  // Ubiquiti Networks
  { prefix: 'F0:9F:C2', vendor: 'Ubiquiti Inc.', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'UniFi Switch Pro / AP U6 Enterprise', securityRecommendation: 'UniFi hardware. Verify controller informs via TLS (Port 8080/TCP) and isolate management VLAN.' },
  { prefix: '74:83:C2', vendor: 'Ubiquiti Inc.', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'UniFi Dream Machine (UDM-Pro)', securityRecommendation: 'Edge security gateway. Verify IDS/IPS signature updates are active.' },
  { prefix: '24:5A:4C', vendor: 'Ubiquiti Inc.', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'EdgeRouter Infinity / EdgeSwitch', securityRecommendation: 'Disable unused services (ubnt-discover, telnet, LLDP-MED).' },

  // Dell / HP / Lenovo Enterprise
  { prefix: '00:14:22', vendor: 'Dell Inc.', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'OptiPlex / Latitude OEM Controller', securityRecommendation: 'Dell desktop / laptop. Check for Dell Command | Update BIOS security CVEs.' },
  { prefix: '18:66:DA', vendor: 'Dell EMC Enterprise', category: 'Compute / Server', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'Integrated Dell Remote Access (iDRAC 9)', securityRecommendation: 'Out-of-band server management! Must NEVER be routable to public internet. Enforce dedicated VLAN.' },
  { prefix: 'D8:D3:85', vendor: 'Hewlett Packard Enterprise', category: 'Compute / Server', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'HPE iLO 5 / iLO 6 Remote Controller', securityRecommendation: 'Isolate iLO to private OOB management subnet with LDAP/MFA enforcement.' },
  { prefix: '00:21:5A', vendor: 'HP Inc.', category: 'Network Appliance', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'HP LaserJet Enterprise JetDirect', securityRecommendation: 'Network printer. Disable Telnet, FTP, and SNMPv1/v2; mandate SNMPv3 and TLS printing.' },
  { prefix: 'E4:54:E8', vendor: 'Lenovo Group', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '1 Gbps', commonChipset: 'ThinkPad T/X Series Motherboard', securityRecommendation: 'Verify MAC address pass-through settings in USB-C ThinkPad docking station.' },

  // Arista & MikroTik & Juniper
  { prefix: '00:1C:73', vendor: 'Arista Networks', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '100 Gbps', commonChipset: 'EOS Cloud Datacenter ASIC', securityRecommendation: 'Datacenter leaf/spine. Enforce strict BGP authentication and TACACS+ AAA.' },
  { prefix: '48:8F:5A', vendor: 'MikroTik RouterOS', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'CCR / Cloud Router Switch', securityRecommendation: 'RouterOS. Change default port 8291 (WinBox), disable neighbor discovery on WAN.' },
  { prefix: '00:26:88', vendor: 'Juniper Networks', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '40 Gbps', commonChipset: 'Junos EX / MX Series', securityRecommendation: 'Enforce commit confirmed timeout to prevent accidental lockouts.' },

  // Virtualization Hypervisors
  { prefix: '00:50:56', vendor: 'VMware Inc.', category: 'Virtualization', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '10 Gbps', commonChipset: 'VMware vSphere VMXNET3 Virtual NIC', securityRecommendation: 'Virtual Machine guest. Verify promiscuous mode and MAC address changes are rejected on vSwitch.' },
  { prefix: '00:15:5D', vendor: 'Microsoft Hyper-V', category: 'Virtualization', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '10 Gbps', commonChipset: 'Hyper-V Synthetic Network Adapter', securityRecommendation: 'Enable DHCP Guard and Router Guard in Hyper-V virtual switch settings.' },
  { prefix: '52:54:00', vendor: 'QEMU / KVM / Proxmox', category: 'Virtualization', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '10 Gbps', commonChipset: 'VirtIO Paravirtualized NIC', securityRecommendation: 'Virtual container or KVM node. Apply firewall rules on Proxmox bridge interface (vmbr0).' },

  // Espressif / IoT Devices
  { prefix: 'A4:CF:12', vendor: 'Espressif Inc.', category: 'IoT / Embedded', typicalBus: 'Integrated SoC', maxLinkRate: '100 Mbps', commonChipset: 'ESP32 Wi-Fi / Bluetooth Microcontroller', securityRecommendation: 'Smart plug, sensor, or custom lab rig. Put on isolated 2.4GHz IoT SSID with client isolation.' },
  { prefix: '24:0A:C4', vendor: 'Espressif Inc.', category: 'IoT / Embedded', typicalBus: 'Integrated SoC', maxLinkRate: '100 Mbps', commonChipset: 'ESP8266 Wi-Fi SoC', securityRecommendation: 'Legacy 802.11b/g IoT device. Restrict from accessing local internal subnet resources.' },

  // Network Storage / NAS
  { prefix: '00:11:32', vendor: 'Synology Inc.', category: 'Network Appliance', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '10 Gbps', commonChipset: 'DiskStation DSM Storage Controller', securityRecommendation: 'NAS appliance. Disable default admin account, enforce Auto-Block IP brute-force protection.' },
  { prefix: '24:5E:BE', vendor: 'QNAP Systems', category: 'Network Appliance', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '10 Gbps', commonChipset: 'QTS Enterprise Storage NIC', securityRecommendation: 'Disable myQNAPcloud public UPnP exposure; disable unneeded Telnet/SSH services.' },

  // Enterprise Security Firewalls & Appliances
  { prefix: '00:09:0F', vendor: 'Fortinet Inc.', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '40 Gbps', commonChipset: 'FortiGate Security Processor CP9/NP7', securityRecommendation: 'FortiGate UTM firewall. Update FortiOS to remediate SSL-VPN heap buffer overflow vulnerabilities.' },
  { prefix: '00:1B:17', vendor: 'Palo Alto Networks', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '100 Gbps', commonChipset: 'PAN-OS Enterprise Firewall Management', securityRecommendation: 'Next-Gen Firewall. Enforce GlobalProtect multi-factor authentication and strict App-ID filtering.' },
  { prefix: '00:06:B1', vendor: 'SonicWall Inc.', category: 'Enterprise Switch/Router', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'SonicOS NSA Series Security Gateway', securityRecommendation: 'Enforce SonicWall Capture ATP cloud sandboxing and disable WAN management HTTPS access.' },
  { prefix: '00:1A:8C', vendor: 'Sophos Ltd.', category: 'Network Appliance', typicalBus: 'Integrated SoC', maxLinkRate: '10 Gbps', commonChipset: 'XGS Series Hardware Appliance', securityRecommendation: 'Isolate User Portal to internal VPN subnet; block web admin access on WAN interfaces.' },

  // Server Management & High-Speed Datacenter Fabrics
  { prefix: '00:25:90', vendor: 'Supermicro Computer', category: 'Compute / Server', typicalBus: 'Integrated SoC', maxLinkRate: '1 Gbps', commonChipset: 'ASPEED AST2500/2600 BMC IPMI', securityRecommendation: 'Out-of-band IPMI interface. Never route to office LAN. Change default ADMIN password immediately.' },
  { prefix: '00:05:1E', vendor: 'Brocade Communications', category: 'Enterprise Switch/Router', typicalBus: 'SFP+ / QSFP', maxLinkRate: '100 Gbps', commonChipset: 'Fibre Channel SAN Switch Fabric', securityRecommendation: 'Storage Area Network fabric. Enforce hard zoning by WWPN to isolate storage targets.' },
  { prefix: '00:02:C9', vendor: 'Mellanox / NVIDIA Networking', category: 'Enterprise Switch/Router', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '100 Gbps', commonChipset: 'ConnectX-5 / ConnectX-6 Dx RoCE NIC', securityRecommendation: 'High-speed RDMA fabric. Verify PFC (Priority Flow Control) and ECN are enabled to eliminate RoCE packet loss.' },
  { prefix: '00:10:18', vendor: 'Broadcom Inc.', category: 'Compute / Server', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '25/40 Gbps', commonChipset: 'NetXtreme-E BCM57414 Dual-Port SFP28', securityRecommendation: 'Datacenter server NIC. Ensure TruFlow hardware packet acceleration firmware is up to date.' },
  { prefix: '3C:06:30', vendor: 'Apple Inc.', category: 'Workstation / Laptop', typicalBus: 'Integrated SoC', maxLinkRate: '2.5 Gbps', commonChipset: 'Apple Silicon M1/M2/M3 Gigabit Ethernet', securityRecommendation: 'Verify Private Wi-Fi Address (MAC randomization) is disabled on managed enterprise 802.1X networks.' },
  { prefix: '70:CF:49', vendor: 'Intel Corporation', category: 'Workstation / Laptop', typicalBus: 'PCIe 3.0/4.0', maxLinkRate: '2.5 Gbps', commonChipset: 'Intel Wi-Fi 7 BE200 320MHz 2x2', securityRecommendation: 'Latest 802.11be Wi-Fi 7 adapter. Enforce WPA3-Enterprise 192-bit mode; disable fallback to WPA/TKIP.' },
];

export interface SysadminScriptPreset {
  id: string;
  name: string;
  category: 'System Integrity' | 'Network Stack' | 'Cache & Cleanup' | 'Diagnostics & Inventory' | 'Boot & Recovery';
  description: string;
  requiresAdmin: boolean;
  windowsBat: string;
  powershell: string;
  linuxBash: string;
}

export const SYSADMIN_SCRIPT_PRESETS: SysadminScriptPreset[] = [
  {
    id: 'sfc_dism',
    name: 'SFC System File Checker + DISM Deep Image Repair',
    category: 'System Integrity',
    description: 'Scans for corrupted Windows DLLs and replaces them from component store or Windows Update.',
    requiresAdmin: true,
    windowsBat: `@echo off
echo [TradeTech Repair] Checking Administrative Privileges...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Must be executed as Administrator!
    pause
    exit /b 1
)

echo [1/3] Scanning and Repairing Component Store (DISM ScanHealth)...
dism.exe /Online /Cleanup-Image /ScanHealth

echo [2/3] Restoring Component Store Corruption (DISM RestoreHealth)...
dism.exe /Online /Cleanup-Image /RestoreHealth

echo [3/3] Running Protected System File Integrity Check (SFC)...
sfc /scannow

echo [SUCCESS] Windows System File Integrity Check Completed.
pause`,
    powershell: `# TradeTech PowerShell 7+ System File & Image Repair Routine
# Requires Elevated Administrator Privileges

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "[SECURITY FAILURE] This script must run in an elevated PowerShell session."
    Exit 1
}

Write-Host ">>> [1/3] Querying Component Store Corruption..." -ForegroundColor Cyan
Repair-WindowsImage -Online -ScanHealth

Write-Host ">>> [2/3] Restoring Corrupted Packages via Windows Update..." -ForegroundColor Yellow
Repair-WindowsImage -Online -RestoreHealth

Write-Host ">>> [3/3] Executing Protected System File Verification (SFC)..." -ForegroundColor Green
$sfcResult = Start-Process -FilePath "sfc.exe" -ArgumentList "/scannow" -Wait -PassThru -NoNewWindow

if ($sfcResult.ExitCode -eq 0) {
    Write-Host "[OK] No file integrity violations detected." -ForegroundColor Green
} else {
    Write-Host "[WARN] SFC completed with status code $($sfcResult.ExitCode). Review CBS.log if issues persist." -ForegroundColor Yellow
}`,
    linuxBash: `#!/usr/bin/env bash
# TradeTech Linux Package Integrity and Inode Consistency Audit
if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] Must run as root (use sudo)." >&2
  exit 1
fi

echo ">>> [1/3] Verifying Installed Package Checksums..."
if command -v debsums &> /dev/null; then
    debsums -c
elif command -v rpm &> /dev/null; then
    rpm -Va
fi

echo ">>> [2/3] Checking Unattended Security Upgrades..."
apt-get update && apt-get -y --fix-broken install || yum check

echo ">>> [3/3] Inspecting Journal for Hardware & Filesystem I/O Errors..."
journalctl -p 3 -b -n 25 --no-pager
echo "[SUCCESS] Linux system integrity check complete."`,
  },
  {
    id: 'winsock_tcp',
    name: 'Reset Winsock, TCP/IP Stack & Flush ARP/DNS Resolver',
    category: 'Network Stack',
    description: 'Cures corrupted Layer 3/4 network configurations, clearing Winsock catalog and renewing IP.',
    requiresAdmin: true,
    windowsBat: `@echo off
echo [TradeTech Repair] Resetting TCP/IP Protocol Stack & Winsock...
netsh winsock reset
netsh int ip reset c:\\resetlog.txt
netsh int tcp reset
ipconfig /flushdns
nbtstat -R
nbtstat -RR
arp -d *
ipconfig /release
ipconfig /renew
echo [SUCCESS] Network stack catalog reset. Please reboot machine for changes to take full effect.
pause`,
    powershell: `# TradeTech PowerShell Network Stack Flush & Re-binding
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "[FAIL] Elevated rights required."
    Exit 1
}

Write-Host ">>> Resetting Winsock Catalog..." -ForegroundColor Cyan
& netsh winsock reset

Write-Host ">>> Resetting IPv4 & IPv6 Protocol Stacks..." -ForegroundColor Cyan
& netsh int ip reset "$env:TEMP\\netsh_reset.txt"

Write-Host ">>> Purging Local DNS Resolver Cache..." -ForegroundColor Yellow
Clear-DnsClientCache

Write-Host ">>> Clearing ARP Neighbors & Releasing DHCP Leases..." -ForegroundColor Yellow
Get-NetNeighbor | Where-Object { $_.State -ne 'Permanent' } | Remove-NetNeighbor -Confirm:$false -ErrorAction SilentlyContinue
Get-NetIPAddress -InterfaceAddressFamily IPv4 | Where-Object { $_.PrefixOrigin -eq 'Dhcp' } | ForEach-Object {
    & ipconfig /release
    & ipconfig /renew
}

Write-Host "[SUCCESS] Network stack successfully re-initialized." -ForegroundColor Green`,
    linuxBash: `#!/usr/bin/env bash
# TradeTech Linux Network Stack Flush & DHCP Re-lease
if [ "$EUID" -ne 0 ]; then
  echo "Must run as root." >&2
  exit 1
fi

echo ">>> Flushing ARP Neighbor Cache..."
ip neigh flush all

echo ">>> Flushing Local DNS Cache (systemd-resolved)..."
resolvectl flush-caches || systemctl restart systemd-resolved

echo ">>> Restarting NetworkManager Stack..."
systemctl restart NetworkManager || systemctl restart networking

echo ">>> Validating Routing Table..."
ip route show
echo "[SUCCESS] Network stack refreshed."`,
  },
  {
    id: 'update_cache',
    name: 'Purge Windows Update / SoftwareDistribution Cache',
    category: 'Cache & Cleanup',
    description: 'Fixes 0x80070002 and stuck 0% download loops by clearing corrupted update staging files.',
    requiresAdmin: true,
    windowsBat: `@echo off
echo [1/4] Stopping Windows Update and BITS Background Services...
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

echo [2/4] Renaming and Purging SoftwareDistribution & Catroot2...
ren %systemroot%\\SoftwareDistribution SoftwareDistribution.bak
ren %systemroot%\\system32\\catroot2 catroot2.bak

echo [3/4] Restarting Core Update Services...
net start wuauserv
net start cryptSvc
net start bits
net start msiserver

echo [4/4] Triggering Instant Update Check...
usoclient StartScan
echo [SUCCESS] Windows Update cache cleared successfully.
pause`,
    powershell: `# TradeTech PowerShell Update Cache Reset Routine
Write-Host ">>> Stopping Background Intelligent Transfer Service (BITS) & Windows Update..." -ForegroundColor Yellow
Stop-Service -Name wuauserv, cryptsvc, bits, msiserver -Force -ErrorAction SilentlyContinue

$swDistPath = "$env:windir\\SoftwareDistribution"
if (Test-Path $swDistPath) {
    Write-Host ">>> Purging Stale Update Payloads in $swDistPath..." -ForegroundColor Cyan
    Rename-Item -Path $swDistPath -NewName "SoftwareDistribution.old_$(Get-Date -Format 'yyyyMMddHHmm')" -Force
}

Write-Host ">>> Restarting Windows Update Services..." -ForegroundColor Green
Start-Service -Name wuauserv, cryptsvc, bits, msiserver
Write-Host "[DONE] Staging cache purged. Windows Update services operational." -ForegroundColor Green`,
    linuxBash: `#!/usr/bin/env bash
# TradeTech Linux Package Cache Cleanup
if [ "$EUID" -ne 0 ]; then
  echo "Run as root." >&2
  exit 1
fi

echo ">>> Cleaning Apt / Yum / Pacman local package cache..."
if command -v apt-get &> /dev/null; then
    apt-get clean
    apt-get autoclean
    rm -rf /var/lib/apt/lists/*
    apt-get update
elif command -v dnf &> /dev/null; then
    dnf clean all
    dnf makecache
elif command -v pacman &> /dev/null; then
    pacman -Scc --noconfirm
fi
echo "[SUCCESS] Package repository caches synchronized."`,
  },
];

export interface SwitchVendorTemplate {
  vendorId: string;
  vendorName: string;
  promptStyle: string;
  generateConfig: (params: {
    hostname: string;
    adminPass: string;
    mgmtVlan: number;
    mgmtIp: string;
    mgmtMask: string;
    accessVlans: string;
    trunkPorts: string;
    allowedVlans: string;
    nativeVlan: number;
    enableStp: boolean;
    enablePortFast: boolean;
    enableSsh: boolean;
  }) => string;
}

export const SWITCH_VENDOR_TEMPLATES: SwitchVendorTemplate[] = [
  {
    vendorId: 'cisco_ios',
    vendorName: 'Cisco IOS / IOS-XE (Catalyst 2960 / 3850 / 9200 / 9300)',
    promptStyle: 'hostname#',
    generateConfig: (p) => `! ===================================================
! Cisco IOS / IOS-XE Enterprise Configuration
! Generated by TradeTech Bench Assistant
! ===================================================
enable
configure terminal

hostname ${p.hostname}

! --- Management Security & AAA ---
service password-encryption
enable secret ${p.adminPass}
no ip domain-lookup
ip domain-name tradetech.lab

${p.enableSsh ? `! Generate RSA Key for Secure Shell (SSHv2)
crypto key generate rsa general-keys modulus 2048
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3` : ''}

! --- VLAN Database Creation ---
vlan ${p.mgmtVlan}
 name MGMT_INFRASTRUCTURE
exit

${p.accessVlans.split(',').map(v => v.trim()).filter(Boolean).map(v => `vlan ${v}
 name ACCESS_USER_VLAN_${v}
exit`).join('\n')}

! --- Management SVI (Switch Virtual Interface) ---
interface Vlan${p.mgmtVlan}
 description Management SVI
 ip address ${p.mgmtIp} ${p.mgmtMask}
 no shutdown
exit

! --- Trunk Port Uplink Configuration ---
interface range ${p.trunkPorts}
 description 802.1Q Enterprise Uplink Trunk
 switchport mode trunk
 switchport trunk native vlan ${p.nativeVlan}
 switchport trunk allowed vlan ${p.allowedVlans}
 no shutdown
exit

! --- Spanning Tree Protocol (STP) Hardening ---
${p.enableStp ? `spanning-tree mode rapid-pvst
spanning-tree portfast bpduguard default` : 'no spanning-tree'}

${p.enablePortFast ? `! Global PortFast for Fast End-User Edge Transition
spanning-tree portfast default` : ''}

! --- VTY Administrative Remote Access ---
line vty 0 15
 ${p.enableSsh ? 'transport input ssh' : 'transport input all'}
 login local
 exec-timeout 10 0
exit

line con 0
 logging synchronous
 exec-timeout 15 0
exit

end
write memory
! [SUCCESS] Configuration written to NVRAM.`,
  },
  {
    vendorId: 'aruba_cx',
    vendorName: 'Aruba CX (6000 / 6100 / 6200 Series)',
    promptStyle: 'hostname(config)#',
    generateConfig: (p) => `; Aruba CX Enterprise Network Configuration
; TradeTech Vocational Automation
configure terminal
hostname ${p.hostname}

vlan ${p.mgmtVlan}
    name MGMT_VLAN_${p.mgmtVlan}
exit

${p.accessVlans.split(',').map(v => v.trim()).filter(Boolean).map(v => `vlan ${v}
    name DATA_VLAN_${v}
exit`).join('\n')}

interface vlan ${p.mgmtVlan}
    ip address ${p.mgmtIp}/${cidrFromMask(p.mgmtMask)}
    no shutdown
exit

interface ${p.trunkPorts}
    description Uplink_Trunk_To_Core
    no routing
    vlan trunk native ${p.nativeVlan}
    vlan trunk allowed ${p.allowedVlans}
    no shutdown
exit

${p.enableStp ? `spanning-tree
spanning-tree mode rpvst
spanning-tree bpdu-guard` : ''}

${p.enableSsh ? `ssh server vrf default
crypto key generate rsa 2048` : ''}

exit
write memory`,
  },
  {
    vendorId: 'mikrotik',
    vendorName: 'MikroTik RouterOS (Bridge VLAN Filtering)',
    promptStyle: '[admin@MikroTik] >',
    generateConfig: (p) => `# MikroTik RouterOS Bridge VLAN Filtering Script
/system identity set name="${p.hostname}"

# Create master bridge with VLAN filtering enabled
/interface bridge
add name=bridge1 vlan-filtering=no

# Add trunk and access ports to bridge
/interface bridge port
add bridge=bridge1 interface=${p.trunkPorts} pvid=${p.nativeVlan}

# Define VLAN tags on bridge
/interface bridge vlan
add bridge=bridge1 tagged=bridge1,${p.trunkPorts} vlan-ids=${p.allowedVlans}

# Add Management IP Address to VLAN interface
/interface vlan
add interface=bridge1 name=vlan${p.mgmtVlan} vlan-id=${p.mgmtVlan}

/ip address
add address=${p.mgmtIp}/${cidrFromMask(p.mgmtMask)} interface=vlan${p.mgmtVlan}

# Enable secure services only
/ip service
set telnet disabled=yes
set ftp disabled=yes
set www disabled=yes
set ssh port=22 disabled=no
set winbox disabled=no

# Enable bridge VLAN filtering safely
/interface bridge set bridge1 vlan-filtering=yes
/system backup save name=tradetech_backup`,
  },
  {
    vendorId: 'ubiquiti_edge',
    vendorName: 'Ubiquiti EdgeSwitch / EdgeRouter CLI',
    promptStyle: '(UBNT EdgeSwitch) #',
    generateConfig: (p) => `! Ubiquiti EdgeSwitch CLI Configuration
enable
configure
set system host-name ${p.hostname}

vlan database
vlan ${p.mgmtVlan},${p.allowedVlans}
exit

interface vlan ${p.mgmtVlan}
routing
ip address ${p.mgmtIp} ${p.mgmtMask}
exit

interface ${p.trunkPorts}
vlan pvid ${p.nativeVlan}
vlan participation include ${p.allowedVlans}
vlan tagging ${p.allowedVlans}
exit

${p.enableStp ? `spanning-tree mode rstp
spanning-tree edge-port default` : ''}

write memory`,
  },
];

function cidrFromMask(mask: string): number {
  const parts = mask.split('.').map(Number);
  let bits = 0;
  for (const p of parts) {
    bits += (p.toString(2).match(/1/g) || []).length;
  }
  return bits || 24;
}

export interface CablePinoutSpec {
  pin: number;
  t568A: string;
  t568B: string;
  pairNumber: string;
  gigabitRole: string; // 1000BASE-T bi-directional pair
  fastEthernetRole: string; // 100BASE-TX TX+/TX- or RX+/RX-
}

export const RJ45_PINOUT_MATRIX: CablePinoutSpec[] = [
  { pin: 1, t568A: 'White / Green', t568B: 'White / Orange', pairNumber: 'Pair 3 (A) / Pair 2 (B)', gigabitRole: 'BI_DA+ (Bidirectional Data A+)', fastEthernetRole: 'TX+ (Transmit Data Positive)' },
  { pin: 2, t568A: 'Green', t568B: 'Orange', pairNumber: 'Pair 3 (A) / Pair 2 (B)', gigabitRole: 'BI_DA- (Bidirectional Data A-)', fastEthernetRole: 'TX- (Transmit Data Negative)' },
  { pin: 3, t568A: 'White / Orange', t568B: 'White / Green', pairNumber: 'Pair 2 (A) / Pair 3 (B)', gigabitRole: 'BI_DB+ (Bidirectional Data B+)', fastEthernetRole: 'RX+ (Receive Data Positive)' },
  { pin: 4, t568A: 'Blue', t568B: 'Blue', pairNumber: 'Pair 1', gigabitRole: 'BI_DC+ (Bidirectional Data C+)', fastEthernetRole: 'Unused / PoE V+ (Alternative B)' },
  { pin: 5, t568A: 'White / Blue', t568B: 'White / Blue', pairNumber: 'Pair 1', gigabitRole: 'BI_DC- (Bidirectional Data C-)', fastEthernetRole: 'Unused / PoE V+ (Alternative B)' },
  { pin: 6, t568A: 'Orange', t568B: 'Green', pairNumber: 'Pair 2 (A) / Pair 3 (B)', gigabitRole: 'BI_DB- (Bidirectional Data B-)', fastEthernetRole: 'RX- (Receive Data Negative)' },
  { pin: 7, t568A: 'White / Brown', t568B: 'White / Brown', pairNumber: 'Pair 4', gigabitRole: 'BI_DD+ (Bidirectional Data D+)', fastEthernetRole: 'Unused / PoE V- (Alternative B)' },
  { pin: 8, t568A: 'Brown', t568B: 'Brown', pairNumber: 'Pair 4', gigabitRole: 'BI_DD- (Bidirectional Data D-)', fastEthernetRole: 'Unused / PoE V- (Alternative B)' },
];
