import type { ValueTransformer } from 'typeorm';

/** แปลง null <-> undefined ที่ boundary กับ DB เพื่อใช้ optional (?) แทน | null */
export const optionalString: ValueTransformer = {
  from: (v: string | null) => v ?? undefined,
  to: (v: string | undefined) => v ?? null,
};

export const optionalNumber: ValueTransformer = {
  from: (v: number | null) => (v == null ? undefined : v),
  to: (v: number | undefined) => v ?? null,
};

export const optionalDate: ValueTransformer = {
  from: (v: Date | null) => v ?? undefined,
  to: (v: Date | undefined) => v ?? null,
};
