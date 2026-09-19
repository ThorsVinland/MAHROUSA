// ============================================================
// src/utils/wilayaHelper.ts
// Coordinates & Arabic naming helper generated dynamically from communes.json
// ============================================================

import communesData from './communes.json';

export interface WilayaInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const ALGERIA_WILAYAS: Record<number, WilayaInfo> = {};

// Build ALGERIA_WILAYAS dynamically from communes.json (all 69 wilayas)
(communesData as any[]).forEach((item) => {
  const code = parseInt(item.wilaya_code, 10);
  if (!isNaN(code) && !ALGERIA_WILAYAS[code]) {
    ALGERIA_WILAYAS[code] = {
      code: code.toString(),
      name: item.name_ar || item.name || '',
      lat: item.latitude || 35.6372,
      lng: item.longitude || -0.6482,
    };
  }
});

export function getWilayaInfo(codeOrName?: string | number | null): WilayaInfo {
  const defaultWilaya: WilayaInfo = ALGERIA_WILAYAS[31] || {
    code: "31",
    name: "وهران",
    lat: 35.6372,
    lng: -0.6482,
  };

  if (!codeOrName) return defaultWilaya;

  const num = parseInt(String(codeOrName), 10);
  if (!isNaN(num) && ALGERIA_WILAYAS[num]) {
    return ALGERIA_WILAYAS[num];
  }

  const str = String(codeOrName).trim();
  for (const key in ALGERIA_WILAYAS) {
    const item = ALGERIA_WILAYAS[key];
    if (item.name === str || str.includes(item.name) || item.name.includes(str)) {
      return item;
    }
  }

  // Also check against communesData directly in case codeOrName is a commune name
  const foundCommune = (communesData as any[]).find(
    (c) => c.name_ar === str || c.name === str || str.includes(c.name_ar)
  );
  if (foundCommune) {
    const code = parseInt(foundCommune.wilaya_code, 10);
    if (ALGERIA_WILAYAS[code]) {
      return ALGERIA_WILAYAS[code];
    }
    return {
      code: code.toString(),
      name: foundCommune.name_ar || foundCommune.name,
      lat: foundCommune.latitude || 35.6372,
      lng: foundCommune.longitude || -0.6482,
    };
  }

  return defaultWilaya;
}
