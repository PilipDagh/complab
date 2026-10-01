/**
 * Comprehensive Vocational Education & CompTIA Study Suite Database
 * Covers CompTIA A+ (220-1101/1102), Network+ (N10-008), and Security+ (SY0-701)
 */

export interface CompTiaAcronym {
  acronym: string;
  fullName: string;
  domain: 'Hardware' | 'Networking' | 'Security' | 'Cloud' | 'Troubleshooting';
  definition: string;
  analogy: string;
}

export const COMPTIA_ACRONYM_DATABASE: CompTiaAcronym[] = [
  { acronym: 'APIPA', fullName: 'Automatic Private IP Addressing', domain: 'Networking', definition: 'DHCP fallback address in the 169.254.0.1 to 169.254.255.254 range assigned when client receives no DHCP offer.', analogy: 'Like staying in a hotel lobby because the front desk lost your room key reservation.' },
  { acronym: 'CIDR', fullName: 'Classless Inter-Domain Routing', domain: 'Networking', definition: 'IP addressing scheme using prefix notation (e.g. /24) allowing flexible, variable-length subnetting.', analogy: 'Like slicing a pizza into custom slices rather than rigid predetermined boxes.' },
  { acronym: 'DKIM', fullName: 'DomainKeys Identified Mail', domain: 'Security', definition: 'Email authentication method using cryptographic public/private key pairs to detect email spoofing.', analogy: 'A wax seal with a signet ring on an envelope that proves the letter was not opened or altered.' },
  { acronym: 'ECC', fullName: 'Error-Correcting Code', domain: 'Hardware', definition: 'Memory architecture that detects and corrects single-bit memory errors to prevent system crashes.', analogy: 'An onboard proofreader on a conveyor belt catching typo errors in real time.' },
  { acronym: 'FQDN', fullName: 'Fully Qualified Domain Name', domain: 'Networking', definition: 'Complete domain name that specifies its exact location in the DNS tree hierarchy (e.g., host.example.com.).', analogy: 'A complete mailing address including country, state, city, street, and apartment number.' },
  { acronym: 'GUID', fullName: 'Globally Unique Identifier', domain: 'Hardware', definition: 'A 128-bit number used in modern GPT partition tables to identify disks and partitions uniquely.', analogy: 'A global digital fingerprint that has zero probability of collision anywhere on earth.' },
  { acronym: 'HDCP', fullName: 'High-bandwidth Digital Content Protection', domain: 'Hardware', definition: 'Digital copy protection protocol encrypted over HDMI and DisplayPort connections.', analogy: 'A bouncer checking digital wristbands between the video player and the TV screen.' },
  { acronym: 'IGMP', fullName: 'Internet Group Management Protocol', domain: 'Networking', definition: 'Layer 3 protocol used by IPv4 hosts to report IP multicast group memberships to routers.', analogy: 'Subscribing to a newsletter so the mail carrier only delivers copies to people on the mailing list.' },
  { acronym: 'JSON', fullName: 'JavaScript Object Notation', domain: 'Cloud', definition: 'Lightweight text-based open standard data interchange format used in web services and REST APIs.', analogy: 'A standardized index card format that any clerk in any country can read without translation.' },
  { acronym: 'KVM', fullName: 'Keyboard, Video, Mouse Switch', domain: 'Hardware', definition: 'Hardware device allowing a bench technician to control multiple computers from a single console.', analogy: 'A single steering wheel that can switch between driving four different cars.' },
  { acronym: 'LACP', fullName: 'Link Aggregation Control Protocol (802.3ad)', domain: 'Networking', definition: 'Combines multiple physical network cables into a single logical channel for redundancy and bandwidth.', analogy: 'Opening two extra lanes on a highway to let double the traffic flow under a single speed limit.' },
  { acronym: 'MIMO', fullName: 'Multiple Input, Multiple Output', domain: 'Networking', definition: 'Wireless antenna technology using multipath signal propagation to transmit multiple data streams.', analogy: 'Speaking to someone with two mouths while they listen with two ears simultaneously.' },
  { acronym: 'NVMe', fullName: 'Non-Volatile Memory Express', domain: 'Hardware', definition: 'Storage protocol designed for high-speed SSDs connecting directly over the PCIe bus with up to 64k queues.', analogy: 'Taking an express elevator straight to your penthouse instead of riding a slow crowded freight lift.' },
  { acronym: 'OSPF', fullName: 'Open Shortest Path First', domain: 'Networking', definition: 'Link-state interior gateway routing protocol using Dijkstra algorithm to compute loop-free shortest paths.', analogy: 'A live GPS navigation app recalculating the fastest route based on real-time traffic and road closures.' },
  { acronym: 'PCI-DSS', fullName: 'Payment Card Industry Data Security Standard', domain: 'Security', definition: 'Mandatory security compliance standard for entities that process credit card information.', analogy: 'A armored bank vault inspection checklist required before you are allowed to store gold coins.' },
  { acronym: 'QUIC', fullName: 'Quick UDP Internet Connections', domain: 'Networking', definition: 'Multiplexed transport protocol built on top of UDP designed by Google, foundation of HTTP/3.', analogy: 'A courier that drops letters directly into your hands without waiting to sign for a return receipt.' },
  { acronym: 'RAID', fullName: 'Redundant Array of Independent Disks', domain: 'Hardware', definition: 'Storage technology combining multiple physical disk drives into a single logical unit for redundancy/performance.', analogy: 'Splitting your luggage across two airplanes so if one plane crashes, your clothes are still safe.' },
  { acronym: 'SIEM', fullName: 'Security Information and Event Management', domain: 'Security', definition: 'Centralized software aggregating security event logs across network firewalls and endpoints.', analogy: 'A control room with 100 security monitor screens watched by an automated alarm system.' },
  { acronym: 'TPM', fullName: 'Trusted Platform Module', domain: 'Security', definition: 'Hardware cryptographic coprocessor on motherboards storing BitLocker keys and measuring boot integrity.', analogy: 'A tiny bank safe welded to the motherboard that refuses to open if the motherboard was tampered with.' },
  { acronym: 'UPnP', fullName: 'Universal Plug and Play', domain: 'Networking', definition: 'Protocol allowing devices to discover each other and automatically configure firewall port forwards.', analogy: 'A guest walking into your house and unlocking the front door from the inside without asking permission.' },
  { acronym: 'VLAN', fullName: 'Virtual Local Area Network', domain: 'Networking', definition: 'Logical subnetwork segmented at Layer 2 switch level using 802.1Q tags.', analogy: 'Drawing a soundproof glass partition down the middle of an office room.' },
  { acronym: 'WPA3', fullName: 'Wi-Fi Protected Access 3', domain: 'Security', definition: 'Modern Wi-Fi security standard utilizing SAE (Simultaneous Authentication of Equals) and 192-bit enterprise cipher.', analogy: 'A secret handshake protocol that makes it mathematically impossible for an eavesdropper to guess the password.' },
  { acronym: 'XSS', fullName: 'Cross-Site Scripting', domain: 'Security', definition: 'Web vulnerability where malicious executable scripts are injected into trusted web applications.', analogy: 'Slipping a fake instruction note into a restaurant recipe book that tells the chef to poison the soup.' },
  { acronym: 'BGP', fullName: 'Border Gateway Protocol', domain: 'Networking', definition: 'The routing protocol of the global Internet (EGP) exchanging prefix reachability between Autonomous Systems.', analogy: 'The air traffic control system routing international flights between sovereign nations.' },
  { acronym: 'PoE', fullName: 'Power over Ethernet (802.3af/at/bt)', domain: 'Networking', definition: 'Method of passing electrical power along with data on twisted pair Ethernet cable (up to 90W on Type 4).', analogy: 'Drinking water through a straw that also delivers electricity to power your phone.' },
  { acronym: 'EDR', fullName: 'Endpoint Detection and Response', domain: 'Security', definition: 'Security solution that continuously monitors end-user devices to detect and respond to cyber threats like ransomware.', analogy: 'A dedicated armed security guard stationed inside every single office cubicle.' },
  { acronym: 'SOAR', fullName: 'Security Orchestration, Automation, and Response', domain: 'Security', definition: 'Platform integrating disparate security tools and automating routine incident response workflows.', analogy: 'An automated emergency response system that triggers fire sprinklers, locks blast doors, and calls 911 instantly.' },
  { acronym: 'IAM', fullName: 'Identity and Access Management', domain: 'Security', definition: 'Framework of policies and technologies ensuring appropriate users have specific access to technology resources.', analogy: 'The master keycard system of an enterprise building determining which doors your badge can unlock.' },
  { acronym: 'CASB', fullName: 'Cloud Access Security Broker', domain: 'Cloud', definition: 'Security enforcement point placed between cloud service consumers and cloud service providers to inject enterprise security policies.', analogy: 'A customs border checkpoint inspecting all luggage entering and leaving a free trade zone.' },
  { acronym: 'RTO', fullName: 'Recovery Time Objective', domain: 'Troubleshooting', definition: 'Target duration of time within which a business process must be restored after a disaster or system failure.', analogy: 'The maximum minutes an ambulance is allowed to take to reach the scene of an emergency.' },
  { acronym: 'RPO', fullName: 'Recovery Point Objective', domain: 'Troubleshooting', definition: 'Maximum acceptable amount of data loss measured in time (e.g. 1 hour of lost transactions).', analogy: 'How many photos on your camera you can tolerate losing if your memory card corrupts before you sync.' },
  { acronym: 'MTBF', fullName: 'Mean Time Between Failures', domain: 'Hardware', definition: 'Statistical metric indicating the average operational lifespan between system or hardware component breakdowns.', analogy: 'The average number of miles a car model travels before its first mechanical breakdown.' },
  { acronym: 'MTTR', fullName: 'Mean Time to Repair', domain: 'Troubleshooting', definition: 'The average time required for a technician to diagnose, replace, and restore a failed hardware component to full service.', analogy: 'The time a NASCAR pit crew spends replacing 4 tires and refueling during a race.' },
  { acronym: 'SPF', fullName: 'Sender Policy Framework', domain: 'Security', definition: 'DNS TXT record listing all authorized IP addresses permitted to send email on behalf of a specific domain.', analogy: 'A public guest list at a VIP club entry verifying which promoters are authorized to invite guests.' },
  { acronym: 'DMARC', fullName: 'Domain-based Message Authentication, Reporting & Conformance', domain: 'Security', definition: 'Email authentication protocol leveraging SPF and DKIM to instruct receiving servers how to handle failed authentication (reject vs quarantine).', analogy: 'The supervisor who decides whether to shred or quarantine mail when the signature does not match.' },
  { acronym: 'HSRP', fullName: 'Hot Standby Router Protocol', domain: 'Networking', definition: 'Cisco proprietary redundancy protocol allowing several routers to appear as a single virtual default gateway (VIP).', analogy: 'A co-pilot ready to grab the flight controls the exact microsecond the pilot loses consciousness.' },
  { acronym: 'BIA', fullName: 'Business Impact Analysis', domain: 'Troubleshooting', definition: 'Systematic process to determine and evaluate the potential effects of an interruption to critical business operations.', analogy: 'A fire drill calculation assessing how many dollars the company loses for every minute the factory ceases operations.' },
];

