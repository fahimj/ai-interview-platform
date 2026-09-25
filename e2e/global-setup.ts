import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup() {
  console.log('[E2E Global Setup] Seeding test database via rails db:seed:e2e...');
  const apiDir = path.resolve(__dirname, '../api');
  execSync('RAILS_ENV=test bundle exec rails db:seed:e2e', {
    cwd: apiDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      RAILS_ENV: 'test',
    },
  });
  console.log('[E2E Global Setup] Database seeded successfully.');
}

export default globalSetup;
