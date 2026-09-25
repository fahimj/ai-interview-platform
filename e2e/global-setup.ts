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

  try {
    execSync('RAILS_ENV=development bundle exec rails db:seed:e2e', {
      cwd: apiDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        RAILS_ENV: 'development',
      },
    });
  } catch (e) {
    console.warn('[E2E Global Setup] Warning: could not seed development db:', e);
  }

  console.log('[E2E Global Setup] Databases seeded successfully.');
}

export default globalSetup;