export interface BootableIsoTool {
  id: string;
  name: string;
  category: 'Disk & Imaging' | 'Memory & Stress' | 'Rescue & Antivirus' | 'Partitioning' | 'Data Sanitization';
  description: string;
  bootModes: 'UEFI & Legacy' | 'UEFI Only' | 'Legacy CSM Only';
  minRam: string;
  targetUseCases: string;
  ventoyTip: string;
}

export const DIAGNOSTIC_ISO_CATALOG: BootableIsoTool[] = [
  {
    id: 'memtest86',
    name: 'MemTest86+ (v7.0+ Open Source)',
    category: 'Memory & Stress',
    description: 'Thorough, stand-alone memory test for x86 and x86-64 computers. Isolates bad RAM bits and IMC errors.',
    bootModes: 'UEFI & Legacy',
    minRam: '64 MB',
    targetUseCases: 'Random BSOD crashes, corrupt Windows install loops, overclocking stability, bad DIMM isolation.',
    ventoyTip: 'Drop memtest86.iso into Ventoy root. Run Test 8 (Random number sequence) to stress memory controller.',
  },
  {
    id: 'clonezilla',
    name: 'Clonezilla Live (Debian / Ubuntu)',
    category: 'Disk & Imaging',
    description: 'Bare-metal partition and disk cloning/imaging utility. Supports massive parallel deployment via Multicast.',
    bootModes: 'UEFI & Legacy',
    minRam: '1 GB',
    targetUseCases: 'Cloning failing drives before repair, lab workstation image deployment, full backup before board rework.',
    ventoyTip: 'Use Expert mode with -rescue flag when cloning drives with bad sectors to ignore read failures.',
  },
  {
    id: 'hirens',
    name: 'Hiren\'s BootCD PE (Windows 11 PE)',
    category: 'Rescue & Antivirus',
    description: 'Emergency rescue environment based on Windows 11 PE x64 with 100+ diagnostic and recovery tools.',
    bootModes: 'UEFI Only',
    minRam: '4 GB',
    targetUseCases: 'Password resetting (NTFS NTDS), BlueScreenView crash dump parsing, driver injection, registry repair.',
    ventoyTip: 'Requires Secure Boot to be disabled on some OEM laptops (Dell/Lenovo) before booting from Ventoy.',
  },
  {
    id: 'gparted',
    name: 'GParted Live Linux',
    category: 'Partitioning',
    description: 'Small bootable GNU/Linux distribution enabling partition creation, reorganization, and filesystem repair.',
    bootModes: 'UEFI & Legacy',
    minRam: '512 MB',
    targetUseCases: 'Resizing NTFS partitions without data loss, converting MBR to GPT, repairing dirty EXT4/BTRFS superblocks.',
    ventoyTip: 'Boot with default settings; uses framebuffer graphics for instant resolution scaling on high-DPI screens.',
  },
  {
    id: 'dban',
    name: 'DBAN (Darik\'s Boot and Nuke)',
    category: 'Data Sanitization',
    description: 'Self-contained boot disk that securely wipes hard disks using DoD 5220.22-M or Gutmann wipe standards.',
    bootModes: 'Legacy CSM Only',
    minRam: '128 MB',
    targetUseCases: 'Total hard drive decommissioning compliance before computer recycling. (Does NOT support NVMe SSDs).',
    ventoyTip: 'For modern NVMe SSDs, use manufacturer secure erase (e.g. nvme-cli format --ses=1) instead of DBAN.',
  },
  {
    id: 'rescuezilla',
    name: 'Rescuezilla (Swiss Army Knife GUI)',
    category: 'Disk & Imaging',
    description: 'Easy-to-use graphical front-end for Clonezilla compatible with virtual machine images (VDI, VMDK).',
    bootModes: 'UEFI & Legacy',
    minRam: '2 GB',
    targetUseCases: 'Non-technical student backup jobs, point-and-click disk cloning, recovering lost files via photorec.',
    ventoyTip: 'Includes browser for downloading hardware drivers while inside the live triage environment.',
  },
];

