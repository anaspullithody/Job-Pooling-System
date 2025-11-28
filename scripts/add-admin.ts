import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: tsx scripts/add-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email,
      role: 'SUPER_ADMIN'
    }
  });

  console.log(`✅ User ${email} is now a SUPER_ADMIN`);
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
