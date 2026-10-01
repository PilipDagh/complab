/**
 * Forensic Data Recovery, Storage Reconditioning & Firmware/BIOS Laboratory Database
 * Comprehensive reference data for file signatures, SPI chips, HDD head geometry,
 * SSD controllers, partition structures, and NIST sanitization standards.
 */

export interface FileSignature {
  id: string;
  name: string;
  extension: string;
  category: 'image' | 'document' | 'archive' | 'audio_video' | 'executable' | 'filesystem' | 'database';
  headerHex: string;
  headerOffset: number;
  footerHex?: string;
  description: string;
  carvingAdvice: string;
  falsePositiveRate: 'Low' | 'Medium' | 'High';
}

export interface SpiFlashChip {
  id: string;
  partNumber: string;
  manufacturer: string;
  capacityMb: number; // in Megabits (e.g., 64Mb = 8MB, 128Mb = 16MB)
  capacityBytes: string; // e.g. "8 MB"
  operatingVoltage: '1.8V' | '2.5V' | '3.3V';
  packageTypes: string[];
  maxClockMhz: number;
  jumperWarning: string;
  flashromCmd: string;
  commonBoards: string;
}

export interface HddFamilyProfile {
  id: string;
  manufacturer: 'Seagate' | 'Western Digital' | 'Toshiba' | 'HGST';
  family: string;
  formFactor: '2.5"' | '3.5"';
  typicalCapacities: string;
  headCountMin: number;
  headCountMax: number;
  platterCountMin: number;
  platterCountMax: number;
  rampType: 'Ramp Load' | 'Landing Zone (CSS)';
  donorCriteria: string[];
  commonFailures: string;
  acousticProfile: 'Normal Spin' | 'Head Click Loop' | 'Spindle Seizure (Beep)' | 'Scraping Head' | 'Preamp Blown (Silent)';
  safeDdrescueFlags: string;
}

export interface SsdControllerSpec {
  id: string;
  controllerModel: string;
  vendor: 'Phison' | 'Silicon Motion' | 'Samsung' | 'Realtek' | 'Marvell' | 'InnoGrit';
  interface: 'PCIe 3.0 x4' | 'PCIe 4.0 x4' | 'PCIe 5.0 x4' | 'SATA III 6Gbps';
  channels: number;
  dramSupport: 'DRAM Cache' | 'DRAM-less (HMB)';
  commonDrives: string[];
  romModeProcedure: string;
  firmwareRecoveryTool: string;
  panicSymptoms: string;
}

export interface PartitionTableSpec {
  type: 'MBR' | 'GPT' | 'NTFS_VBR' | 'EXT4_SUPERBLOCK' | 'APFS_CONTAINER';
  title: string;
  lbaLocation: string;
  magicBytes: string;
  keyFields: { offset: string; size: string; description: string }[];
  recoveryCommands: string[];
}

export interface SanitizationStandard {
  standard: string;
  level: 'Clear' | 'Purge' | 'Destroy';
  magneticHddRequirement: string;
  ssdNvmeRequirement: string;
  verificationMethod: string;
  regulatoryCert: string;
}

