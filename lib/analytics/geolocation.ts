export interface GeolocationResult {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  regionCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyRadius: number | null;
}

/**
 * Geolocation is resolved using Vercel Edge Network headers.
 * This is the primary and only production geolocation source for this deployment.
 * 
 * Headers used:
 * - x-vercel-ip-country: Country code (ISO 3166-1 alpha-2)
 * - x-vercel-ip-country-region: Region/state code
 * - x-vercel-ip-city: City name
 * - x-vercel-ip-timezone: Timezone
 * 
 * For local development where Vercel headers are not present,
 * location will be "Unknown" - analytics events are still recorded.
 * 
 * No external geolocation services (MaxMind, IPInfo, etc.) are used
 * to avoid additional dependencies and costs.
 */

export function parseVercelGeolocationHeaders(headers: Headers): GeolocationResult {
  const countryCode = headers.get("x-vercel-ip-country");
  const regionCode = headers.get("x-vercel-ip-country-region");
  const city = headers.get("x-vercel-ip-city");
  const timezone = headers.get("x-vercel-ip-timezone");

  // Indian state code to name mapping
  const indianStates: Record<string, string> = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar",
    "CG": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat", "HR": "Haryana",
    "HP": "Himachal Pradesh", "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala",
    "MP": "Madhya Pradesh", "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya",
    "MZ": "Mizoram", "NL": "Nagaland", "OD": "Odisha", "PB": "Punjab", "RJ": "Rajasthan",
    "SK": "Sikkim", "TN": "Tamil Nadu", "TG": "Telangana", "TR": "Tripura",
    "UP": "Uttar Pradesh", "UK": "Uttarakhand", "WB": "West Bengal",
    "AN": "Andaman and Nicobar Islands", "CH": "Chandigarh", "DN": "Dadra and Nagar Haveli",
    "DD": "Daman and Diu", "DL": "Delhi", "JK": "Jammu and Kashmir", "LA": "Ladakh",
    "LD": "Lakshadweep", "PY": "Puducherry"
  };

  let region: string | null = regionCode;
  let country: string | null = countryCode;

  // Convert country code to name for common countries
  const countryNames: Record<string, string> = {
    IN: "India", US: "United States", GB: "United Kingdom", DE: "Germany",
    FR: "France", CA: "Canada", AU: "Australia", JP: "Japan",
    CN: "China", BR: "Brazil", SG: "Singapore", AE: "United Arab Emirates",
    NL: "Netherlands", SE: "Sweden", NO: "Norway", DK: "Denmark",
    FI: "Finland", CH: "Switzerland", AT: "Austria", BE: "Belgium",
    PL: "Poland", CZ: "Czech Republic", PT: "Portugal", IE: "Ireland",
    NZ: "New Zealand", ZA: "South Africa", MX: "Mexico", AR: "Argentina",
    CL: "Chile", CO: "Colombia", PE: "Peru", VN: "Vietnam", TH: "Thailand",
    ID: "Indonesia", MY: "Malaysia", PH: "Philippines", HK: "Hong Kong",
    TW: "Taiwan", KR: "South Korea", IL: "Israel", TR: "Turkey",
    SA: "Saudi Arabia", EG: "Egypt", NG: "Nigeria", KE: "Kenya",
  };

  if (countryCode && countryNames[countryCode]) {
    country = countryNames[countryCode];
  }

  // Convert Indian region code to full state name
  if (countryCode === "IN" && regionCode && indianStates[regionCode]) {
    region = indianStates[regionCode];
  }

  return {
    country,
    countryCode,
    region,
    regionCode,
    city: city || null,
    latitude: null,
    longitude: null,
    accuracyRadius: null,
  };
}

/**
 * Check if Vercel geolocation headers are available
 */
export function hasVercelGeolocationHeaders(headers: Headers): boolean {
  return !!headers.get("x-vercel-ip-country");
}