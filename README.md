# 旅のしおり

友だちとリアルタイムで一緒に編集できる、旅行のしおりアプリです。
要件は [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) を参照してください。

## 技術構成

- React + Vite + TypeScript
- Firebase Authentication（Googleログイン）
- Cloud Firestore
- Firebase Hosting（GitHub Actions で main への push 時に自動デプロイ）

## ローカルで動かす

```bash
npm install
cp .env.example .env.local   # Firebase の設定値を入れる
npm run dev
```

## Firestore のルールを反映する

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <プロジェクトID>
```

## GitHub Secrets

| 名前 | 内容 |
|---|---|
| `VITE_FIREBASE_*`（6つ） | `.env.local` と同じ値 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Hosting へデプロイするサービスアカウントの JSON |