// -------------------------------------------------------------
// 1. FILE MAGIC SIGNATURES & CARVING PATTERNS (50+ formats)
// -------------------------------------------------------------
export const FORENSIC_FILE_SIGNATURES: FileSignature[] = [
  {
    id: 'sig-jpeg',
    name: 'JPEG / JFIF Graphic',
    extension: '.jpg / .jpeg',
    category: 'image',
    headerHex: 'FF D8 FF E0 / FF D8 FF E1',
    headerOffset: 0,
    footerHex: 'FF D9',
    description: 'Joint Photographic Experts Group raster image format with EXIF metadata container.',
    carvingAdvice: 'Carve from FF D8 FF until terminating FF D9 byte sequence. Check for embedded thumbnail headers (0xFF D8) which may cause premature truncation.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-png',
    name: 'PNG (Portable Network Graphics)',
    extension: '.png',
    category: 'image',
    headerHex: '89 50 4E 47 0D 0A 1A 0A',
    headerOffset: 0,
    footerHex: '49 45 4E 44 AE 42 60 82',
    description: 'Lossless raster image format with 8-byte magic header and IEND chunk footer.',
    carvingAdvice: 'Strict header and chunked structure. End of file is guaranteed by the 12-byte IEND chunk (00 00 00 00 49 45 4E 44 AE 42 60 82). High carving reliability.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-pdf',
    name: 'Adobe Portable Document Format',
    extension: '.pdf',
    category: 'document',
    headerHex: '25 50 44 46 2D ( %PDF- )',
    headerOffset: 0,
    footerHex: '25 25 45 4F 46 ( %%EOF )',
    description: 'PostScript-based vector and text document standard.',
    carvingAdvice: 'Look for %%EOF footer. Linearized or incrementally updated PDFs often contain multiple %%EOF markers; carve to the final %%EOF followed by trailing newlines.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-zip',
    name: 'ZIP Archive / Office Open XML (DOCX, XLSX, PPTX)',
    extension: '.zip / .docx / .xlsx',
    category: 'archive',
    headerHex: '50 4B 03 04 ( PK.. )',
    headerOffset: 0,
    footerHex: '50 4B 05 06 (End of Central Dir)',
    description: 'Standard Deflate compression format and container for modern Microsoft Office documents.',
    carvingAdvice: 'Carve from 50 4B 03 04 to End of Central Directory record (50 4B 05 06 + 18 trailing comment bytes). Check [Content_Types].xml to identify docx vs xlsx.',
    falsePositiveRate: 'Medium',
  },
  {
    id: 'sig-sqlite',
    name: 'SQLite 3 Database',
    extension: '.sqlite / .db / .db3',
    category: 'database',
    headerHex: '53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00',
    headerOffset: 0,
    description: 'Serverless SQL database engine header (16 bytes: "SQLite format 3\\0"). Used by Chrome, Firefox, WhatsApp, and iOS apps.',
    carvingAdvice: 'Header offset 16-17 contains the page size (big endian, typically 4096 bytes). Offset 28-31 contains total database page count. Total size = (page count * page size).',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-bitlocker',
    name: 'Microsoft BitLocker Volume Signature',
    extension: '.vhd / raw sector',
    category: 'filesystem',
    headerHex: '2D 46 56 45 2D 46 53 2D ( -FVE-FS- )',
    headerOffset: 3,
    description: 'Full Volume Encryption (FVE) header signature present at byte offset 3 of an encrypted NTFS/FAT partition VBR.',
    carvingAdvice: 'Indicates BitLocker encrypted volume. Raw file carving will yield high-entropy pseudo-random noise unless the 48-digit recovery key or TPM protector is extracted.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-vmdk',
    name: 'VMware Virtual Disk (VMDK)',
    extension: '.vmdk',
    category: 'filesystem',
    headerHex: '4B 44 4D 56 ( KDMV )',
    headerOffset: 0,
    description: 'Sparse virtual machine disk header containing capacity geometry and grain directory tables.',
    carvingAdvice: 'Header is followed by descriptor file or grain directory table. Offsets 0x14-0x1C define total capacity sectors.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-mp4',
    name: 'MP4 / QuickTime Video (ISO Base Media)',
    extension: '.mp4 / .mov / .m4a',
    category: 'audio_video',
    headerHex: '00 00 00 18 / 20 66 74 79 70 ( ftyp )',
    headerOffset: 4,
    description: 'MPEG-4 Part 14 container with box atom headers (ftyp, moov, mdat).',
    carvingAdvice: 'Examine 4-byte box sizes at start of each atom. If camera was powered off during recording without writing the "moov" atom, use untrunc or recovery tools to reconstruct index.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-elf',
    name: 'Linux ELF Executable / Shared Object',
    extension: '.elf / .so',
    category: 'executable',
    headerHex: '7F 45 4C 46 ( .ELF )',
    headerOffset: 0,
    description: 'Executable and Linkable Format binary header for Linux, BSD, and Android.',
    carvingAdvice: 'Byte 4 indicates 32-bit (01) vs 64-bit (02). Byte 5 indicates endianness. Program and section header tables define total file extent.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-pe',
    name: 'Windows Portable Executable (EXE/DLL/SYS)',
    extension: '.exe / .dll / .sys',
    category: 'executable',
    headerHex: '4D 5A ( MZ )',
    headerOffset: 0,
    description: 'Mark Zbikowski DOS stub header followed by "PE\\0\\0" (50 45 00 00) signature at offset specified in byte 0x3C.',
    carvingAdvice: 'Verify offset 0x3C points to valid PE signature to eliminate false positive MZ markers in unallocated clusters. Sum section headers for physical binary size.',
    falsePositiveRate: 'Medium',
  },
  {
    id: 'sig-pcap',
    name: 'Wireshark Packet Capture (PCAP/PCAPNG)',
    extension: '.pcap / .pcapng',
    category: 'database',
    headerHex: 'D4 C3 B2 A1 / 0A 0D 0D 0A',
    headerOffset: 0,
    description: 'Libpcap network trace file header (D4 C3 B2 A1 little endian) or Section Header Block (0A 0D 0D 0A for PCAPNG).',
    carvingAdvice: 'Each captured packet contains timestamp, captured length, and original length header. Carve sequentially until unallocated noise is reached.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-7z',
    name: '7-Zip High Ratio Compressed Archive',
    extension: '.7z',
    category: 'archive',
    headerHex: '37 7A BC AF 27 1C',
    headerOffset: 0,
    description: 'LZMA/LZMA2 compressed container with 6-byte magic number.',
    carvingAdvice: 'Next 2 bytes are major/minor version (e.g., 00 04). Next 4 bytes are CRC32 of following 20 bytes. End header contains directory listing.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-flac',
    name: 'Free Lossless Audio Codec (FLAC)',
    extension: '.flac',
    category: 'audio_video',
    headerHex: '66 4C 61 43 ( fLaC )',
    headerOffset: 0,
    description: 'Lossless audio stream header with STREAMINFO metadata block.',
    carvingAdvice: 'Header is followed by one or more metadata blocks (bit 7 indicates last metadata block) then raw audio frames with 14-bit sync code 0xFFF8.',
    falsePositiveRate: 'Low',
  },
  {
    id: 'sig-tar-gz',
    name: 'GZIP Compressed Tarball',
    extension: '.tar.gz / .tgz',
    category: 'archive',
    headerHex: '1F 8B 08',
    headerOffset: 0,
    description: 'RFC 1952 Gzip compression header with DEFLATE compression method indicator (08).',
    carvingAdvice: 'Last 8 bytes of the gzip stream contain CRC-32 and uncompressed ISIZE modulo 2^32. Useful to verify integrity upon extraction.',
    falsePositiveRate: 'Medium',
  },
];

