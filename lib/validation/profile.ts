// lib/validation/profile.ts
// Single source of truth for profile validation — imported by both the
// client-side form (react-hook-form + zodResolver) and the server-side
// route handler, so there is exactly one place that defines "a valid
// profile."

import { z } from 'zod';

const phoneRegex = /^\+?[1-9][0-9]{7,14}$/;
const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const profileSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters.')
  .max(60, 'Slug must be 60 characters or fewer.')
  .regex(slugRegex, 'Use lowercase letters, numbers, and hyphens only.');

export const profileBasicInfoSchema = z.object({
  fullName: z.string().min(1, 'Name is required.').max(120),
  jobTitle: z.string().max(120).optional().or(z.literal('')),
  companyName: z.string().max(120).optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must be 1000 characters or fewer.').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(phoneRegex, 'Enter a valid phone number with country code.')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
});

export const profileContactExtrasSchema = z.object({
  websiteUrl: z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(phoneRegex, 'Enter a valid WhatsApp number with country code.')
    .optional()
    .or(z.literal('')),
  mapAddress: z.string().max(240).optional().or(z.literal('')),
});

export const socialLinkSchema = z.object({
  platform: z.enum([
    'linkedin',
    'instagram',
    'twitter',
    'facebook',
    'youtube',
    'tiktok',
    'github',
    'behance',
    'dribbble',
    'custom',
  ]),
  label: z.string().max(60).optional(),
  url: z.string().url('Enter a valid URL.'),
});

export const galleryItemSchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']),
  caption: z.string().max(240).optional(),
});

export const leadFormSubmissionSchema = z.object({
  fullName: z.string().min(1, 'Name is required.').max(120),
  email: z.string().email('Enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  company: z.string().max(120).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  source: z.enum(['nfc', 'qr', 'link', 'share', 'direct']).default('direct'),
});

export const organizationBrandingSchema = z.object({
  name: z.string().min(2).max(120),
  brandPrimaryColor: z.string().regex(hexColorRegex, 'Use a hex color like #C9A24B.').optional(),
  brandSecondaryColor: z.string().regex(hexColorRegex, 'Use a hex color like #111111.').optional(),
});

export type ProfileBasicInfoInput = z.infer<typeof profileBasicInfoSchema>;
export type ProfileContactExtrasInput = z.infer<typeof profileContactExtrasSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type LeadFormSubmissionInput = z.infer<typeof leadFormSubmissionSchema>;
export type OrganizationBrandingInput = z.infer<typeof organizationBrandingSchema>;
