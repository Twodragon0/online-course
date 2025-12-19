/**
 * 사용자를 Pro로 업그레이드하는 스크립트
 * 
 * 사용법:
 *   npx tsx scripts/upgrade-user-to-pro.ts <email>
 *   또는
 *   ts-node --esm scripts/upgrade-user-to-pro.ts <email>
 * 
 * 예시:
 *   npx tsx scripts/upgrade-user-to-pro.ts twodragon114@gmail.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upgradeUserToPro(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`사용자 ${normalizedEmail}을(를) Pro로 업그레이드하는 중...`);

    // 사용자 찾기 또는 생성
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // 사용자가 없으면 생성
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          subscriptionStatus: 'active',
        },
      });
      console.log(`✅ 새 사용자 생성 완료: ${normalizedEmail}`);
    } else {
      // 사용자가 있으면 Pro로 업그레이드
      user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          subscriptionStatus: 'active',
        },
      });
      console.log(`✅ 사용자 업그레이드 완료: ${normalizedEmail}`);
    }

    // Subscription 레코드도 생성/업데이트
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'active',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        status: 'active',
      },
    });

    console.log(`✅ Subscription 레코드 생성/업데이트 완료`);
    console.log(`\n📊 사용자 정보:`);
    console.log(`   이메일: ${user.email}`);
    console.log(`   구독 상태: ${user.subscriptionStatus}`);
    console.log(`   사용자 ID: ${user.id}`);

    return user;
  } catch (error) {
    console.error('❌ 오류 발생:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
const email = process.argv[2];

if (!email) {
  console.error('❌ 사용법: ts-node scripts/upgrade-user-to-pro.ts <email>');
  console.error('예시: ts-node scripts/upgrade-user-to-pro.ts twodragon114@gmail.com');
  process.exit(1);
}

upgradeUserToPro(email)
  .then(() => {
    console.log('\n✅ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 실패:', error);
    process.exit(1);
  });

