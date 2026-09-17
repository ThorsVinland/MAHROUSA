// ============================================================
// src/utils/wilayaHelper.ts
// Coordinates & Arabic naming helper for all 58 Algerian Wilayas
// ============================================================

export interface WilayaInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const ALGERIA_WILAYAS: Record<number, WilayaInfo> = {
  "1": {
    "code": "01",
    "name": "أدرار",
    "lat": 27.9763,
    "lng": -0.4842
  },
  "2": {
    "code": "02",
    "name": "الشلف",
    "lat": 36.1691,
    "lng": 1.2839
  },
  "3": {
    "code": "03",
    "name": "الأغواط",
    "lat": 33.794,
    "lng": 2.8369
  },
  "4": {
    "code": "04",
    "name": "أم البواقي",
    "lat": 35.8726,
    "lng": 7.083
  },
  "5": {
    "code": "05",
    "name": "باتنة",
    "lat": 35.5784,
    "lng": 6.1083
  },
  "6": {
    "code": "06",
    "name": "بجاية",
    "lat": 36.7696,
    "lng": 4.9385
  },
  "7": {
    "code": "07",
    "name": "بسكرة",
    "lat": 34.8515,
    "lng": 5.6546
  },
  "8": {
    "code": "08",
    "name": "بشار",
    "lat": 31.5965,
    "lng": -2.4145
  },
  "9": {
    "code": "09",
    "name": "البليدة",
    "lat": 36.4803,
    "lng": 2.7659
  },
  "10": {
    "code": "10",
    "name": "البويرة",
    "lat": 36.3728,
    "lng": 3.835
  },
  "11": {
    "code": "11",
    "name": "تمنراست",
    "lat": 22.2708,
    "lng": 4.5541
  },
  "12": {
    "code": "12",
    "name": "تبسة",
    "lat": 35.4117,
    "lng": 8.0755
  },
  "13": {
    "code": "13",
    "name": "تلمسان",
    "lat": 34.8959,
    "lng": -1.3501
  },
  "14": {
    "code": "14",
    "name": "تيارت",
    "lat": 35.36,
    "lng": 1.3216
  },
  "15": {
    "code": "15",
    "name": "تيزي وزو",
    "lat": 36.7002,
    "lng": 4.0059
  },
  "16": {
    "code": "16",
    "name": "الجزائر",
    "lat": 36.7682,
    "lng": 3.0404
  },
  "17": {
    "code": "17",
    "name": "الجلفة",
    "lat": 34.6741,
    "lng": 3.2504
  },
  "18": {
    "code": "18",
    "name": "جيجل",
    "lat": 36.7963,
    "lng": 5.7155
  },
  "19": {
    "code": "19",
    "name": "سطيف",
    "lat": 36.1905,
    "lng": 5.3502
  },
  "20": {
    "code": "20",
    "name": "سعيدة",
    "lat": 34.8419,
    "lng": 0.1133
  },
  "21": {
    "code": "21",
    "name": "سكيكدة",
    "lat": 36.8778,
    "lng": 6.8657
  },
  "22": {
    "code": "22",
    "name": "سيدي بلعباس",
    "lat": 35.2063,
    "lng": -0.7002
  },
  "23": {
    "code": "23",
    "name": "عنابة",
    "lat": 36.9184,
    "lng": 7.6752
  },
  "24": {
    "code": "24",
    "name": "قالمة",
    "lat": 36.4569,
    "lng": 7.3984
  },
  "25": {
    "code": "25",
    "name": "قسنطينة",
    "lat": 36.3539,
    "lng": 6.5074
  },
  "26": {
    "code": "26",
    "name": "المدية",
    "lat": 36.2838,
    "lng": 2.7028
  },
  "27": {
    "code": "27",
    "name": "مستغانم",
    "lat": 35.9752,
    "lng": 0.0449
  },
  "28": {
    "code": "28",
    "name": "المسيلة",
    "lat": 35.7211,
    "lng": 4.3786
  },
  "29": {
    "code": "29",
    "name": "معسكر",
    "lat": 35.3185,
    "lng": 0.1511
  },
  "30": {
    "code": "30",
    "name": "ورقلة",
    "lat": 31.8974,
    "lng": 5.3421
  },
  "31": {
    "code": "31",
    "name": "وهران",
    "lat": 35.6372,
    "lng": -0.6482
  },
  "32": {
    "code": "32",
    "name": "البيض",
    "lat": 33.6146,
    "lng": 1.019
  },
  "33": {
    "code": "33",
    "name": "إليزي",
    "lat": 26.4361,
    "lng": 8.4842
  },
  "34": {
    "code": "34",
    "name": "برج بوعريريج",
    "lat": 36.0025,
    "lng": 4.7653
  },
  "35": {
    "code": "35",
    "name": "بومرداس",
    "lat": 36.7048,
    "lng": 3.4662
  },
  "36": {
    "code": "36",
    "name": "الطارف",
    "lat": 36.7048,
    "lng": 8.3139
  },
  "37": {
    "code": "37",
    "name": "تندوف",
    "lat": 27.5972,
    "lng": -8.1491
  },
  "38": {
    "code": "38",
    "name": "تسمسيلت",
    "lat": 35.5445,
    "lng": 1.8127
  },
  "39": {
    "code": "39",
    "name": "الوادي",
    "lat": 33.3018,
    "lng": 6.8665
  },
  "40": {
    "code": "40",
    "name": "خنشلة",
    "lat": 35.3678,
    "lng": 7.1439
  },
  "41": {
    "code": "41",
    "name": "سوق أهراس",
    "lat": 36.2232,
    "lng": 7.9541
  },
  "42": {
    "code": "42",
    "name": "تيبازة",
    "lat": 36.5284,
    "lng": 2.45
  },
  "43": {
    "code": "43",
    "name": "ميلة",
    "lat": 36.387,
    "lng": 6.2677
  },
  "44": {
    "code": "44",
    "name": "عين الدفلى",
    "lat": 36.2,
    "lng": 1.9693
  },
  "45": {
    "code": "45",
    "name": "النعامة",
    "lat": 33.195,
    "lng": -0.3131
  },
  "46": {
    "code": "46",
    "name": "عين تموشنت",
    "lat": 35.2254,
    "lng": -1.1398
  },
  "47": {
    "code": "47",
    "name": "غرداية",
    "lat": 32.4171,
    "lng": 3.6832
  },
  "48": {
    "code": "48",
    "name": "غليزان",
    "lat": 35.6696,
    "lng": 0.5493
  },
  "49": {
    "code": "49",
    "name": "تيميمون",
    "lat": 29.2536,
    "lng": 0.2187
  },
  "50": {
    "code": "50",
    "name": "برج باجي مختار",
    "lat": 22.9676,
    "lng": -3.9464
  },
  "51": {
    "code": "51",
    "name": "أولاد جلال",
    "lat": 34.4175,
    "lng": 4.9713
  },
  "52": {
    "code": "52",
    "name": "بني عباس",
    "lat": 30.1302,
    "lng": -2.1783
  },
  "53": {
    "code": "53",
    "name": "عين صالح",
    "lat": 27.1955,
    "lng": 2.4666
  },
  "54": {
    "code": "54",
    "name": "عين قزام",
    "lat": 20.3875,
    "lng": 4.7892
  },
  "55": {
    "code": "55",
    "name": "توقرت",
    "lat": 33.0351,
    "lng": 6.0672
  },
  "56": {
    "code": "56",
    "name": "جانت",
    "lat": 24.4821,
    "lng": 9.4839
  },
  "57": {
    "code": "57",
    "name": "المغير",
    "lat": 33.8852,
    "lng": 5.9244
  },
  "58": {
    "code": "58",
    "name": "المنيعة",
    "lat": 30.5197,
    "lng": 2.8812
  }
};

export function getWilayaInfo(codeOrName?: string | number | null): WilayaInfo {
  const defaultWilaya: WilayaInfo = { code: "31", name: "وهران", lat: 35.6372, lng: -0.6482 };
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

  return defaultWilaya;
}
