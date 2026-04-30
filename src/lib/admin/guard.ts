import { auth } from '@/auth';

export async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export async function assertAdminApi() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
    return null;
  }
  return session;
}
