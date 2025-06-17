import type { Config } from 'drizzle-kit';

export default {
  schema: './replica-schema.ts',
  out: './replica-drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;