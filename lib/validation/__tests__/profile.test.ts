// lib/validation/__tests__/profile.test.ts
import { describe, it, expect } from 'vitest';
import {
  profileSlugSchema,
  profileBasicInfoSchema,
  leadFormSubmissionSchema,
} from '@/lib/validation/profile';

describe('profileSlugSchema', () => {
  it('accepts a valid lowercase hyphenated slug', () => {
    expect(profileSlugSchema.safeParse('jane-doe').success).toBe(true);
  });

  it('rejects slugs with uppercase letters', () => {
    expect(profileSlugSchema.safeParse('Jane-Doe').success).toBe(false);
  });

  it('rejects slugs shorter than 3 characters', () => {
    expect(profileSlugSchema.safeParse('ab').success).toBe(false);
  });

  it('rejects slugs with consecutive or trailing hyphens patterns not matching the regex', () => {
    expect(profileSlugSchema.safeParse('jane--doe').success).toBe(false);
    expect(profileSlugSchema.safeParse('-janedoe').success).toBe(false);
  });
});

describe('profileBasicInfoSchema', () => {
  it('requires a full name', () => {
    const result = profileBasicInfoSchema.safeParse({ fullName: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields as empty strings', () => {
    const result = profileBasicInfoSchema.safeParse({
      fullName: 'Jane Doe',
      jobTitle: '',
      companyName: '',
      bio: '',
      phone: '',
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid phone number', () => {
    const result = profileBasicInfoSchema.safeParse({
      fullName: 'Jane Doe',
      phone: 'not-a-phone',
    });
    expect(result.success).toBe(false);
  });
});

describe('leadFormSubmissionSchema', () => {
  it('requires a name and defaults source to direct', () => {
    const result = leadFormSubmissionSchema.safeParse({ fullName: 'Ravi Kumar' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('direct');
    }
  });

  it('rejects a message over 2000 characters', () => {
    const result = leadFormSubmissionSchema.safeParse({
      fullName: 'Ravi Kumar',
      message: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