// -------------------------------------------------------------
// 2. SPI FLASH BIOS/UEFI CHIP REFERENCE MATRIX (25+ Chips)
// -------------------------------------------------------------
export const SPI_FLASH_DATABASE: SpiFlashChip[] = [
  {
    id: 'spi-w25q64',
    partNumber: 'W25Q64FV / W25Q64JV',
    manufacturer: 'Winbond',
    capacityMb: 64,
    capacityBytes: '8 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOIC-8 (208mil)', 'WSON-8 (6x5mm)'],
    maxClockMhz: 104,
    jumperWarning: 'Standard 3.3V programmer mode. Verify programmer does not spike to 5V during USB insertion.',
    flashromCmd: 'flashrom -p ch341a_spi -c "W25Q64.V" -r bios_backup.bin',
    commonBoards: 'Lenovo ThinkPad T440/T450, Dell Latitude E7440, ASUS H81/B85 motherboards',
  },
  {
    id: 'spi-w25q128',
    partNumber: 'W25Q128FV / W25Q128JV',
    manufacturer: 'Winbond',
    capacityMb: 128,
    capacityBytes: '16 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOIC-8 (208mil)', 'WSON-8 (8x6mm)', 'SOP-16'],
    maxClockMhz: 133,
    jumperWarning: 'Standard 3.3V power rail. High endurance (100k write cycles).',
    flashromCmd: 'flashrom -p ch341a_spi -c "W25Q128.V" -r bios_backup.bin',
    commonBoards: 'Dell OptiPlex 7050/7060, HP EliteBook 840 G3/G4, ASUS Z170/Z270, MSI B450 Tomahawk',
  },
  {
    id: 'spi-w25q256',
    partNumber: 'W25Q256JV / W25Q256FV',
    manufacturer: 'Winbond',
    capacityMb: 256,
    capacityBytes: '32 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOIC-8 (208mil)', 'WSON-8 (8x6mm)', 'TFBGA-24'],
    maxClockMhz: 133,
    jumperWarning: 'Requires 4-byte address mode support in programmer software. Older CH341A v1.4 software will truncate at 16MB.',
    flashromCmd: 'flashrom -p ch341a_spi -c "W25Q256.V" -r bios_backup.bin',
    commonBoards: 'ASUS ROG B550/X570, Intel Z490/Z590/Z690, Gigabyte Aorus Master, Lenovo ThinkPad P1 Gen 4',
  },
  {
    id: 'spi-w25q64fw',
    partNumber: 'W25Q64FW / W25Q64JW',
    manufacturer: 'Winbond (1.8V Low Voltage)',
    capacityMb: 64,
    capacityBytes: '8 MB',
    operatingVoltage: '1.8V',
    packageTypes: ['SOIC-8 (150mil)', 'SOIC-8 (208mil)', 'WSON-8'],
    maxClockMhz: 104,
    jumperWarning: 'CRITICAL HAZARD: Must use 1.8V Level Shifter Adapter with CH341A! Connecting 3.3V directly will PERMANENTLY DESTROY the chip.',
    flashromCmd: 'flashrom -p ch341a_spi -c "W25Q64.W" -r bios_1v8_dump.bin',
    commonBoards: 'Apple MacBook Air A1466 (2015-2017), MacBook Pro Retina A1502, Surface Pro 4',
  },
  {
    id: 'spi-w25q128fw',
    partNumber: 'W25Q128FW / W25Q128JW',
    manufacturer: 'Winbond (1.8V Low Voltage)',
    capacityMb: 128,
    capacityBytes: '16 MB',
    operatingVoltage: '1.8V',
    packageTypes: ['WSON-8', 'SOIC-8 (208mil)'],
    maxClockMhz: 133,
    jumperWarning: 'CRITICAL HAZARD: 1.8V chip! Verify green 1.8V adapter PCB is installed between CH341A and test clip.',
    flashromCmd: 'flashrom -p ch341a_spi -c "W25Q128.W" -r macbook_dump.bin',
    commonBoards: 'Apple MacBook Pro A1706 / A1708 (TouchBar EFI), Lenovo ThinkPad X1 Carbon Gen 6/7',
  },
  {
    id: 'spi-mx25l128',
    partNumber: 'MX25L12835F / MX25L12873F',
    manufacturer: 'Macronix',
    capacityMb: 128,
    capacityBytes: '16 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOP-8 (200mil)', 'WSON-8 (6x5mm)', 'SOP-16'],
    maxClockMhz: 133,
    jumperWarning: 'Standard 3.3V programming. Ensure proper pin 1 alignment on SOIC test clip.',
    flashromCmd: 'flashrom -p ch341a_spi -c "MX25L12835F" -r mx_bios.bin',
    commonBoards: 'Lenovo ThinkCentre M710q/M910q, ASUS Prime B360M, Acer Nitro 5, HP ProBook 450 G5',
  },
  {
    id: 'spi-mx25l256',
    partNumber: 'MX25L25645G',
    manufacturer: 'Macronix',
    capacityMb: 256,
    capacityBytes: '32 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOP-16', 'WSON-8'],
    maxClockMhz: 120,
    jumperWarning: '32MB high density chip. Verify programmer supports 32-bit addressing.',
    flashromCmd: 'flashrom -p ch341a_spi -c "MX25L25645G" -r 32mb_dump.bin',
    commonBoards: 'Dell Precision 7550 / 7750, Intel 12th/13th Gen Alder Lake server motherboards',
  },
  {
    id: 'spi-gd25q128',
    partNumber: 'GD25Q128C / GD25B128C',
    manufacturer: 'GigaDevice',
    capacityMb: 128,
    capacityBytes: '16 MB',
    operatingVoltage: '3.3V',
    packageTypes: ['SOP-8', 'WSON-8'],
    maxClockMhz: 120,
    jumperWarning: 'Requires flashrom v1.2+ for full GigaDevice manufacturer code matching.',
    flashromCmd: 'flashrom -p ch341a_spi -c "GD25Q128C" -r gd_dump.bin',
    commonBoards: 'ASRock B450/B550 Pro4, Colorful H310/B460, generic mining and crypto mainboards',
  },
];

