import { execFileSync } from 'node:child_process';

process.env.DATABASE_URL ||= 'file:./prisma/dev.db';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['prisma', 'db', 'push', '--schema=./prisma/schema.prisma'], {
  env: process.env,
  stdio: 'inherit'
});

await import('./seed.js');
await import('./index.js');
