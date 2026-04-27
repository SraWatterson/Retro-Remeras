import { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type AuditLogInput = {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog({ action, entity, entityId, actorId, metadata }: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId || null,
        actorId: actorId || null,
        metadata: metadata ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[AUDIT_LOG] No se pudo registrar ${action} sobre ${entity}:${entityId || 'sin-id'} - ${message}`);
  }
}
