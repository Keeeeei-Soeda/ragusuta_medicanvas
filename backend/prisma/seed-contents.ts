import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding health contents...');

  // 健康コンテンツデータ
  const contents = [
    // 動画コンテンツ
    {
      title: '5分でできる！オフィスストレッチ',
      description: 'デスクワーク中の肩こりや腰痛を軽減するための簡単なストレッチ方法を紹介します。',
      type: 'VIDEO',
      category: 'PHYSICAL',
      contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://via.placeholder.com/640x360/9333EA/FFFFFF?text=Office+Stretch',
      duration: 300,
      tags: ['ストレッチ', '肩こり', '腰痛', 'オフィス'],
      isPublic: true,
    },
    {
      title: 'マインドフルネス瞑想入門',
      description: '初心者向けのマインドフルネス瞑想の方法を解説。ストレス軽減に効果的です。',
      type: 'VIDEO',
      category: 'MENTAL',
      contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://via.placeholder.com/640x360/10B981/FFFFFF?text=Meditation',
      duration: 600,
      tags: ['瞑想', 'ストレス', 'メンタルヘルス'],
      isPublic: true,
    },
    {
      title: '親子で楽しむ運動遊び',
      description: '家族で楽しみながら体を動かせる運動遊びを紹介します。',
      type: 'VIDEO',
      category: 'FAMILY',
      contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://via.placeholder.com/640x360/F59E0B/FFFFFF?text=Family+Exercise',
      duration: 900,
      tags: ['親子', '運動', '家族'],
      isPublic: true,
    },
    {
      title: '正しい姿勢の作り方',
      description: 'デスクワークでの正しい姿勢と、姿勢改善エクササイズを紹介します。',
      type: 'VIDEO',
      category: 'PHYSICAL',
      contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://via.placeholder.com/640x360/9333EA/FFFFFF?text=Posture',
      duration: 480,
      tags: ['姿勢', '腰痛予防', 'デスクワーク'],
      isPublic: true,
    },

    // 記事コンテンツ
    {
      title: '睡眠の質を高める5つの習慣',
      description: '良質な睡眠を得るための科学的に証明された方法をご紹介します。',
      type: 'ARTICLE',
      category: 'LIFESTYLE',
      contentUrl: '#', // 記事本文はdescriptionに含まれる想定
      thumbnailUrl: 'https://via.placeholder.com/640x360/3B82F6/FFFFFF?text=Sleep+Quality',
      tags: ['睡眠', '生活習慣', '健康'],
      isPublic: true,
    },
    {
      title: 'ストレスマネジメント完全ガイド',
      description: '現代社会のストレスに対処するための実践的なテクニックを解説します。ストレスの兆候、効果的な対処法、専門家のサポートについて詳しく説明します。',
      type: 'ARTICLE',
      category: 'MENTAL',
      contentUrl: '#',
      thumbnailUrl: 'https://via.placeholder.com/640x360/10B981/FFFFFF?text=Stress+Management',
      tags: ['ストレス', 'メンタルヘルス', '対処法'],
      isPublic: true,
    },
    {
      title: '栄養バランスの取れた食事の基本',
      description: '健康的な食生活のための栄養学の基礎知識をわかりやすく解説します。5大栄養素のバランス、理想的な食事の比率、実践のポイントをご紹介します。',
      type: 'ARTICLE',
      category: 'LIFESTYLE',
      contentUrl: '#',
      thumbnailUrl: 'https://via.placeholder.com/640x360/EF4444/FFFFFF?text=Nutrition',
      tags: ['栄養', '食事', '健康'],
      isPublic: true,
    },
    {
      title: '高齢者のための転倒予防運動',
      description: '転倒リスクを減らし、自立した生活を維持するための簡単な運動を紹介します。',
      type: 'ARTICLE',
      category: 'SENIOR',
      contentUrl: '#',
      thumbnailUrl: 'https://via.placeholder.com/640x360/F59E0B/FFFFFF?text=Fall+Prevention',
      tags: ['高齢者', '転倒予防', '運動'],
      isPublic: true,
    },

    // PDFコンテンツ
    {
      title: '健康チェックリスト（PDF）',
      description: '日々の健康状態をセルフチェックできるPDFチェックリストです。ダウンロードして印刷してご利用ください。',
      type: 'PDF',
      category: 'PHYSICAL',
      contentUrl: 'https://example.com/health-checklist.pdf',
      thumbnailUrl: 'https://via.placeholder.com/640x360/9333EA/FFFFFF?text=Health+Checklist',
      tags: ['チェックリスト', 'セルフケア', 'PDF'],
      isPublic: true,
    },
    {
      title: 'ストレス対処法ワークシート（PDF）',
      description: '自分に合ったストレス対処法を見つけるためのワークシートです。',
      type: 'PDF',
      category: 'MENTAL',
      contentUrl: 'https://example.com/stress-worksheet.pdf',
      thumbnailUrl: 'https://via.placeholder.com/640x360/10B981/FFFFFF?text=Stress+Worksheet',
      tags: ['ワークシート', 'ストレス', 'セルフケア', 'PDF'],
      isPublic: true,
    },
    {
      title: '食事記録シート（PDF）',
      description: '毎日の食事を記録して、食生活を振り返るためのシートです。',
      type: 'PDF',
      category: 'LIFESTYLE',
      contentUrl: 'https://example.com/food-diary.pdf',
      thumbnailUrl: 'https://via.placeholder.com/640x360/EF4444/FFFFFF?text=Food+Diary',
      tags: ['食事記録', '栄養管理', 'PDF'],
      isPublic: true,
    },
  ];

  // コンテンツを作成
  for (const content of contents) {
    await prisma.healthContent.create({
      data: {
        ...content,
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ Created ${contents.length} health contents`);
  console.log('   - Videos: ' + contents.filter(c => c.type === 'VIDEO').length);
  console.log('   - Articles: ' + contents.filter(c => c.type === 'ARTICLE').length);
  console.log('   - PDFs: ' + contents.filter(c => c.type === 'PDF').length);
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
