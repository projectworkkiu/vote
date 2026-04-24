import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy.neon.tech/dummy';

console.log('Database connecting to:', connectionString.replace(/:([^:@]+)@/, ':****@'));
export const pool = new Pool({ connectionString });

export default pool;