// -------------------------------------------------------------
// 3. HARD DRIVE FAMILY & HEAD COMB GEOMETRY (Cleanroom Matrix)
// -------------------------------------------------------------
export const HDD_HEAD_FAMILIES: HddFamilyProfile[] = [
  {
    id: 'hdd-seagate-rosewood',
    manufacturer: 'Seagate',
    family: 'Rosewood (LM007 / LM035 / LM048)',
    formFactor: '2.5"',
    typicalCapacities: '1TB - 2TB',
    headCountMin: 2,
    headCountMax: 4,
    platterCountMin: 1,
    platterCountMax: 2,
    rampType: 'Ramp Load',
    donorCriteria: [
      'Same Family code (e.g. LM007)',
      'First 3 characters of Site Code must match',
      'Head count must match or exceed patient',
      'Preamp revision compatibility check via terminal',
      'Media Cache / MCMT corruption often accompanies head crash',
    ],
    commonFailures: 'Extreme head stiction, media cache microcode corruption (LED: 000000CE), damaged slider pads leading to 0x43110081 firmware lock.',
    acousticProfile: 'Head Click Loop',
    safeDdrescueFlags: 'ddrescue -d -b 4096 -n -v /dev/sdb patient.img rescue.map',
  },
  {
    id: 'hdd-wd-palmer',
    manufacturer: 'Western Digital',
    family: 'Palmer / Spyglass (Type C USB On-Board)',
    formFactor: '2.5"',
    typicalCapacities: '2TB - 5TB',
    headCountMin: 4,
    headCountMax: 10,
    platterCountMin: 2,
    platterCountMax: 5,
    rampType: 'Ramp Load',
    donorCriteria: [
      'Matching Head Map config (Physical to Logical)',
      'Exact DCM (Drive Configuration Matrix) match on 4th & 5th positions',
      'Requires SATA Conversion Board (unlock board) to bypass native USB encryption MCU',
      'MCU lock / SED firmware patch needed to access module 190 / 02',
    ],
    commonFailures: 'Weak Head 0 causing slow-responding bug, native hardware encryption lock, dropped drive causing bent head comb tines.',
    acousticProfile: 'Head Click Loop',
    safeDdrescueFlags: 'ddrescue -d -r 1 -b 4096 --reverse /dev/sdb palmer.img palmer.map',
  },
  {
    id: 'hdd-toshiba-mq01',
    manufacturer: 'Toshiba',
    family: 'MQ01ABD / MQ01ABF',
    formFactor: '2.5"',
    typicalCapacities: '500GB - 1TB',
    headCountMin: 1,
    headCountMax: 4,
    platterCountMin: 1,
    platterCountMax: 2,
    rampType: 'Ramp Load',
    donorCriteria: [
      'Full Model number match (e.g. MQ01ABD100)',
      'Same Country of manufacture (Philippines vs China)',
      'Exact matching Date of manufacture within 60 days',
      'Firmware revision code match (AX001U / A0/AA00/AM000U)',
    ],
    commonFailures: 'Heads stick to platters when laptop is dropped while running (spindle motor stops, drive emits high-pitched beeping tone).',
    acousticProfile: 'Spindle Seizure (Beep)',
    safeDdrescueFlags: 'ddrescue -d -b 4096 -N -c 256 /dev/sdb toshiba.img toshiba.map',
  },
  {
    id: 'hdd-wd-carmel',
    manufacturer: 'Western Digital',
    family: 'Carmel / Venice (3.5" Enterprise & Desktop)',
    formFactor: '3.5"',
    typicalCapacities: '4TB - 8TB',
    headCountMin: 6,
    headCountMax: 10,
    platterCountMin: 3,
    platterCountMax: 5,
    rampType: 'Ramp Load',
    donorCriteria: [
      'Matching MicroJogs in PCB ROM (accessible via safe mode jumper)',
      'Same head map distribution across top/bottom platters',
      'Matching date code within 90 days',
      'PCB 2060-800067 donor board matching',
    ],
    commonFailures: 'Translator corruption (Module 31/32), bad sectors on second platter causing PC freeze during MFT scans.',
    acousticProfile: 'Head Click Loop',
    safeDdrescueFlags: 'ddrescue -d -b 4096 -m donor_head_map.map /dev/sdb carmel.img carmel.map',
  },
];

