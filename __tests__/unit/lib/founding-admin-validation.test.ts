import { describe, expect, it } from 'vitest';
import {
  FoundingApplicationNotesSchema,
  FoundingApplicationStatusChangeSchema,
} from '@/lib/validation/founding-admin';
import { validateLocationFields } from '@/lib/validation/founding-application';

describe('FoundingApplicationStatusChangeSchema', () => {
  it('accepts review transitions with an optional audit note', () => {
    expect(
      FoundingApplicationStatusChangeSchema.safeParse({
        applicationId: '12',
        status: 'UNDER_REVIEW',
        note: 'Check portfolio',
        reason: '',
      }).success,
    ).toBe(true);
  });

  it('requires a reason for rejection', () => {
    const result = FoundingApplicationStatusChangeSchema.safeParse({
      applicationId: '12',
      status: 'REJECTED',
      note: '',
      reason: '  ',
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]?.message).toMatch(/reason/i);
  });

  it('rejects statuses outside the founding application lifecycle', () => {
    expect(
      FoundingApplicationStatusChangeSchema.safeParse({
        applicationId: '12',
        status: 'DELETED',
        note: '',
        reason: '',
      }).success,
    ).toBe(false);
  });
});

describe('FoundingApplicationNotesSchema', () => {
  it('trims notes and validates application IDs', () => {
    const result = FoundingApplicationNotesSchema.safeParse({
      applicationId: '12',
      notes: '  promising portfolio  ',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBe('promising portfolio');
  });
});

describe('validateLocationFields', () => {
  it('accepts positive integer country and city IDs', () => {
    expect(validateLocationFields(44, 125).ok).toBe(true);
  });

  it('requires both location IDs to be positive integers', () => {
    expect(validateLocationFields(undefined, 125).ok).toBe(false);
    expect(validateLocationFields(44, '125').ok).toBe(false);
    expect(validateLocationFields(0, 125).ok).toBe(false);
  });
});
