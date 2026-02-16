# 🔌 Cursor経由でリモートサーバーに接続する方法

## 📋 前提条件

- Cursorがインストールされていること
- SSH接続が設定されていること（既に設定済み）

## 🚀 接続手順

### 方法1: CursorのRemote SSH機能を使用（推奨）

#### 1. Remote SSH拡張機能の確認

CursorはVS Codeベースなので、Remote SSH機能が標準で利用可能です。

#### 2. SSH接続の設定確認

既にSSH設定ファイル（`~/.ssh/config`）に以下の設定があります：

```
Host 162.43.8.168
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts
```

#### 3. Cursorで接続する手順

1. **コマンドパレットを開く**
   - `Cmd + Shift + P` (macOS) または `Ctrl + Shift + P` (Windows/Linux)

2. **Remote SSH接続を選択**
   - 「Remote-SSH: Connect to Host...」と入力して選択

3. **接続先を選択**
   - `162.43.8.168` または `root@162.43.8.168` を選択
   - または、SSH設定ファイルに定義されたホスト名を選択

4. **新しいウィンドウで接続**
   - 新しいCursorウィンドウが開き、サーバーに接続されます

5. **リモートフォルダーを開く**
   - 「File」→「Open Folder...」を選択
   - `/var/www/healthconnect` などのリモートディレクトリを選択

### 方法2: SSH設定ファイルにエイリアスを追加

より簡単に接続するために、SSH設定ファイルにエイリアスを追加できます：

```bash
# ~/.ssh/config に追加
Host pharmacy-platform
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts
```

これで、CursorのRemote SSH接続時に「pharmacy-platform」という名前で接続できます。

## 🔧 トラブルシューティング

### SSH鍵認証が失敗する場合

シリアルコンソールで接続できている場合、SSH鍵がサーバーに登録されていない可能性があります。

#### 解決方法1: SSH公開鍵をサーバーに登録

```bash
# ローカルマシンで公開鍵を表示
cat ~/.ssh/id_ed25519.pub

# シリアルコンソールでサーバーに接続し、以下を実行
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ここに公開鍵の内容を貼り付け" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 解決方法2: パスワード認証を一時的に有効化（開発環境のみ）

SSH設定ファイルに以下を追加：

```
Host 162.43.8.168
    HostName 162.43.8.168
    User root
    PreferredAuthentications password
    PubkeyAuthentication no
```

**注意**: 本番環境ではパスワード認証は無効化することを推奨します。

### 接続できない場合

1. **SSH接続の確認**
   ```bash
   ssh root@162.43.8.168
   ```
   ターミナルから直接接続できるか確認してください。

2. **SSH鍵の確認**
   ```bash
   ls -la ~/.ssh/id_ed25519*
   ```
   SSH鍵が存在するか確認してください。

3. **権限の確認**
   ```bash
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/config
   ```

### Cursorで接続できない場合

1. **Cursorの再起動**
   - Cursorを完全に終了して再起動してください

2. **Remote SSH拡張機能の確認**
   - Cursorの拡張機能で「Remote - SSH」が有効になっているか確認

3. **ログの確認**
   - Cursorの出力パネル（`Cmd + Shift + U`）でエラーログを確認

## 📝 便利な設定

### リモートサーバーで作業する際の推奨設定

1. **リモート拡張機能のインストール**
   - リモートサーバーに接続後、必要な拡張機能をインストール
   - TypeScript、ESLint、Prettierなど

2. **ターミナルの設定**
   - リモートサーバーに接続後、統合ターミナル（`` Ctrl + ` ``）を使用可能

3. **ファイル同期**
   - リモートサーバーで直接編集できるため、ファイル同期は不要

## 🎯 使用例

### リモートサーバーで開発する場合

1. Cursorで `162.43.8.168` に接続
2. `/var/www/healthconnect` フォルダーを開く
3. リモートサーバー上で直接コードを編集
4. ターミナルで `npm run dev` などを実行

### ローカルとリモートの両方で作業する場合

- **ローカル**: 開発・テスト
- **リモート**: 本番環境の確認・デバッグ

Cursorの複数ウィンドウ機能を使って、ローカルとリモートを同時に開くことができます。

## 🔐 セキュリティ注意事項

- SSH鍵の管理を適切に行ってください
- 本番環境では、rootユーザーでの直接接続を避け、専用ユーザーを作成することを推奨します
- ファイアウォール設定を確認してください