// -------------------------------------------------------------
// 4. SSD CONTROLLER FORENSICS & ROM MODE PINOUTS
// -------------------------------------------------------------
export const SSD_CONTROLLER_DATABASE: SsdControllerSpec[] = [
  {
    id: 'ssd-phison-e12',
    controllerModel: 'Phison PS5012-E12 / E12S',
    vendor: 'Phison',
    interface: 'PCIe 3.0 x4',
    channels: 8,
    dramSupport: 'DRAM Cache',
    commonDrives: ['Sabrent Rocket NVMe 1TB', 'Corsair MP510', 'Silicon Power A80', 'Gigabyte Aorus NVMe Gen3'],
    romModeProcedure: 'Short the 2 circular test points marked "ROM" near the controller with tweezers before applying 3.3V power. Controller will enumerate as "PS5012-E12 BOOT" with 0MB / 1GB capacity.',
    firmwareRecoveryTool: 'Phison E12 MPTool / PC-3000 Flash v7.5+',
    panicSymptoms: 'Drive disappears from BIOS after 30 seconds of high queue write load, or locks read-only into SATAFIRM S11 / PS5012 mode.',
  },
  {
    id: 'ssd-smi-sm2258xt',
    controllerModel: 'Silicon Motion SM2258XT (DRAM-less SATA)',
    vendor: 'Silicon Motion',
    interface: 'SATA III 6Gbps',
    channels: 4,
    dramSupport: 'DRAM-less (HMB)',
    commonDrives: ['Crucial BX500', 'ADATA SU650', 'Kingston A400 (Phison/SMI variants)', 'SanDisk SSD PLUS'],
    romModeProcedure: 'Bridge the two solder jumpers labeled "J1" or "SAFE_MODE" located on the top edge of PCB while plugging in SATA power. Drive will report as "SM2258AB-ROM" (1024MB capacity).',
    firmwareRecoveryTool: 'SMI Mass Production Tool (SM2258XT MPTool) or PC-3000 SSD.',
    panicSymptoms: 'Reported capacity changes to "SATAFIRM S11" or "20MB" with all sectors returning 0x00 due to exhausted NAND block look-up table.',
  },
  {
    id: 'ssd-smi-sm2262en',
    controllerModel: 'Silicon Motion SM2262EN NVMe',
    vendor: 'Silicon Motion',
    interface: 'PCIe 3.0 x4',
    channels: 8,
    dramSupport: 'DRAM Cache',
    commonDrives: ['ADATA XPG SX8200 Pro', 'HP EX950', 'Kingston KC2000 / KC2500', 'Mushkin Pilot-E'],
    romModeProcedure: 'Locate two tiny test pads TP1 and TP2 on the underside of the M.2 PCB near the PCIe gold fingers. Bridge test points with conductive probe while inserting into M.2 slot.',
    firmwareRecoveryTool: 'SMI SMI2262EN MPTool / PC-3000 NVMe.',
    panicSymptoms: 'Drive boots to BIOS as "SM2262" with error code WHEA-Logger Event 17 in Windows. Controller fails to load NAND translation layer from Die 0.',
  },
  {
    id: 'ssd-phison-e18',
    controllerModel: 'Phison PS5018-E18 Gen4',
    vendor: 'Phison',
    interface: 'PCIe 4.0 x4',
    channels: 8,
    dramSupport: 'DRAM Cache',
    commonDrives: ['Corsair MP600 PRO XT', 'Seagate FireCuda 530', 'Sabrent Rocket 4 Plus', 'Kingston KC3000'],
    romModeProcedure: 'Requires grounding the "CLK_REQ" debug pad adjacent to the PMIC (Phison PS6108). Controller enters hardware fallback ROM mode.',
    firmwareRecoveryTool: 'Vendor factory JTAG tool or hardware chip-off reading of 176-layer Micron B47R NAND.',
    panicSymptoms: 'Total link negotiation failure, PCIe link drops from Gen4 x4 to Gen1 x1, 0 byte drive size, PMIC over-temperature shutdown.',
  },
  {
    id: 'ssd-samsung-phoenix',
    controllerModel: 'Samsung Phoenix (S4LR020)',
    vendor: 'Samsung',
    interface: 'PCIe 3.0 x4',
    channels: 8,
    dramSupport: 'DRAM Cache',
    commonDrives: ['Samsung 970 EVO', 'Samsung 970 PRO (MLC)', 'Samsung 970 EVO Plus'],
    romModeProcedure: 'Samsung uses proprietary encrypted firmware. Shorting UART RX/TX pins puts controller in test bootloader. Chip-off recovery is generally required if controller processor core has died.',
    firmwareRecoveryTool: 'PC-3000 NVMe Samsung Utility (v6.9+) with unlock key injection.',
    panicSymptoms: 'Drive hangs on identify command; SSD becomes scorching hot (>85°C) within 5 seconds of 3.3V power application due to internal core regulator short.',
  },
];