export interface HardwarePortSpec {
  id: string;
  name: string;
  family: 'Display' | 'USB / High-Speed' | 'Network / Fiber' | 'Power & Motherboard' | 'Legacy';
  maxBandwidth: string;
  maxResolutionOrWattage: string;
  pinCount: number;
  description: string;
  comptiaObjective: string;
}

export const HARDWARE_PORT_CATALOG: HardwarePortSpec[] = [
  { id: 'hdmi21', name: 'HDMI 2.1 (Type-A)', family: 'Display', maxBandwidth: '48 Gbps (FRL)', maxResolutionOrWattage: '8K @ 60Hz / 4K @ 120Hz HDR', pinCount: 19, description: '19-pin consumer audio/video connector. Uses Fixed Rate Link (FRL) and Transition-Minimized Differential Signaling (TMDS).', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.1 - Cable Types & Connectors)' },
  { id: 'dp21', name: 'DisplayPort 2.1 (Full Size)', family: 'Display', maxBandwidth: '80 Gbps (UHBR20)', maxResolutionOrWattage: '16K @ 60Hz DSC / Dual 4K 144Hz', pinCount: 20, description: 'PC display standard with mechanical locking latch. Pin 20 carries +3.3V power (must not be wired on standard display cables).', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.1)' },
  { id: 'usb_c', name: 'USB Type-C (USB4 / TB4)', family: 'USB / High-Speed', maxBandwidth: '40 Gbps - 80 Gbps', maxResolutionOrWattage: '240W USB Power Delivery (USB-PD 3.1 Extended)', pinCount: 24, description: 'Reversible 24-pin connector supporting Alternate Mode (DisplayPort/PCIe) and bidirectional power delivery up to 48V @ 5A.', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.1)' },
  { id: 'usb3_a', name: 'USB 3.2 Gen 1 (Type-A Blue)', family: 'USB / High-Speed', maxBandwidth: '5 Gbps (SuperSpeed)', maxResolutionOrWattage: '4.5W (5V @ 900mA)', pinCount: 9, description: 'Standard rectangular blue connector with 4 legacy USB 2.0 pins at the front and 5 SuperSpeed pins in the back.', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.1)' },
  { id: 'rj45', name: 'RJ45 8P8C Modular Jack', family: 'Network / Fiber', maxBandwidth: '10 Gbps (Cat6a @ 100m)', maxResolutionOrWattage: '90W PoE++ (IEEE 802.3bt Type 4)', pinCount: 8, description: 'Standard twisted-pair copper Ethernet connector wired to T568A or T568B color configurations.', comptiaObjective: 'CompTIA Network+ N10-008 (Objective 2.1)' },
  { id: 'fiber_lc', name: 'Fiber LC Connector (Lucent)', family: 'Network / Fiber', maxBandwidth: '100 Gbps+ (OS2 Single-Mode)', maxResolutionOrWattage: 'Optical Laser Transceiver SFP+', pinCount: 2, description: 'Small form factor (1.25mm ferrule) push-pull latching optical fiber connector common in datacenter patch panels.', comptiaObjective: 'CompTIA Network+ N10-008 (Objective 2.1)' },
  { id: '12vhpwr', name: '12VHPWR (PCIe 5.0 16-Pin)', family: 'Power & Motherboard', maxBandwidth: 'N/A (Power Only)', maxResolutionOrWattage: '600W (+12V @ 55A max)', pinCount: 16, description: '12 power pins + 4 sideband sense pins (S1-S4). Improper seating or bend radius under 35mm causes terminal thermal melting.', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.4 - Power Supplies)' },
  { id: 'atx24', name: '24-Pin ATX Main Power', family: 'Power & Motherboard', maxBandwidth: 'N/A (Power Only)', maxResolutionOrWattage: '300W - 1600W PSU Standard', pinCount: 24, description: 'Delivers +3.3V (Orange), +5V (Red), +12V (Yellow), -12V (Blue), +5VSB Standby (Purple), and PS_ON# (Green).', comptiaObjective: 'CompTIA A+ Core 1 (Objective 3.4)' },
];

