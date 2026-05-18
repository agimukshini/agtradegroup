import { AuthRequest } from '../middleware/auth';

type OrderOwner = { userId: string | null };

export function isStaffRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'STAFF';
}

/** Customers may only access their own orders; staff may access any. */
export function canAccessOrder(order: OrderOwner, req: AuthRequest): boolean {
  if (!req.user) return false;
  if (isStaffRole(req.user.role)) return true;
  return Boolean(order.userId && order.userId === req.user.id);
}
