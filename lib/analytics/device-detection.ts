import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  deviceBrand: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
}

const BRAND_MAPPING: Record<string, string> = {
  // Mobile brands
  "iPhone": "Apple",
  "iPad": "Apple",
  "iPod": "Apple",
  "Samsung": "Samsung",
  "Galaxy": "Samsung",
  "Pixel": "Google",
  "Nexus": "Google",
  "OnePlus": "OnePlus",
  "Xiaomi": "Xiaomi",
  "Redmi": "Xiaomi",
  "POCO": "Xiaomi",
  "Mi ": "Xiaomi",
  "OPPO": "OPPO",
  "Vivo": "Vivo",
  "Realme": "Realme",
  "Motorola": "Motorola",
  "Moto": "Motorola",
  "Nokia": "Nokia",
  "Sony": "Sony",
  "Xperia": "Sony",
  "LG": "LG",
  "Huawei": "Huawei",
  "Honor": "Honor",
  "Asus": "ASUS",
  "ROG": "ASUS",
  "ZenFone": "ASUS",
  "HTC": "HTC",
  "BlackBerry": "BlackBerry",
  "ZTE": "ZTE",
  "Alcatel": "Alcatel",
  "TCL": "TCL",
  "Sharp": "Sharp",
  "Kyocera": "Kyocera",
  "Cat": "Caterpillar",
  "Razer": "Razer",

  // Desktop/Laptop brands (from UA hints)
  "Macintosh": "Apple",
  "MacBook": "Apple",
  "iMac": "Apple",
  "Mac Pro": "Apple",
  "Mac mini": "Apple",
  "Surface": "Microsoft",
  "Windows PC": "Windows PC",
  "ThinkPad": "Lenovo",
  "ThinkCentre": "Lenovo",
  "IdeaPad": "Lenovo",
  "Yoga": "Lenovo",
  "Legion": "Lenovo",
  "Dell": "Dell",
  "XPS": "Dell",
  "Inspiron": "Dell",
  "Latitude": "Dell",
  "Precision": "Dell",
  "Alienware": "Dell",
  "HP": "HP",
  "Pavilion": "HP",
  "Envy": "HP",
  "Spectre": "HP",
  "EliteBook": "HP",
  "ProBook": "HP",
  "OMEN": "HP",
  "Lenovo": "Lenovo",
  "ASUS": "ASUS",
  "ZenBook": "ASUS",
  "VivoBook": "ASUS",
  "Acer": "Acer",
  "Predator": "Acer",
  "Nitro": "Acer",
  "Aspire": "Acer",
  "Swift": "Acer",
  "MSI": "MSI",
  "Razer Blade": "Razer",
  "Framework": "Framework",
  "System76": "System76",
  "Purism": "Purism",
};

function detectBrand(parser: UAParser): string | null {
  const result = parser.getResult();
  const ua = result.ua || "";

  // Check device model first
  const device = result.device;
  if (device?.model) {
    for (const [key, brand] of Object.entries(BRAND_MAPPING)) {
      if (device.model.includes(key)) {
        return brand;
      }
    }
  }

  // Check vendor
  if (device?.vendor) {
    for (const [key, brand] of Object.entries(BRAND_MAPPING)) {
      if (device.vendor.includes(key)) {
        return brand;
      }
    }
  }

  // Check UA string for brand hints
  for (const [key, brand] of Object.entries(BRAND_MAPPING)) {
    if (ua.includes(key)) {
      return brand;
    }
  }

  // Fallback: derive from OS
  const os = result.os;
  if (os?.name) {
    if (os.name === "iOS" || os.name === "Mac OS") return "Apple";
    if (os.name === "Android") return "Android Device";
    if (os.name === "Windows") return "Windows PC";
    if (os.name === "Linux") return "Linux PC";
  }

  return null;
}

export function parseDeviceInfo(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const device = result.device;
  const browser = result.browser;
  const os = result.os;

  let deviceType: DeviceInfo["deviceType"] = "unknown";
  if (device?.type === "mobile") deviceType = "mobile";
  else if (device?.type === "tablet") deviceType = "tablet";
  else if (!device?.type) deviceType = "desktop";

  const deviceBrand = detectBrand(parser);

  return {
    deviceType,
    deviceBrand,
    browser: browser?.name || null,
    browserVersion: browser?.version || null,
    os: os?.name || null,
    osVersion: os?.version || null,
  };
}