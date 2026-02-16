/**
 * うちあけDB（Google Sheets）連携サービス
 * Phase 2で実装予定
 */

import { google } from 'googleapis';

interface UchiakeExperience {
  id: string;
  age: number;
  gender: string;
  jobType: string;
  category: string;
  subcategory?: string;
  targetPerson: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  viewCount: number;
  helpfulCount: number;
  source: 'UCHIAKE';
}

/**
 * Google Sheets APIから体験談データを取得
 */
export async function fetchUchiakeExperiences(): Promise<UchiakeExperience[]> {
  try {
    // 環境変数から認証情報を取得
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetId = process.env.UCHIAKE_SHEET_ID;

    if (!serviceAccountKey || !sheetId) {
      console.warn('⚠️  Google Sheets API credentials not configured. Using mock data.');
      return [];
    }

    // Google Sheets API認証
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // スプレッドシートからデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'データ!A2:O', // 2行目以降（ヘッダーを除く）
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // 行データをオブジェクトに変換
    return rows.map((row) => ({
      id: row[0] || '',
      age: parseInt(row[1] || '0'),
      gender: row[2] || 'MALE',
      jobType: row[3] || 'OFFICE',
      category: row[4] || 'PHYSICAL',
      subcategory: row[5] || undefined,
      targetPerson: row[6] || 'SELF',
      title: row[7] || '',
      content: row[8] || '',
      tags: row[9]?.split(',').map((t) => t.trim()) || [],
      createdAt: row[10] ? new Date(row[10]) : new Date(),
      viewCount: parseInt(row[11] || '0'),
      helpfulCount: parseInt(row[12] || '0'),
      source: 'UCHIAKE' as const,
    }));
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    return [];
  }
}

/**
 * キャッシュ機能付きで体験談を取得
 * 1時間キャッシュ
 */
let cachedExperiences: UchiakeExperience[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

export async function getUchiakeExperiences(): Promise<UchiakeExperience[]> {
  const now = Date.now();

  // キャッシュが有効な場合は返す
  if (cachedExperiences && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
    return cachedExperiences;
  }

  // キャッシュが無効な場合は再取得
  cachedExperiences = await fetchUchiakeExperiences();
  lastFetchTime = now;

  return cachedExperiences;
}

/**
 * キャッシュをクリア
 */
export function clearUchiakeCache(): void {
  cachedExperiences = null;
  lastFetchTime = null;
}

