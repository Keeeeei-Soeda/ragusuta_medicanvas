# 🔌 SSH接続ガイド - へるこねサーバー

このガイドでは、へるこねサーバー（XServer VPS）へのSSH接続方法を説明します。新しいマシンからも簡単に接続できるように、手順を詳しく記載しています。

## 📋 サーバー情報

- **IPアドレス**: `162.43.8.168`
- **ホスト名**: `x162-43-8-168.static.xvps.ne.jp`
- **ユーザー**: `root`
- **ポート**: `22` (SSH)
- **プロジェクトディレクトリ**: `/var/www/healthconnect`

## 🚀 初回セットアップ（新しいマシンから接続する場合）

### 自動セットアップ（推奨）

プロジェクトルートで自動セットアップスクリプトを実行：

```bash
chmod +x setup-ssh-connection.sh
./setup-ssh-connection.sh
```

このスクリプトは以下を自動化します：
- SSH鍵の生成（必要な場合）
- 公開鍵の表示
- SSH設定ファイルの作成・更新

### 手動セットアップ

#### ステップ1: SSH鍵の生成

新しいマシンでSSH鍵を生成します（既に鍵がある場合はスキップ）。

```bash
# ED25519鍵を生成（推奨）
ssh-keygen -t ed25519 -C "your-email@example.com"

# または RSA鍵を生成（古いシステム用）
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

**注意**: パスフレーズを設定することを推奨します（セキュリティのため）。

### ステップ2: 公開鍵の確認

生成した公開鍵を確認します：

```bash
# ED25519鍵の場合
cat ~/.ssh/id_ed25519.pub

# RSA鍵の場合
cat ~/.ssh/id_rsa.pub
```

出力例：
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINhnEbpFNtFbL4DKo8F8YLozl4mguFzUJ+zKK2Pra/Gm your-email@example.com
```

この公開鍵をコピーしておきます。

### ステップ3: サーバーに公開鍵を登録

#### 方法A: シリアルコンソール経由（初回のみ）

XServer VPSのシリアルコンソールから接続し、以下を実行：

```bash
# 1. .sshディレクトリを作成
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. authorized_keysファイルに公開鍵を追加
# 以下のコマンドを実行し、公開鍵を貼り付けてEnterを押す
echo "ここに公開鍵の内容を貼り付け" >> ~/.ssh/authorized_keys

# 3. 権限を設定
chmod 600 ~/.ssh/authorized_keys

# 4. 確認
cat ~/.ssh/authorized_keys
```

#### 方法B: 既存のSSH接続経由

既にSSH接続できるマシンがある場合：

```bash
# 既存のマシンから接続
ssh root@162.43.8.168

# サーバー上で実行
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "新しい公開鍵の内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### ステップ4: SSH設定ファイルの作成

#### 方法A: テンプレートファイルを使用（推奨）

```bash
# プロジェクトルートから実行
cat docs/ssh-config-template >> ~/.ssh/config
chmod 600 ~/.ssh/config
```

#### 方法B: 手動で作成

ローカルマシンの `~/.ssh/config` ファイルを作成または編集します：

```bash
# 設定ファイルを開く（存在しない場合は作成される）
nano ~/.ssh/config
# または
vim ~/.ssh/config
```

以下の内容を追加：

```ssh-config
# へるこねサーバー（IPアドレス直接指定）
Host pharmacy-platform
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts

# へるこねサーバー（ホスト名指定）
Host pharmacy-platform-hostname
    HostName x162-43-8-168.static.xvps.ne.jp
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts

# 短縮エイリアス
Host 162
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts
```

**設定ファイルの権限を設定**：

```bash
chmod 600 ~/.ssh/config
```

### ステップ5: SSH接続のテスト

```bash
# 方法1: エイリアスを使用
ssh pharmacy-platform

# 方法2: 短縮エイリアスを使用
ssh 162

# 方法3: 直接接続
ssh root@162.43.8.168
```

パスワードなしで接続できれば成功です！

## 💻 Cursor経由で接続する方法

### 方法1: Remote SSH機能を使用（推奨）

1. **Cursorを開く**

2. **コマンドパレットを開く**
   - macOS: `Cmd + Shift + P`
   - Windows/Linux: `Ctrl + Shift + P`

3. **Remote SSH接続を選択**
   - 「Remote-SSH: Connect to Host...」と入力して選択

4. **接続先を選択**
   - `pharmacy-platform` または `162` を選択
   - または `root@162.43.8.168` を直接入力

5. **新しいウィンドウで接続**
   - 新しいCursorウィンドウが開き、サーバーに接続されます

6. **リモートフォルダーを開く**
   - 「File」→「Open Folder...」を選択
   - `/var/www/healthconnect` を入力して開く

### 方法2: SSH設定ファイルのエイリアスを使用

SSH設定ファイルにエイリアスを追加している場合、CursorのRemote SSH接続時にそのエイリアス名が表示されます。

**推奨エイリアス名**:
- `pharmacy-platform` - わかりやすい名前
- `162` - 短縮形

### 方法3: 接続後の作業

Cursorでリモートサーバーに接続後：

1. **統合ターミナルを使用**
   - `` Ctrl + ` `` でターミナルを開く
   - リモートサーバー上でコマンドを実行可能

