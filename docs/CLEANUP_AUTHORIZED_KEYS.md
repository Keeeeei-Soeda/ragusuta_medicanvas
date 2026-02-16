# 🧹 authorized_keysファイルのクリーンアップ手順

## 📋 現在の状況

- `.ssh` ディレクトリの権限: `drwx------` (700) ✅ 正しい
- `authorized_keys` ファイルの権限: `-rw-------` (600) ✅ 正しい
- SSH設定: デフォルトで公開鍵認証が有効 ✅
- `authorized_keys` ファイルのサイズ: 635バイト（重複エントリの可能性）

## 🚀 クリーンアップ手順

### ステップ1: 現在の内容を確認

シリアルコンソールで以下を実行：

```bash
# authorized_keysファイルの内容を確認
cat ~/.ssh/authorized_keys
```

### ステップ2: ファイルをクリーンアップ

正しい公開鍵のみを残すために、以下を実行：

```bash
# 1. バックアップを作成
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup

# 2. 新しいauthorized_keysファイルを作成（正しい公開鍵のみ）
cat > ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINhnEbpFNtFbL4DKo8F8YLozl4mguFzUJ+zKK2Pra/Gm soedakei@soedakeinoMacBook-Air.local
EOF

# 3. 権限を確認・設定
chmod 600 ~/.ssh/authorized_keys

# 4. 内容を確認（1行のみ表示されるはず）
cat ~/.ssh/authorized_keys
wc -l ~/.ssh/authorized_keys  # 行数が1であることを確認
```

### ステップ3: SSH接続をテスト

ローカルマシン（Mac）で以下を実行：

```bash
# SSH接続をテスト
ssh root@162.43.8.168

# または、詳細ログ付きでテスト
ssh -v root@162.43.8.168
```

### ステップ4: Cursorで接続

SSH接続が成功したら、Cursorで接続：

1. Cursorを開く
2. `Cmd + Shift + P` でコマンドパレット
3. 「Remote-SSH: Connect to Host...」を選択
4. `yaku-navi` または `root@162.43.8.168` を選択

## 🔍 トラブルシューティング

### まだ接続できない場合

1. **SSHデーモンのログを確認**
   ```bash
   # サーバー側で実行
   sudo tail -20 /var/log/auth.log
   # または
   sudo journalctl -u ssh -n 20
   ```

2. **SSH設定の詳細確認**
   ```bash
   # サーバー側で実行
   sudo sshd -T | grep -E "pubkey|authorized"
   ```

3. **SELinuxの確認（該当する場合）**
   ```bash
   # SELinuxが有効な場合
   getenforce
   # Enforcing の場合は以下を実行
   restorecon -R ~/.ssh
   ```

4. **ローカルマシンでSSH鍵を確認**
   ```bash
   # ローカルマシンで実行
   ssh-add -l
   # 鍵が表示されない場合
   ssh-add ~/.ssh/id_ed25519
   ```



