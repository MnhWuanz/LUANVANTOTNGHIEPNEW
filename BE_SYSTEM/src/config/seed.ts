import 'dotenv/config';
import { prisma } from './client';
import bcrypt from 'bcrypt';

async function main() {
  const SALT_ROUNDS = 10;
  const adminPassword = await bcrypt.hash('123456', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password_hash: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@gmail.com',
      password_hash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created or updated:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
