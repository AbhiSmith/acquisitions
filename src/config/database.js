import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// When using Neon Local (development), the Neon proxy exposes a local HTTP endpoint
// that the serverless driver can use. Detect Neon Local mode via environment
// variables and configure the serverless driver accordingly.
if (process.env.NEON_LOCAL === 'true' || process.env.NODE_ENV === 'development') {
  const host = process.env.NEON_LOCAL_HOST || 'neon-local';
  // Use HTTP fetch endpoint against the Neon Local container
  neonConfig.fetchEndpoint = `http://${host}:5432/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
