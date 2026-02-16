import Sidebar from '@/components/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー（オプション） */}
        <header className="border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center px-8">
            <h1 className="text-lg font-semibold text-gray-900">
              {/* ページタイトルは各ページで表示 */}
            </h1>
          </div>
        </header>

        {/* スクロール可能なコンテンツエリア */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}






