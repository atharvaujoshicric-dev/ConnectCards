// packages/types/src/database.types.ts
// Hand-maintained to match supabase/migrations exactly. In CI, this file
// is verified against `supabase gen types typescript` output (see
// .github/workflows/ci.yml) so drift between schema and types fails the
// build rather than surfacing as a runtime bug.

export type PlanTier = 'free' | 'pro' | 'business' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export type CardColor = 'gold' | 'silver' | 'rose_gold' | 'black';

export type CardStatus =
  | 'manufactured'
  | 'ready_to_ship'
  | 'shipped'
  | 'activated'
  | 'frozen'
  | 'revoked';

export type OrderType = 'individual' | 'organization';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'razorpay' | 'stripe';

export type OrgRole = 'owner' | 'admin' | 'manager' | 'employee';

export type EmployeeStatus = 'invited' | 'active' | 'suspended' | 'offboarded';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type AnalyticsEventType =
  | 'profile_view'
  | 'nfc_tap'
  | 'qr_scan'
  | 'vcf_download'
  | 'brochure_download'
  | 'link_click'
  | 'lead_submitted';

export type AnalyticsSource = 'nfc' | 'qr' | 'link' | 'share' | 'direct';

export type NotificationType =
  | 'order_status_changed'
  | 'new_lead'
  | 'subscription_renewed'
  | 'subscription_payment_failed'
  | 'card_activated'
  | 'employee_invited'
  | 'seat_limit_reached'
  | 'card_frozen';

export interface Profile {
  id: string;
  user_id: string;
  organization_id: string | null;
  slug: string;
  full_name: string;
  job_title: string | null;
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  map_address: string | null;
  theme_id: string | null;
  dark_mode_enabled: boolean;
  is_published: boolean;
  branding_removed: boolean;
  plan: PlanTier;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  label: string | null;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  profile_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  default_theme_id: string | null;
  plan: 'business' | 'enterprise';
  seat_count: number;
  custom_domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  department_id: string | null;
  profile_id: string | null;
  invited_email: string;
  status: EmployeeStatus;
  invited_by: string | null;
  invited_at: string;
  activated_at: string | null;
  offboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManufacturingBatch {
  id: string;
  order_id: string | null;
  organization_id: string | null;
  quantity: number;
  color: CardColor;
  status: 'queued' | 'in_production' | 'quality_check' | 'ready_to_ship' | 'shipped';
  requested_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  batch_id: string;
  card_serial: string;
  activation_token: string;
  color: CardColor;
  status: CardStatus;
  owner_user_id: string | null;
  owner_profile_id: string | null;
  assigned_employee_id: string | null;
  organization_id: string | null;
  qr_code_url: string | null;
  activated_at: string | null;
  frozen_at: string | null;
  frozen_reason: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency: string;
  max_redemptions: number | null;
  times_redeemed: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  organization_id: string | null;
  order_type: OrderType;
  status: OrderStatus;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number: string | null;
  tracking_carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  card_color: CardColor;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  monthly_price_inr: number;
  yearly_price_inr: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  feature_flags: Record<string, boolean | number | string>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  plan_id: string;
  provider: PaymentProvider;
  provider_customer_id: string;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  seats: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  subscription_id: string;
  user_id: string | null;
  organization_id: string | null;
  tier: PlanTier;
  feature_flags: Record<string, boolean | number | string>;
  status: SubscriptionStatus;
  current_period_end: string;
  seats: number;
}

export interface Lead {
  id: string;
  profile_id: string;
  organization_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  custom_fields: Record<string, string>;
  source: AnalyticsSource;
  status: LeadStatus;
  contact_hash: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: number;
  profile_id: string;
  organization_id: string | null;
  event_type: AnalyticsEventType;
  source: AnalyticsSource;
  referrer: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown' | null;
  country: string | null;
  city: string | null;
  occurred_at: string;
}

export interface AnalyticsDailyRollup {
  id: string;
  profile_id: string;
  organization_id: string | null;
  rollup_date: string;
  profile_views: number;
  nfc_taps: number;
  qr_scans: number;
  vcf_downloads: number;
  leads_captured: number;
  top_source: AnalyticsSource | null;
  top_country: string | null;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  layout_variant: 'classic' | 'minimal' | 'bold' | 'card_stack';
  tokens: {
    bg: string;
    fg: string;
    accent: string;
    font: string;
  };
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_new_lead: boolean;
  email_order_updates: boolean;
  email_billing: boolean;
  email_product_updates: boolean;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface CustomDomain {
  id: string;
  organization_id: string;
  domain: string;
  verification_token: string;
  verified_at: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_by: string | null;
  created_at: string;
}

/**
 * Supabase-generated `Database` type shape, trimmed to what the app
 * actually queries. Used as the generic parameter to createClient<Database>.
 */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      social_links: { Row: SocialLink; Insert: Partial<SocialLink>; Update: Partial<SocialLink> };
      gallery_items: { Row: GalleryItem; Insert: Partial<GalleryItem>; Update: Partial<GalleryItem> };
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      departments: { Row: Department; Insert: Partial<Department>; Update: Partial<Department> };
      org_members: { Row: OrgMember; Insert: Partial<OrgMember>; Update: Partial<OrgMember> };
      employees: { Row: Employee; Insert: Partial<Employee>; Update: Partial<Employee> };
      manufacturing_batches: {
        Row: ManufacturingBatch;
        Insert: Partial<ManufacturingBatch>;
        Update: Partial<ManufacturingBatch>;
      };
      cards: { Row: Card; Insert: Partial<Card>; Update: Partial<Card> };
      coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      plans: { Row: Plan; Insert: Partial<Plan>; Update: Partial<Plan> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> };
      leads: { Row: Lead; Insert: Partial<Lead>; Update: Partial<Lead> };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Partial<AnalyticsEvent>;
        Update: Partial<AnalyticsEvent>;
      };
      analytics_daily_rollups: {
        Row: AnalyticsDailyRollup;
        Insert: Partial<AnalyticsDailyRollup>;
        Update: Partial<AnalyticsDailyRollup>;
      };
      themes: { Row: Theme; Insert: Partial<Theme>; Update: Partial<Theme> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Partial<NotificationPreferences>;
        Update: Partial<NotificationPreferences>;
      };
      audit_log: { Row: AuditLogEntry; Insert: Partial<AuditLogEntry>; Update: never };
      custom_domains: { Row: CustomDomain; Insert: Partial<CustomDomain>; Update: Partial<CustomDomain> };
      api_keys: { Row: ApiKey; Insert: Partial<ApiKey>; Update: Partial<ApiKey> };
    };
    Views: {
      entitlements: { Row: Entitlement };
    };
    Functions: {
      activate_card: { Args: { p_activation_token: string; p_user_id: string }; Returns: Card };
      freeze_card: { Args: { p_card_id: string; p_reason: string }; Returns: Card };
      get_card_by_token: {
        Args: { p_activation_token: string };
        Returns: { id: string; status: CardStatus; color: CardColor; bound_profile_slug: string | null }[];
      };
      record_analytics_event: {
        Args: {
          p_profile_id: string;
          p_event_type: AnalyticsEventType;
          p_source: AnalyticsSource;
          p_referrer: string | null;
          p_device_type: string | null;
          p_country: string | null;
          p_city: string | null;
        };
        Returns: void;
      };
      is_org_member: { Args: { p_org_id: string }; Returns: boolean };
      has_org_role: { Args: { p_org_id: string; p_roles: OrgRole[] }; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
