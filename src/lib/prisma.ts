import { Prisma, PrismaClient } from '@prisma/client';

const CONNECT_TIMEOUT_SECONDS = 15;
const RETRY_DELAYS_MS = [200, 600];

const READ_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  '$queryRaw',
  '$queryRawUnsafe',
]);

// Neon suspends idle compute; waking it can exceed Prisma's 5s default connect timeout.
function withConnectTimeout(url: string | undefined) {
  if (!url || /[?&]connect_timeout=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}connect_timeout=${CONNECT_TIMEOUT_SECONDS}`;
}

// P1017 can arrive after a query was sent, so only reads are retried; P1001/init errors mean no connection was made.
function isTransientConnectionError(error: unknown, operation: string) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  const code = (error as { code?: string } | null)?.code;
  if (code === 'P1001') return true;
  return code === 'P1017' && READ_OPERATIONS.has(operation);
}

function createPrismaClient() {
  const client = new PrismaClient({
    datasourceUrl: withConnectTimeout(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // The engine's pool keeps handing out a connection the server has closed (P1017), so drop the pool; the next query reconnects.
  let resetting: Promise<void> | null = null;
  const resetPool = () =>
    (resetting ??= client
      .$disconnect()
      .catch(() => {})
      .finally(() => {
        resetting = null;
      }));

  return client.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        // A single network reset can drop several pooled connections at once, so allow more than one retry.
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if ((error as { code?: string } | null)?.code === 'P1017') await resetPool();
            const delay = RETRY_DELAYS_MS[attempt];
            if (delay === undefined || !isTransientConnectionError(error, operation)) throw error;
            console.warn(`Retrying ${operation} after transient database connection error`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
