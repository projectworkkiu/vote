import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy.neon.tech/dummy';

export const pool = new Pool({ connectionString });

export default pool;