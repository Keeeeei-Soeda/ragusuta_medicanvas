# 🔧 SSH鍵ファイルの修正手順

## 📋 現在の問題

- `authorized_keys`ファイルに重複したエントリがある
- 不正なコマンド実行によりファイルが破損している可能性がある
- SSH接続がまだ失敗している

## 🚀 修正手順

### ステップ1: authorized_keysファイルをクリーンアップ

シリアルコンソールで以下を実行してください：

```bash
# 1. 現在のauthorized_keysファイルをバックアップ
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup

# 2. authorized_keysファイルを削除
rm ~/.ssh/authorized_keys

# 3. 新しいauthorized_keysファイルを作成（正しい公開鍵のみ）
cat > ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINhnEbpFNtFbL4DKo8F8YLozl4mguFzUJ+zKK2Pra/Gm soedakei@soedakeinoMacBook-Air.local
EOF

# 4. 権限を設定
chmod 600 ~/.ssh/authorized_keys

# 5. 確認（1行のみ表示されるはず）
cat ~/.ssh/authorized_keys
```

### ステップ2: SSH設定の確認

```bash
# SSH設定ファイルの確認
sudo cat /etc/ssh/sshd_config | grep -E "PubkeyAuthentication|AuthorizedKeysFile|PasswordAuthentication"

# 必要に応じてSSH設定を確認・修正
sudo nano /etc/ssh/sshd_config
# 以下の設定を確認：
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
# PasswordAuthentication no（セキュリティのため）

# SSHサービスを再起動（設定を変更した場合）
sudo systemctl restart sshd
```

### ステップ3: 権限の確認

```bash
# ディレクトリとファイルの権限を確認
ls -la ~/.ssh/

# 正しい権限：
# drwx------ (700) .ssh ディレクトリ
# -rw------- (600) authorized_keys
```

### ステップ4: ローカルマシンで接続テスト

ローカルマシン（Mac）で以下を実行：

```bash
# SSH接続をテスト
ssh -v root@162.43.8.168
```

`-v`オプションで詳細なログが表示され、問題の原因を特定できます。

## 🔍 トラブルシューティング

### まだ接続できない場合

1. **SSHデーモンのログを確認**
   ```bash
   # サーバー側で実行
   sudo tail -f /var/log/auth.log
   # または
   sudo journalctl -u ssh -f
   ```

2. **ローカルマシンでSSH鍵を確認**
   ```bash
   # ローカルマシンで実行
   ssh-add -l
   # 鍵が表示されない場合
   ssh-add ~/.ssh/id_ed25519
   ```

3. **SSH設定ファイルの確認**
   ```bash
   # ローカルマシンで実行
   cat ~/.ssh/config | grep -A 10 "162.43.8.168\|yaku-navi"
   ```

4. **詳細ログで接続を試す**
   ```bash
   # ローカルマシンで実行
   ssh -vvv root@162.43.8.168
   ```