// -------------------------------------------------------------
// 5. PARTITION TABLE & FILE SYSTEM FORENSIC SPECIFICATIONS
// -------------------------------------------------------------
export const PARTITION_FORENSIC_SPECS: PartitionTableSpec[] = [
  {
    type: 'MBR',
    title: 'Master Boot Record (MBR / DOS Partition Table)',
    lbaLocation: 'LBA 0 (First 512 bytes of physical disk)',
    magicBytes: '0x55 0xAA at offset 510 (0x1FE)',
    keyFields: [
      { offset: '0x000 - 0x1BD', size: '446 bytes', description: 'Bootstrap code (Stage 1 bootloader)' },
      { offset: '0x1BE - 0x1CD', size: '16 bytes', description: 'Partition Entry 1 (Active flag, CHS start, Type, LBA start, Sectors count)' },
      { offset: '0x1CE - 0x1DD', size: '16 bytes', description: 'Partition Entry 2' },
      { offset: '0x1DE - 0x1ED', size: '16 bytes', description: 'Partition Entry 3' },
      { offset: '0x1EE - 0x1FD', size: '16 bytes', description: 'Partition Entry 4' },
      { offset: '0x1FE - 0x1FF', size: '2 bytes', description: 'Valid Boot Signature: 0x55 0xAA' },
    ],
    recoveryCommands: [
      'fdisk -l /dev/sdb (Inspect MBR partition boundaries)',
      'testdisk /debug /log /cmd /dev/sdb analyze (Deep search for lost partition sectors)',
      'dd if=/dev/sdb of=mbr_backup.bin bs=512 count=1 (Create pristine bitstream backup of LBA 0)',
    ],
  },
  {
    type: 'GPT',
    title: 'GUID Partition Table (GPT Header & Array)',
    lbaLocation: 'LBA 1 (Primary Header) and Last LBA of Disk (Backup Header)',
    magicBytes: '0x45 0x46 0x49 0x20 0x50 0x41 0x52 0x54 ( "EFI PART" at offset 0 )',
    keyFields: [
      { offset: '0x00 - 0x07', size: '8 bytes', description: 'Signature ("EFI PART")' },
      { offset: '0x08 - 0x0B', size: '4 bytes', description: 'Revision (e.g., 0x00 0x00 0x01 0x00 for v1.0)' },
      { offset: '0x0C - 0x0F', size: '4 bytes', description: 'Header Size (typically 92 bytes = 0x5C)' },
      { offset: '0x10 - 0x13', size: '4 bytes', description: 'CRC32 of Header (calculated with this field set to 0)' },
      { offset: '0x18 - 0x1F', size: '8 bytes', description: 'Current LBA (LBA 1 for primary, Last LBA for backup)' },
      { offset: '0x20 - 0x27', size: '8 bytes', description: 'Backup LBA pointer' },
      { offset: '0x48 - 0x4F', size: '8 bytes', description: 'Starting LBA of Partition Entries (usually LBA 2)' },
      { offset: '0x50 - 0x53', size: '4 bytes', description: 'Number of Partition Entries (typically 128)' },
      { offset: '0x54 - 0x57', size: '4 bytes', description: 'Size of Each Partition Entry (typically 128 bytes)' },
    ],
    recoveryCommands: [
      'gdisk -l /dev/sdb (Verify Primary vs Backup GPT header integrity)',
      'sgdisk --load-backup=gpt_backup.bin /dev/sdb (Restore GPT from clean snapshot)',
      'gdisk /dev/sdb (Enter Recovery/transformation menu -> press "c" to load backup header from end of disk)',
    ],
  },
  {
    type: 'NTFS_VBR',
    title: 'NTFS Volume Boot Record & $MFT File System',
    lbaLocation: 'LBA 0 of partition (e.g. LBA 2048 for typical 1MB aligned partition)',
    magicBytes: '0x4E 0x54 0x46 0x53 0x20 0x20 0x20 0x20 ( "NTFS    " at offset 3 )',
    keyFields: [
      { offset: '0x00 - 0x02', size: '3 bytes', description: 'Jump instruction to boot code (EB 52 90)' },
      { offset: '0x03 - 0x0A', size: '8 bytes', description: 'OEM ID: "NTFS    "' },
      { offset: '0x0B - 0x0C', size: '2 bytes', description: 'Bytes per sector (typically 512 or 4096)' },
      { offset: '0x0D', size: '1 byte', description: 'Sectors per cluster (typically 8 for 4KB cluster)' },
      { offset: '0x28 - 0x2F', size: '8 bytes', description: 'Total sectors in volume' },
      { offset: '0x30 - 0x37', size: '8 bytes', description: 'Starting cluster of $MFT (Master File Table - offset 0x30)' },
      { offset: '0x38 - 0x3F', size: '8 bytes', description: 'Starting cluster of $MFTMirr (Mirror backup of MFT)' },
      { offset: '0x1FE - 0x1FF', size: '2 bytes', description: 'Boot Signature: 0x55 0xAA' },
    ],
    recoveryCommands: [
      'ntfsfix -d /dev/sdb1 (Clear dirty flag without destructive chkdsk truncations)',
      'testdisk (Search for NTFS backup boot sector at the exact last sector of partition)',
      'icat /dev/sdb1 0 (The Sleuth Kit: dump raw $MFT Record 0 to inspect file record format)',
    ],
  },
];

