import type { UserRole } from './types';

export const ADMIN_PANEL_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'editor',
  'moderator',
];

export const FULL_ADMIN_ROLES: readonly UserRole[] = ['super_admin', 'admin'];

export const CMS_EDITOR_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'editor',
];

export const MODERATION_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'moderator',
];

export function hasAnyRole(
  userRole: UserRole | undefined | null,
  allowedRoles: readonly UserRole[],
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function isStaffRole(role: UserRole | undefined | null): boolean {
  return hasAnyRole(role, ADMIN_PANEL_ROLES);
}

export function getRoleLabel(role: UserRole, language: 'ar' | 'en'): string {
  const labels: Record<UserRole, { ar: string; en: string }> = {
    customer: { ar: 'عميل موحد', en: 'Customer' },
    vendor: { ar: 'تاجر / مقدم خدمة', en: 'Vendor Partner' },
    expert: { ar: 'خبير معتمد', en: 'Verified Expert' },
    moderator: { ar: 'مشرف مجتمع', en: 'Community Moderator' },
    editor: { ar: 'محرر محتوى', en: 'Content Editor' },
    admin: { ar: 'مدير العمليات', en: 'Platform Admin' },
    super_admin: { ar: 'المدير التنفيذي', en: 'Super Admin' },
  };
  return labels[role]?.[language] || role;
}