2. **ファイルの編集**
   - リモートサーバー上のファイルを直接編集可能
   - 保存すると即座に反映

3. **拡張機能のインストール**
   - リモートサーバーに接続後、必要な拡張機能をインストール
   - TypeScript、ESLint、Prettierなど

## 🔧 トラブルシューティング

### 問題1: Permission denied (publickey)

**原因**: サーバーに公開鍵が登録されていない、または権限が正しくない

**解決方法**:

1. **公開鍵が正しく登録されているか確認**
   ```bash
   # サーバー上で実行
   cat ~/.ssh/authorized_keys
   ```

2. **権限を確認・修正**
   ```bash
   # サーバー上で実行
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **SSH鍵の権限を確認**
   ```bash
   # ローカルマシンで実行
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/config
   ```

### 問題2: Connection timed out

**原因**: ファイアウォールでポート22がブロックされている

**解決方法**:

1. **XServer VPSパネルで確認**
   - パケットフィルター設定でポート22（SSH）が許可されているか確認
   - 必要に応じて許可設定を追加

2. **サーバー側のファイアウォールを確認**
   ```bash
   # サーバー上で実行
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

### 問題3: Host key verification failed

**原因**: known_hostsファイルに古い鍵情報が残っている

**解決方法**:

```bash
# ローカルマシンで実行
ssh-keygen -R 162.43.8.168
```

### 問題4: Cursorで接続できない

**解決方法**:

1. **Cursorの再起動**
   - Cursorを完全に終了して再起動

2. **Remote SSH拡張機能の確認**
   - Cursorの拡張機能で「Remote - SSH」が有効になっているか確認

3. **ログの確認**
   - Cursorの出力パネル（`Cmd + Shift + U`）でエラーログを確認

4. **SSH接続の確認**
   - ターミナルから直接SSH接続できるか確認
   ```bash
   ssh pharmacy-platform
   ```

### 問題5: 複数のマシンから接続したい

**解決方法**:

各マシンの公開鍵をサーバーの `~/.ssh/authorized_keys` に追加：

```bash
# サーバー上で実行
# 各マシンの公開鍵を1行ずつ追加
echo "マシン1の公開鍵" >> ~/.ssh/authorized_keys
echo "マシン2の公開鍵" >> ~/.ssh/authorized_keys
```

## 📝 便利なコマンド

### SSH接続のショートカット

```bash
# エイリアスを使用した接続
ssh pharmacy-platform
ssh 162

# 接続後に特定のディレクトリに移動
ssh pharmacy-platform "cd /var/www/healthconnect && pwd"

# リモートコマンドの実行
ssh pharmacy-platform "pm2 status"
```

### ファイル転送

```bash
# SCPでファイルを転送
scp local-file.txt pharmacy-platform:/var/www/healthconnect/

# ディレクトリを転送
scp -r local-dir/ pharmacy-platform:/var/www/healthconnect/

# リモートからローカルにダウンロード
scp pharmacy-platform:/var/www/healthconnect/file.txt ./
```

### SSH接続の確認

```bash
# 接続テスト
ssh -v pharmacy-platform

# 接続情報の確認
ssh -T pharmacy-platform
```

## 🔐 セキュリティのベストプラクティス

1. **SSH鍵にパスフレーズを設定**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # パスフレーズを入力
   ```

2. **SSH鍵の管理**
   - 定期的に鍵をローテーション
   - 不要な鍵は削除

3. **rootユーザーでの直接接続を避ける（本番環境）**
   - 専用ユーザーを作成して使用
   - sudo権限を付与

4. **ファイアウォールの設定**
   - 必要最小限のポートのみ開放
   - IPアドレス制限を検討

5. **SSH設定の強化**
   ```bash
   # サーバー側の /etc/ssh/sshd_config を編集
   PermitRootLogin prohibit-password
   PasswordAuthentication no
   PubkeyAuthentication yes
   ```

## 📚 関連ドキュメント

- [デプロイメントガイド](./DEPLOYMENT.md) - サーバーへのデプロイ方法
- [Cursor Remote SSH](./CURSOR_REMOTE_SSH.md) - Cursor経由での接続詳細
- [SSH鍵設定手順](./SSH_SETUP_STEPS.md) - SSH鍵の設定手順

## 🎯 クイックリファレンス

### 接続コマンド

```bash
# 基本接続
ssh pharmacy-platform

# 短縮形
ssh 162

# 直接接続
ssh root@162.43.8.168
```

### プロジェクトディレクトリ

```bash
# 接続後に移動
cd /var/www/healthconnect

# または接続時に移動
ssh pharmacy-platform "cd /var/www/healthconnect && bash"
```

### PM2管理

```bash
# ステータス確認
ssh pharmacy-platform "cd /var/www/healthconnect && pm2 status"

# ログ確認
ssh pharmacy-platform "cd /var/www/healthconnect && pm2 logs"

# 再起動
ssh pharmacy-platform "cd /var/www/healthconnect && pm2 restart all"
```

---

**最終更新**: 2026-02-15  
**サーバー**: XServer VPS (162.43.8.168)  
**プロジェクト**: へるこね (HealthConnect)

