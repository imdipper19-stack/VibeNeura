import { prisma } from '@/lib/prisma/client';

export async function logAudit(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { adminId, action, targetType, targetId, details: details ? JSON.parse(JSON.stringify(details)) : undefined },
  });
}
