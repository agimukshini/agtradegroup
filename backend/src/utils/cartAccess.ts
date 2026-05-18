import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export function getSessionId(req: AuthRequest): string {
  return (req.headers['x-session-id'] as string) || req.ip || 'anonymous';
}

export async function findCartItemForCaller(itemId: string, req: AuthRequest) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return null;

  const userId = req.user?.id;
  const sessionId = getSessionId(req);

  if (userId) {
    return item.userId === userId ? item : null;
  }

  return item.sessionId === sessionId && !item.userId ? item : null;
}
