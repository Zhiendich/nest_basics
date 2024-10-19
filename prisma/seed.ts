import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      name: 'Alice',
      password: bcrypt.hashSync('alicepassword', 6),
    },
  });
  await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
      password: bcrypt.hashSync('bobpassword', 6),
    },
  });
  await prisma.user.upsert({
    where: { email: 'burah@prisma.io' },
    update: {},
    create: {
      email: 'burah@prisma.io',
      name: 'Burah',
      password: bcrypt.hashSync('burahpassword', 6),
      roles: ['admin', 'user'],
    },
  });
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
