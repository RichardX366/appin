const { PrismaClient } = require('@prisma/client');
const { hashSync } = require('bcryptjs');
const { config } = require('dotenv');
config();

(async () => {
  const prisma = new PrismaClient();
  await prisma.$transaction(
    Object.keys(prisma).map((model) => {
      if (model[0] === '_' || model[0] === '$') {
        return prisma.user.findUnique({ where: { id: '' } });
      }
      return prisma[model].deleteMany();
    }),
  );
  console.log('Deleted all data');

  await prisma.user.create({
    data: {
      email: 'richardx366@gmail.com',
      password: hashSync(process.env.ADMIN_PASSWORD),
      name: 'Richard Xiong',
      bio: 'I am a software engineer',
      notifications: true,
      authLevel: 'ADMIN',
      gender: 'MALE',
      address: '1234 Main St',
      reasonForJoining: 'I want to help people',
      schoolCity: 'San Francisco',
      schoolName: 'San Francisco State University',
      talentsAndGoals: 'I am good at math',
      discord: 'discorder',
      joinedDiscord: true,
    },
  });
  console.log('Created user');
})();
