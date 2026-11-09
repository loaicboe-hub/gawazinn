import { describe, expect, it } from 'vitest';
import {
  createFinancingSchema,
  createOrderSchema,
  createSupportCaseSchema,
  normalizeEgyptianPhone,
  registerSchema,
} from '../../shared/schemas';
import { estimateFinishingRange, maskNationalId } from '../../shared/catalogMeta';
import {
  ADMIN_PANEL_ROLES,
  CMS_EDITOR_ROLES,
  FULL_ADMIN_ROLES,
  MODERATION_ROLES,
  hasAnyRole,
  isStaffRole,
} from '../../shared/rbac';

describe('Egyptian Phone & Zod Schema Validation', () => {
  it('normalizes +2010... and whitespace-padded mobile numbers cleanly', () => {
    expect(normalizeEgyptianPhone('+20 101 234 5678')).toBe('01012345678');
    expect(normalizeEgyptianPhone('0112-345-6789')).toBe('01123456789');
  });

  it('validates registration payload and rejects invalid Egyptian phone numbers', () => {
    const valid = registerSchema.safeParse({
      name: 'أحمد محمود',
      email: 'Ahmed@Example.com ',
      phone: '+201098765432',
      password: 'StrongPassword123',
      city: 'Cairo',
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe('ahmed@example.com');
      expect(valid.data.phone).toBe('01098765432');
    }

    const badPhone = registerSchema.safeParse({
      name: 'Ahmed',
      email: 'ahmed@example.com',
      phone: '05512345678',
      password: 'StrongPassword123',
    });
    expect(badPhone.success).toBe(false);
  });

  it('enforces exact 14-digit Egyptian National ID in financing & support schemas', () => {
    const badFinance = createFinancingSchema.safeParse({
      customerName: 'كريم شريف',
      phone: '01012345678',
      nationalId: '2980101',
      monthlyIncome: 15000,
      employer: 'شركة النيل',
      governorate: 'Cairo',
      requestedAmount: 100000,
      tenureMonths: 24,
      preferredProvider: 'ValU',
      associatedSection: 'finishing',
    });
    expect(badFinance.success).toBe(false);

    const goodSupport = createSupportCaseSchema.safeParse({
      applicantName: 'حالة مستحقة',
      nationalId: '29805120104567',
      phone: '01123456789',
      governorate: 'Gharbia',
      address: 'شارع الجلاء — طنطا — الغربية',
      category: 'appliances_furniture',
      caseDescription: 'طلب دعم عيني لتجهيز الأجهزة الكهربائية الأساسية للمنزل.',
      urgencyLevel: 'urgent',
    });
    expect(goodSupport.success).toBe(true);
  });

  it('rejects empty carts on order creation', () => {
    const emptyOrder = createOrderSchema.safeParse({
      customerName: 'عميل',
      phone: '01012345678',
      address: 'مدينة نصر القاهرة',
      city: 'Cairo',
      paymentMethod: 'cash_on_delivery',
      items: [],
    });
    expect(emptyOrder.success).toBe(false);
  });
});

describe('National ID Masking & Finishing Cost Estimator', () => {
  it('masks 14-digit Egyptian National IDs preserving only prefix/suffix', () => {
    expect(maskNationalId('29805120104567')).toBe('298********567');
    expect(maskNationalId('')).toBe('—');
  });

  it('calculates proportional finishing cost ranges across tiers', () => {
    const eco = estimateFinishingRange(120, 'economic');
    const med = estimateFinishingRange(120, 'medium');
    const lux = estimateFinishingRange(120, 'luxury');
    expect(eco.min).toBeLessThan(eco.max);
    expect(eco.max).toBeLessThan(med.max);
    expect(med.max).toBeLessThan(lux.max);
  });
});

describe('Role-Based Access Control Helpers', () => {
  it('enforces separation between customer, vendor, moderator, editor, and admin roles', () => {
    expect(isStaffRole('customer')).toBe(false);
    expect(isStaffRole('vendor')).toBe(false);
    expect(isStaffRole('expert')).toBe(false);
    expect(isStaffRole('moderator')).toBe(true);
    expect(isStaffRole('editor')).toBe(true);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('super_admin')).toBe(true);

    expect(hasAnyRole('moderator', ADMIN_PANEL_ROLES)).toBe(true);
    expect(hasAnyRole('moderator', FULL_ADMIN_ROLES)).toBe(false);
    expect(hasAnyRole('moderator', MODERATION_ROLES)).toBe(true);
    expect(hasAnyRole('editor', CMS_EDITOR_ROLES)).toBe(true);
    expect(hasAnyRole('editor', MODERATION_ROLES)).toBe(false);
  });
});

