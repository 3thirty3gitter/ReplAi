import type { Config } from 'drizzle-kit';

export default {
  schema: './replica-schema.ts',
  out: './replica-drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;