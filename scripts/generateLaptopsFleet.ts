import fs from 'fs';
import path from 'path';

export interface LaptopAsset {
  id: string;
  assetTag: string; // e.g. "LAP-DL-XPS16-001"
  model: string;
  brand: 'Dell' | 'Lenovo' | 'HP' | 'Apple' | 'ASUS' | 'Acer' | 'MSI' | 'Razer' | 'Framework' | 'Microsoft' | 'Panasonic' | 'Samsung' | 'Gigabyte';
  category: 'Workstation' | 'Creator' | 'Gaming Flagship' | 'Ultrabook' | 'Enterprise Business' | 'Student Loaner' | 'Rugged Field' | 'Convertible 2-in-1';
  screen: string; // e.g. '16" 3.2K OLED 120Hz'
  cpu: string; // e.g. 'Intel Core Ultra 9 185H' or 'AMD Ryzen 9 7945HX' or 'Apple M3 Max 16-Core'
  gpu: string; // e.g. 'NVIDIA GeForce RTX 4080 Mobile 12GB'
  ram: string; // e.g. '32GB LPDDR5X-7467'
  ramUpgrade: 'Soldered' | '2x SO-DIMM (Upgradable)' | '1x Soldered + 1x SO-DIMM' | 'Modular CAMM2';
  storage: string; // e.g. '1TB PCIe 4.0 NVMe SSD'
  storageSlots: 'Single M.2' | 'Dual M.2 Gen4' | 'Dual M.2 (Gen5 + Gen4)' | 'Proprietary Apple SSD';
  batteryWh: number; // e.g. 99.9
  batteryHealth: number; // e.g. 96 (%)
  weightKg: number; // e.g. 2.1
  powerAdapterWatts: number; // e.g. 130
  os: 'Windows 11 Pro' | 'Windows 11 Home' | 'macOS Sonoma' | 'macOS Sequoia' | 'Ubuntu Linux 24.04' | 'ChromeOS';
  ports: string; // e.g. '3x TB4 / USB4, SD Express 7.0, Audio Jack'
  teardownDifficulty: 1 | 2 | 3 | 4 | 5; // 1 = Easy Modular, 5 = Heavily Glued
  status: 'In Fleet / Available' | 'Assigned to Student' | 'Under Triage / Bench' | 'Awaiting Parts' | 'Decommissioned';
  assignedBench?: string; // e.g. "Bench 03"
  commonFaults: string;
  notes: string;
}

