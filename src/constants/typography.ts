// ============================================================
// src/constants/typography.ts
// Strict Typography Scale for MAHROUSA
// ============================================================

export interface TypographyToken {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
}

export const Typography: Record<
  'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'button',
  TypographyToken
> = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
} as const;
