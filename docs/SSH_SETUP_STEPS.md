# 🔑 SSH鍵設定手順（シリアルコンソール経由）

## 📋 現在の状況

- シリアルコンソールでサーバーに接続済み
- SSH公開鍵認証が失敗している（Permission denied (publickey)）
- サーバーに公開鍵を登録する必要がある

## 🚀 手順

### ステップ1: ローカルマシンで公開鍵を確認

ローカルマシン（Mac）で以下を実行：

```bash
cat ~/.ssh/id_ed25519.pub
```

出力された公開鍵（`ssh-ed25519 AAAA...` で始まる文字列）をコピーしてください。

### ステップ2: シリアルコンソールでサーバーに公開鍵を登録

シリアルコンソールでサーバーに接続している状態で、以下を実行：

```bash
# 1. .sshディレクトリを作成（存在しない場合）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. authorized_keysファイルに公開鍵を追加
# 以下のコマンドを実行し、公開鍵を貼り付けてEnterを押す
# （公開鍵は1行で入力してください）
echo "ここに公開鍵を貼り付け" >> ~/.ssh/authorized_keys

# 3. 権限を設定
chmod 600 ~/.ssh/authorized_keys

# 4. 確認
cat ~/.ssh/authorized_keys
```

### ステップ3: SSH接続のテスト

ローカルマシンで以下を実行して接続を確認：

```bash
ssh root@162.43.8.168
```

パスワードなしで接続できれば成功です。

### ステップ4: Cursorで接続

1. Cursorを開く
2. `Cmd + Shift + P` でコマンドパレットを開く
3. 「Remote-SSH: Connect to Host...」と入力
4. `yaku-navi` または `root@162.43.8.168` を選択
5. 新しいウィンドウで接続が開始されます

## 🔧 トラブルシューティング

### 公開鍵を追加しても接続できない場合

1. **権限の確認**
   ```bash
   ls -la ~/.ssh/
   # authorized_keys が 600、.ssh ディレクトリが 700 であることを確認
   ```

2. **SELinuxの確認（該当する場合）**
   ```bash
   # SELinuxが有効な場合
   restorecon -R ~/.ssh
   ```

3. **SSH設定の確認**
   ```bash
   # サーバー側でSSH設定を確認
   sudo cat /etc/ssh/sshd_config | grep -E "PubkeyAuthentication|AuthorizedKeysFile"
   ```

### 複数の公開鍵を登録する場合

`authorized_keys` ファイルに複数の公開鍵を1行ずつ追加できます：

```bash
echo "公開鍵1" >> ~/.ssh/authorized_keys
echo "公開鍵2" >> ~/.ssh/authorized_keys
```



