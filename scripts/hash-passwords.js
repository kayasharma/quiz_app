// hash-passwords.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LBzHqgVQ0Si8@ep-fancy-grass-a1d5n7xr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function hashAndUpdateUsers() {
  const users = [
    { email: 'teacher@example.com', password: 'password123' },
    { email: 'student@example.com', password: 'password123' }
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      `UPDATE users SET password = $1 WHERE email = $2`,
      [hashed, user.email]
    );
    console.log(`✅ Password for ${user.email} updated.`);
  }

  await pool.end();
}

hashAndUpdateUsers().catch(console.error);
