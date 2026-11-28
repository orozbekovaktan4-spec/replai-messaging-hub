// Set a new password for an existing row in the "Admin" table.
// Run it yourself: node scripts/set-admin-password.js admin@replai.com
// The password is typed hidden and never printed; DATABASE_URL comes from your environment/.env.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin-password.js <admin-email>');
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    stdin.on('data', function onData(ch) {
      if (ch === '\r' || ch === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(value);
      } else if (ch === '\u0003') {
        process.exit(130);
      } else if (ch === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    });
  });
}

const password = await askHidden('New admin password (min 12 chars): ');
if (password.length < 12) {
  console.error('Too short. Use at least 12 characters.');
  process.exit(1);
}
if (password !== await askHidden('Repeat it: ')) {
  console.error('Passwords do not match.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'UPDATE "Admin" SET password = $1, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($2)',
    [hash, email]
  );
  console.log(result.rowCount ? `Password updated for ${email}.` : `No admin found with email ${email}.`);
} finally {
  await pool.end();
}