export interface TroubleshootingScenario {
  id: string;
  title: string;
  ticketComplaint: string;
  systemType: string;
  correctOrder: {
    stage: number;
    title: string;
    description: string;
  }[];
}

export const TROUBLESHOOTING_DRILL_SCENARIOS: TroubleshootingScenario[] = [
  {
    id: 'scen_01',
    title: 'Department Network Printer Unreachable After Static IP Reassignment',
    systemType: 'Network / Enterprise Workstation',
    ticketComplaint: 'Accounting user reports the office HP LaserJet network printer works for all other staff, but fails on their workstation after a static IP reassignment.',
    correctOrder: [
      { stage: 1, title: 'Identify the Problem', description: 'Question the user, verify error message ("Printer Offline"), and determine if other computers on the same subnet can print.' },
      { stage: 2, title: 'Establish a Theory of Probable Cause', description: 'The workstation was given a duplicate static IP address, wrong subnet mask, or incorrect default gateway, causing an IP conflict.' },
      { stage: 3, title: 'Test the Theory to Determine Cause', description: 'Run "ipconfig /all" and "ping <printer-ip>". Check for Windows System Event Log Event ID 4199 (IP Address Conflict).' },
      { stage: 4, title: 'Establish a Plan of Action & Implement Solution', description: 'Reconfigure workstation to DHCP or assign a verified unallocated static IP from the reservation table.' },
      { stage: 5, title: 'Verify Full System Functionality', description: 'Send a Windows test print page from the accounting workstation; confirm print queue empties cleanly and paper prints.' },
      { stage: 6, title: 'Document Findings, Actions, and Outcomes', description: 'Update the IT asset ledger with the new static IP address and close the accounting helpdesk ticket.' },
    ],
  },
  {
    id: 'scen_02',
    title: 'Bench PC Shuts Down After 5 Minutes of 3D Gaming Load',
    systemType: 'Desktop Workstation Hardware',
    ticketComplaint: 'Client reports their custom desktop powers on and browses the web normally, but instantly shuts down with zero warning after playing intensive games for 5-10 minutes.',
    correctOrder: [
      { stage: 1, title: 'Identify the Problem', description: 'Inquire when the issue started (e.g. after moving PC), check event logs for unexpected kernel power events (Event 41), and observe thermals.' },
      { stage: 2, title: 'Establish a Theory of Probable Cause', description: 'CPU or GPU thermal throttle limit exceeded (105°C) due to dried thermal paste, unseated AIO pump, or failed cooling fan.' },
      { stage: 3, title: 'Test the Theory to Determine Cause', description: 'Run HWMonitor while running a controlled CPU stress test. Observe temperatures spiking past 100°C within 60 seconds.' },
      { stage: 4, title: 'Establish a Plan of Action & Implement Solution', description: 'Remove CPU heatsink, clean dried thermal paste with 99% IPA, inspect AIO pump RPM, and apply fresh thermal compound.' },
      { stage: 5, title: 'Verify Full System Functionality', description: 'Run a 30-minute FurMark + Cinebench burn-in stress test; verify peak CPU temperature remains under 78°C under continuous load.' },
      { stage: 6, title: 'Document Findings, Actions, and Outcomes', description: 'Log thermal paste replacement, recorded baseline idle/load temps, and return hardware to client.' },
    ],
  },
];
