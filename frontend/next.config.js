/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 👈 この行を追加
  images: {
    unoptimized: true  // 👈 この行を追加
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
```

4. **コミット**: 「Add static export configuration」などのメッセージで保存

---

### Step 2: Cloudflare Pagesのビルド設定を変更

1. **Cloudflare Dashboardにアクセス**
   - https://dash.cloudflare.com/

2. **Pages → ragusuta_medicanvas → Settings → Builds & deployments**

3. **Build configurationsを編集**:
```
Framework preset: Next.js
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/out
Root directory: / (変更なし)
```

4. **Environment variablesを設定（必要に応じて）**:
```
NEXT_PUBLIC_API_URL = https://your-backend-url.com