const generateLaptops = (): LaptopAsset[] => {
  const laptops: LaptopAsset[] = [];
  let idCount = 1;

  const brands = [
    { brand: 'Lenovo', code: 'LEN' },
    { brand: 'Dell', code: 'DL' },
    { brand: 'HP', code: 'HP' },
    { brand: 'Apple', code: 'APL' },
    { brand: 'ASUS', code: 'ASU' },
    { brand: 'Acer', code: 'ACR' },
    { brand: 'MSI', code: 'MSI' },
    { brand: 'Razer', code: 'RZR' },
    { brand: 'Framework', code: 'FRM' },
    { brand: 'Microsoft', code: 'MS' },
    { brand: 'Panasonic', code: 'PAN' },
    { brand: 'Samsung', code: 'SAM' },
    { brand: 'Gigabyte', code: 'GIG' },
  ];

  const seriesData: {
    brand: any;
    name: string;
    cat: any;
    screen: string;
    cpu: string;
    gpu: string;
    ram: string;
    ramUp: any;
    storage: string;
    slots: any;
    wh: number;
    watts: number;
    os: any;
    tear: 1 | 2 | 3 | 4 | 5;
    fault: string;
  }[] = [
    // Lenovo
    { brand: 'Lenovo', name: 'ThinkPad X1 Carbon Gen 12', cat: 'Enterprise Business', screen: '14" 2.8K OLED 120Hz', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc Graphics', ram: '32GB LPDDR5X-7500', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 57, watts: 65, os: 'Windows 11 Pro', tear: 2, fault: 'TrackPoint drift, USB-C thunderbolt port fatigue' },
    { brand: 'Lenovo', name: 'ThinkPad P16 Gen 2 Workstation', cat: 'Workstation', screen: '16" 4K UHD+ IPS 800nits', cpu: 'Intel Core i9-13980HX', gpu: 'NVIDIA RTX 5000 Ada 16GB', ram: '64GB (2x32GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe (RAID 1)', slots: 'Dual M.2 Gen4', wh: 94, watts: 230, os: 'Windows 11 Pro', tear: 1, fault: 'VRM thermal throttling under continuous CAD export' },
    { brand: 'Lenovo', name: 'Legion Pro 7i Gen 9 (16")', cat: 'Gaming Flagship', screen: '16" WQXGA 240Hz 500nits G-SYNC', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 99.9, watts: 330, os: 'Windows 11 Home', tear: 2, fault: 'Vapor chamber liquid metal oxidation, charger barrel pin wear' },
    { brand: 'Lenovo', name: 'ThinkPad T14s Gen 5 AMD', cat: 'Student Loaner', screen: '14" WUXGA Low-Power IPS 400nits', cpu: 'AMD Ryzen 7 PRO 8840U', gpu: 'AMD Radeon 780M', ram: '16GB LPDDR5X', ramUp: 'Soldered', storage: '512GB Gen4 NVMe', slots: 'Single M.2', wh: 57, watts: 65, os: 'Windows 11 Pro', tear: 2, fault: 'Display ribbon hinge strain, keyboard keycap displacement' },
    { brand: 'Lenovo', name: 'Yoga Book 9i Dual Screen', cat: 'Convertible 2-in-1', screen: 'Dual 13.3" 2.8K OLED Displays', cpu: 'Intel Core Ultra 7 155U', gpu: 'Intel Graphics', ram: '16GB LPDDR5X', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 80, watts: 65, os: 'Windows 11 Home', tear: 4, fault: 'Dual display ribbon flex cable fatigue, hinge alignment' },

    // Dell
    { brand: 'Dell', name: 'XPS 16 9640 Flagship', cat: 'Creator', screen: '16.3" 4K+ OLED Touch 400nits', cpu: 'Intel Core Ultra 9 185H', gpu: 'NVIDIA RTX 4070 Mobile 8GB', ram: '32GB LPDDR5X-7467', ramUp: 'Soldered', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 99.5, watts: 130, os: 'Windows 11 Pro', tear: 3, fault: 'Capacitive touch function row dead zones, glass trackpad haptic failure' },
    { brand: 'Dell', name: 'Precision 7780 17.3" Heavy Workstation', cat: 'Workstation', screen: '17.3" 4K UHD 120Hz 500nits', cpu: 'Intel Core i9-13950HX', gpu: 'NVIDIA RTX 4000 Ada 12GB', ram: '64GB CAMM2 DDR5-5600', ramUp: 'Modular CAMM2', storage: '4TB (2x2TB RAID 0)', slots: 'Dual M.2 (Gen5 + Gen4)', wh: 93, watts: 240, os: 'Windows 11 Pro', tear: 1, fault: 'CAMM compression connector seating, DC jack solder fracture' },
    { brand: 'Dell', name: 'Alienware m18 R2 Gaming Laptop', cat: 'Gaming Flagship', screen: '18" QHD+ 165Hz ComfortView Plus', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W)', ram: '64GB (2x32GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '4TB (2x2TB) Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 97, watts: 360, os: 'Windows 11 Home', tear: 2, fault: 'Quad-fan dust clogging, Element 31 thermal interface pump-out' },
    { brand: 'Dell', name: 'Latitude 5540 Enterprise Laptop', cat: 'Enterprise Business', screen: '15.6" FHD IPS Anti-Glare', cpu: 'Intel Core i7-1365U vPro', gpu: 'Intel Iris Xe', ram: '16GB (1x16GB) DDR4-3200', ramUp: '2x SO-DIMM (Upgradable)', storage: '512GB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 54, watts: 65, os: 'Windows 11 Pro', tear: 1, fault: 'Loose RJ45 drop-jaw connector, BIOS TPM sync failure' },
    { brand: 'Dell', name: 'Latitude 5430 Rugged Extreme', cat: 'Rugged Field', screen: '14" FHD 1100nits Direct-Sunlight', cpu: 'Intel Core i5-1145G7 vPro', gpu: 'Intel Iris Xe', ram: '32GB DDR4-3200', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Self-Encrypting OPAL SSD', slots: 'Single M.2', wh: 53.5, watts: 90, os: 'Windows 11 Pro', tear: 1, fault: 'Rubber port seal deterioration, stylus tether snap' },

    // Apple
    { brand: 'Apple', name: 'MacBook Pro 16" (M3 Max)', cat: 'Creator', screen: '16.2" Liquid Retina XDR 120Hz ProMotion (1600 nits)', cpu: 'Apple M3 Max (16-core CPU / 40-core GPU)', gpu: 'Integrated 40-core Metal GPU', ram: '48GB Unified Memory', ramUp: 'Soldered', storage: '1TB Apple NVMe', slots: 'Proprietary Apple SSD', wh: 100, watts: 140, os: 'macOS Sonoma', tear: 5, fault: 'Display stage light flexgate wear, MagSafe 3 debris short' },
    { brand: 'Apple', name: 'MacBook Pro 14" (M3 Pro)', cat: 'Workstation', screen: '14.2" Liquid Retina XDR 120Hz ProMotion', cpu: 'Apple M3 Pro (12-core CPU / 18-core GPU)', gpu: 'Integrated 18-core GPU', ram: '18GB Unified Memory', ramUp: 'Soldered', storage: '512GB Apple NVMe', slots: 'Proprietary Apple SSD', wh: 70, watts: 96, os: 'macOS Sonoma', tear: 5, fault: 'Trackpad force sensor calibration, HDMI 2.1 handshake drop' },
    { brand: 'Apple', name: 'MacBook Air 15" (M3)', cat: 'Ultrabook', screen: '15.3" Liquid Retina IPS 500nits', cpu: 'Apple M3 (8-core CPU / 10-core GPU)', gpu: 'Integrated 10-core GPU', ram: '16GB Unified Memory', ramUp: 'Soldered', storage: '512GB Apple NVMe', slots: 'Proprietary Apple SSD', wh: 66.5, watts: 35, os: 'macOS Sequoia', tear: 5, fault: 'Fanless thermal throttling under sustained rendering, anodization chipping' },
    { brand: 'Apple', name: 'MacBook Air 13" (M2)', cat: 'Student Loaner', screen: '13.6" Liquid Retina 500nits', cpu: 'Apple M2 (8-core CPU / 8-core GPU)', gpu: 'Integrated 8-core GPU', ram: '8GB Unified Memory', ramUp: 'Soldered', storage: '256GB Single-NAND SSD', slots: 'Proprietary Apple SSD', wh: 52.6, watts: 30, os: 'macOS Sonoma', tear: 5, fault: 'Single NAND chip 256GB read/write speed degradation under swap' },

    // HP
    { brand: 'HP', name: 'ZBook Fury 16 G10 Mobile Workstation', cat: 'Workstation', screen: '16" DreamColor 4K 120Hz 500nits 100% DCI-P3', cpu: 'Intel Core i9-13950HX', gpu: 'NVIDIA RTX 5000 Ada 16GB', ram: '64GB (2x32GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe (4x M.2 slots)', slots: 'Dual M.2 Gen4', wh: 95, watts: 230, os: 'Windows 11 Pro', tear: 1, fault: 'Tool-less battery latch sensor failure, thermal paste pump-out' },
    { brand: 'HP', name: 'Omen Transcend 16 OLED', cat: 'Gaming Flagship', screen: '16" 2.5K OLED 240Hz 0.2ms', cpu: 'Intel Core i7-14700HX', gpu: 'NVIDIA RTX 4070 Mobile 8GB', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 97, watts: 230, os: 'Windows 11 Home', tear: 2, fault: 'OLED static taskbar burn-in risk, HP Omen Hub fan profile bug' },
    { brand: 'HP', name: 'EliteBook 840 G10 Enterprise', cat: 'Enterprise Business', screen: '14" WUXGA IPS SureView Privacy', cpu: 'Intel Core i7-1360P', gpu: 'Intel Iris Xe', ram: '16GB DDR5-5200', ramUp: '2x SO-DIMM (Upgradable)', storage: '512GB Gen4 NVMe', slots: 'Single M.2', wh: 51, watts: 65, os: 'Windows 11 Pro', tear: 2, fault: 'SureView privacy angle distortion, BIOS HP Wolf Security lock' },
    { brand: 'HP', name: 'Spectre x360 16 2-in-1', cat: 'Convertible 2-in-1', screen: '16" 2.8K OLED Touch 120Hz', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc Graphics', ram: '32GB LPDDR5X', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 83, watts: 100, os: 'Windows 11 Home', tear: 3, fault: '360 degree hinge gyroscope sensor lag, stylus charging coil' },

    // ASUS
    { brand: 'ASUS', name: 'ROG Zephyrus G16 (2024) OLED', cat: 'Gaming Flagship', screen: '16" 2.5K ROG Nebula OLED 240Hz 0.2ms G-SYNC', cpu: 'Intel Core Ultra 9 185H', gpu: 'NVIDIA RTX 4090 Mobile 16GB (115W)', ram: '32GB LPDDR5X-7467', ramUp: 'Soldered', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 90, watts: 240, os: 'Windows 11 Home', tear: 3, fault: 'CNC aluminum chassis grounding static, OLED panel adhesive lift' },
    { brand: 'ASUS', name: 'ROG Strix SCAR 18 (2024)', cat: 'Gaming Flagship', screen: '18" QHD+ 240Hz Mini-LED (1100 nits)', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W)', ram: '64GB (2x32GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '4TB (2x2TB RAID 0 Gen4)', slots: 'Dual M.2 Gen4', wh: 90, watts: 330, os: 'Windows 11 Home', tear: 2, fault: 'Liquid metal barrier leakage onto SMD capacitors, coil whine' },
    { brand: 'ASUS', name: 'Zenbook Duo (2024) Dual OLED', cat: 'Creator', screen: 'Dual 14" 3K OLED 120Hz Touch Displays', cpu: 'Intel Core Ultra 9 185H', gpu: 'Intel Arc Graphics', ram: '32GB LPDDR5X', ramUp: 'Soldered', storage: '2TB Gen4 NVMe', slots: 'Single M.2', wh: 75, watts: 65, os: 'Windows 11 Pro', tear: 4, fault: 'Pogo pin magnetic keyboard connector oxidization, lower screen heat' },
    { brand: 'ASUS', name: 'ProArt Studiobook 16 OLED', cat: 'Creator', screen: '16" 3.2K 120Hz OLED 100% DCI-P3 Calman Verified', cpu: 'Intel Core i9-13980HX', gpu: 'NVIDIA RTX 4070 Mobile 8GB', ram: '64GB (2x32GB) DDR5', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 90, watts: 200, os: 'Windows 11 Pro', tear: 2, fault: 'ASUS Dial mechanical optical rotary encoder dust contamination' },

    // Framework
    { brand: 'Framework', name: 'Framework Laptop 16 (Modular GPU Bay)', cat: 'Workstation', screen: '16" QHD+ 165Hz 100% DCI-P3 500nits', cpu: 'AMD Ryzen 7 7840HS', gpu: 'AMD Radeon RX 7700S Modular Graphics Bay (or Expansion Bay blank)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 85, watts: 180, os: 'Ubuntu Linux 24.04', tear: 1, fault: 'Expansion bay connector latch alignment, spacer module rattle' },
    { brand: 'Framework', name: 'Framework Laptop 13 (Intel Core Ultra)', cat: 'Student Loaner', screen: '13.5" 2.8K 120Hz 3:2 Aspect Ratio', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc Graphics', ram: '32GB (2x16GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 61, watts: 65, os: 'Windows 11 Pro', tear: 1, fault: 'Modular USB-C expansion card sleep power drain' },

    // Razer
    { brand: 'Razer', name: 'Razer Blade 16 (Dual-Mode Mini-LED)', cat: 'Gaming Flagship', screen: '16" Dual-Mode Mini-LED (UHD+ 120Hz / FHD+ 240Hz)', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 95.2, watts: 330, os: 'Windows 11 Home', tear: 2, fault: 'Lithium battery swelling (pillow pouch), vapor chamber seal crack' },
    { brand: 'Razer', name: 'Razer Blade 14 (AMD Ryzen 9)', cat: 'Ultrabook', screen: '14" QHD+ 240Hz 500nits IPS', cpu: 'AMD Ryzen 9 8945HS', gpu: 'NVIDIA RTX 4070 Mobile 8GB (140W)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 68.5, watts: 230, os: 'Windows 11 Home', tear: 2, fault: 'Anodized black finish finger oil corrosion, power brick heat' },

    // MSI
    { brand: 'MSI', name: 'MSI Titan 18 HX Flagship Desktop Replacement', cat: 'Gaming Flagship', screen: '18" 4K 120Hz Mini-LED 1000nits', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W OverBoost Ultra)', ram: '128GB (4x32GB) DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '4TB (2TB Gen5 + 2TB Gen4 NVMe)', slots: 'Dual M.2 (Gen5 + Gen4)', wh: 99.9, watts: 400, os: 'Windows 11 Pro', tear: 2, fault: 'Cherry MX mechanical switch spring ping, twin 200W adapter cord knot' },
    { brand: 'MSI', name: 'MSI Stealth 16 Studio OLED', cat: 'Creator', screen: '16" UHD+ OLED 120Hz 100% DCI-P3', cpu: 'Intel Core i9-13900H', gpu: 'NVIDIA RTX 4070 Mobile 8GB', ram: '32GB DDR5-5200', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 99.9, watts: 240, os: 'Windows 11 Pro', tear: 3, fault: 'Inverted motherboard design makes repasting difficult, hinge crack' },

    // Microsoft
    { brand: 'Microsoft', name: 'Surface Laptop Studio 2', cat: 'Convertible 2-in-1', screen: '14.4" PixelSense Flow 120Hz Touch with Haptics', cpu: 'Intel Core i7-13700H', gpu: 'NVIDIA RTX 4060 Mobile 8GB', ram: '32GB LPDDR5X', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Single M.2', wh: 80, watts: 120, os: 'Windows 11 Pro', tear: 4, fault: 'Dynamic woven fabric hinge flex wire fracture, surface pen coil' },
    { brand: 'Microsoft', name: 'Surface Pro 11 Copilot+ PC (OLED)', cat: 'Ultrabook', screen: '13" 2.8K OLED 120Hz HDR', cpu: 'Qualcomm Snapdragon X Elite (12-core)', gpu: 'Adreno GPU + 45 TOPS NPU', ram: '16GB LPDDR5X-8448', ramUp: 'Soldered', storage: '512GB Removable M.2 2230 SSD', slots: 'Single M.2', wh: 53, watts: 65, os: 'Windows 11 Pro', tear: 3, fault: 'ARM64 legacy x86 kernel driver incompatibility for custom lab dongles' },

    // Panasonic Toughbook
    { brand: 'Panasonic', name: 'Toughbook 40 Fully Rugged Tactical', cat: 'Rugged Field', screen: '14" FHD 1200nits Touch Glove-Enabled', cpu: 'Intel Core i7-1185G7 vPro', gpu: 'Intel Iris Xe', ram: '32GB DDR4-3200', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB Quick-Release Heater NVMe', slots: 'Single M.2', wh: 68, watts: 110, os: 'Windows 11 Pro', tear: 1, fault: 'Sub-zero battery heater failure in extreme environmental tests' },
    { brand: 'Panasonic', name: 'Toughbook 55 Semi-Rugged Modular', cat: 'Rugged Field', screen: '14" FHD 1000nits Touch', cpu: 'Intel Core i7-1370P vPro', gpu: 'Intel Iris Xe + Modular dGPU Bay', ram: '32GB DDR4-3200', ramUp: '2x SO-DIMM (Upgradable)', storage: '1TB NVMe OPAL', slots: 'Dual M.2 Gen4', wh: 65, watts: 90, os: 'Windows 11 Pro', tear: 1, fault: 'Modular bay microswitch oxidation, fingerprint reader dust' },

    // Acer
    { brand: 'Acer', name: 'Predator Helios 18 (2024)', cat: 'Gaming Flagship', screen: '18" WQXGA 250Hz Mini-LED (1000 nits)', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4080 Mobile 12GB (175W)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe (RAID 0)', slots: 'Dual M.2 Gen4', wh: 90, watts: 330, os: 'Windows 11 Home', tear: 2, fault: 'Liquid metal dry spots on GPU die, keyboard MagKey switch wobble' },
    { brand: 'Acer', name: 'Swift Go 14 OLED AI Edition', cat: 'Student Loaner', screen: '14" 2.8K OLED 90Hz 100% DCI-P3', cpu: 'Intel Core Ultra 7 155H', gpu: 'Intel Arc Graphics', ram: '16GB LPDDR5X', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 65, watts: 65, os: 'Windows 11 Home', tear: 2, fault: 'Plastic bottom chassis clips fracture during teardown, touchpad rattle' },

    // Samsung & Gigabyte
    { brand: 'Samsung', name: 'Galaxy Book4 Ultra 16"', cat: 'Creator', screen: '16" 3K Dynamic AMOLED 2X 120Hz Anti-Reflective', cpu: 'Intel Core Ultra 9 185H', gpu: 'NVIDIA RTX 4070 Mobile 8GB (80W)', ram: '32GB LPDDR5X', ramUp: 'Soldered', storage: '1TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 76, watts: 140, os: 'Windows 11 Home', tear: 3, fault: 'Thin AMOLED glass edge impact vulnerability, USB-C fast charge negotiation' },
    { brand: 'Gigabyte', name: 'AORUS 17X (2024) Extreme', cat: 'Gaming Flagship', screen: '17.3" QHD 240Hz 100% DCI-P3', cpu: 'Intel Core i9-14900HX', gpu: 'NVIDIA RTX 4090 Mobile 16GB (175W)', ram: '32GB DDR5-5600', ramUp: '2x SO-DIMM (Upgradable)', storage: '2TB Gen4 NVMe', slots: 'Dual M.2 Gen4', wh: 99, watts: 330, os: 'Windows 11 Pro', tear: 2, fault: 'Windforce Infinity quad-fan bearing wear, RGB fusion software crash' },
  ];

  const statuses: LaptopAsset['status'][] = [
    'In Fleet / Available',
    'In Fleet / Available',
    'In Fleet / Available',
    'Assigned to Student',
    'Assigned to Student',
    'Under Triage / Bench',
    'Awaiting Parts',
  ];

  // Populate 510+ laptops systematically
  let index = 0;
  while (laptops.length < 515) {
    const template = seriesData[index % seriesData.length];
    const unitNum = Math.floor(index / seriesData.length) + 1;
    const brandCode = brands.find((b) => b.brand === template.brand)?.code || 'GEN';
    const tag = `LAP-${brandCode}-${String(idCount).padStart(4, '0')}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const bench = status === 'Under Triage / Bench' ? `Bench ${String((index % 16) + 1).padStart(2, '0')}` : undefined;
    const health = Math.floor(Math.random() * 25) + 75; // 75% to 100%

    laptops.push({
      id: `lap_${String(idCount++).padStart(4, '0')}`,
      assetTag: tag,
      model: `${template.name} (Unit #${String(unitNum).padStart(2, '0')})`,
      brand: template.brand,
      category: template.cat,
      screen: template.screen,
      cpu: template.cpu,
      gpu: template.gpu,
      ram: template.ram,
      ramUpgrade: template.ramUp,
      storage: template.storage,
      storageSlots: template.slots,
      batteryWh: template.wh,
      batteryHealth: health,
      weightKg: Math.round((1.2 + Math.random() * 1.8) * 10) / 10,
      powerAdapterWatts: template.watts,
      os: template.os,
      ports: 'Thunderbolt 4 / USB-C, USB 3.2 Type-A, HDMI 2.1, 3.5mm Audio',
      teardownDifficulty: template.tear,
      status: status,
      assignedBench: bench,
      commonFaults: template.fault,
      notes: `TradeTech Vocational Lab asset. Serial verified: SN-${brandCode}${Math.floor(Math.random() * 899999 + 100000)}.`,
    });

    index++;
  }

  return laptops;
};

const laptops = generateLaptops();
const filePath = path.join(process.cwd(), 'src', 'data', 'laptopsCatalog.json');
fs.writeFileSync(filePath, JSON.stringify(laptops, null, 2), 'utf-8');
console.log(`Successfully generated ${laptops.length} laptops in laptopsCatalog.json!`);
