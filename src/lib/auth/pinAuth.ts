export type StaffRole = 'Owner' | 'Manager' | 'Cashier' | 'Captain' | 'Kitchen Staff';

export interface StaffPermissions {
  canApplyDiscount: boolean;
  canVoidBill: boolean;
  canReprintKOT: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canEditInventory: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
  Owner: {
    canApplyDiscount: true,
    canVoidBill: true,
    canReprintKOT: true,
    canViewReports: true,
    canManageSettings: true,
    canEditInventory: true,
  },
  Manager: {
    canApplyDiscount: true,
    canVoidBill: true,
    canReprintKOT: true,
    canViewReports: true,
    canManageSettings: false,
    canEditInventory: true,
  },
  Cashier: {
    canApplyDiscount: false, // requires manager PIN override for > ₹500
    canVoidBill: false,
    canReprintKOT: true,
    canViewReports: false,
    canManageSettings: false,
    canEditInventory: false,
  },
  Captain: {
    canApplyDiscount: false,
    canVoidBill: false,
    canReprintKOT: true,
    canViewReports: false,
    canManageSettings: false,
    canEditInventory: false,
  },
  'Kitchen Staff': {
    canApplyDiscount: false,
    canVoidBill: false,
    canReprintKOT: true,
    canViewReports: false,
    canManageSettings: false,
    canEditInventory: false,
  },
};

export function getPermissionsForRole(role: StaffRole): StaffPermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['Cashier'];
}