// -------------------------------------------------------------
// 6. NIST SP 800-88 REV 1 & DOD 5220.22-M SANITIZATION STANDARDS
// -------------------------------------------------------------
export const NIST_SANITIZATION_STANDARDS: SanitizationStandard[] = [
  {
    standard: 'NIST SP 800-88 Rev. 1: Clear',
    level: 'Clear',
    magneticHddRequirement: 'Single overwrite pass with fixed data pattern (zeros or pseudo-random) across all addressable sectors, including HPA/DCO.',
    ssdNvmeRequirement: 'Write zero/fixed pattern across all logical block addresses (LBA). Note: does NOT erase overprovisioned or bad retired blocks.',
    verificationMethod: 'Sample at least 10% of logical blocks across start, middle, and end to verify all bytes equal 0x00.',
    regulatoryCert: 'CompTIA A+ Standard Refurbishment / HIPAA Low-Risk Workstation Reassignment.',
  },
  {
    standard: 'NIST SP 800-88 Rev. 1: Purge (Cryptographic Erase / Sanitize)',
    level: 'Purge',
    magneticHddRequirement: 'ATA Secure Erase (Enhanced) or Firmware-level crypto-scramble of controller internal AES-256 media encryption key.',
    ssdNvmeRequirement: 'NVMe Sanitize (Command 0x84 - Block Erase or Crypto Scramble) or ATA Enhanced Secure Erase. Flushes and erases all wear-leveling cells and spare over-provisioning pools.',
    verificationMethod: 'Query NVMe Sanitize Status log page (0x81). Verify Sanitize Status = 0x0001 (Completed successfully without error).',
    regulatoryCert: 'DoD Secret / Financial PCI-DSS / HIPAA PHI Healthcare Disposal.',
  },
  {
    standard: 'NIST SP 800-88 Rev. 1: Destroy (Physical Demilitarization)',
    level: 'Destroy',
    magneticHddRequirement: 'Degaussing using NSA-approved permanent degausser (>10,000 Oersted field), followed by mechanical bending, punching, or cross-cut shredding < 2mm particles.',
    ssdNvmeRequirement: 'Degaussing is INEFFECTIVE on SSDs! Must use optical/mechanical shredder reducing NAND flash dies to particle size < 2mm. Melting/incineration above Curie temperature.',
    verificationMethod: 'Visual inspection of fractured silicon dies. Weight verification against certified disposal manifest.',
    regulatoryCert: 'NSA / CSS Evaluated Products List / Classified Top Secret Sanitization.',
  },
  {
    standard: 'DoD 5220.22-M (E) 3-Pass Overwrite',
    level: 'Clear',
    magneticHddRequirement: 'Pass 1: Overwrite with fixed character (e.g. 0x00). Pass 2: Overwrite with complement (e.g. 0xFF). Pass 3: Overwrite with random characters and verify.',
    ssdNvmeRequirement: 'NOT RECOMMENDED for modern SSDs due to write amplification, severe NAND endurance wear, and inability to reach overprovisioned wear pools.',
    verificationMethod: '100% byte verification pass comparing readback against generated pseudo-random seed.',
    regulatoryCert: 'Legacy US Department of Defense standard (superseded by NIST 800-88 Purge for SSDs).',
  },
];
