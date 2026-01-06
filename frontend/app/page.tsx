'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 開発モードでは認証をスキップしてホーム画面へ
    router.push('/home');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  );
}

