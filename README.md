# TeamFlow フロントエンド

病棟業務支援アプリ「TeamFlow」の React フロントエンド。看護師の**朝一番の状況把握**（担当患者・本日のタスク・未読お知らせ）を 1 画面で完結できるように設計したポートフォリオ作品。

バックエンド（Spring Boot / MySQL）は別リポジトリ [`team-flow`](https://github.com/Miyuki-Hinata/team-flow) を参照。

---

## 技術スタック

- **React 18 + TypeScript + Vite** — SPA の土台
- **styled-components** — CSS-in-JS。デザイントークンを props.theme 経由で参照
- **React Router v6** — ルーティング（PrivateRoute で認証ゲート）
- **Vitest + React Testing Library** — ユニットテスト
- **バックエンド**: Spring Boot 3 + JPA/Hibernate + MySQL 8 + JWT 認証

---

## 主な画面

| 画面 | パス | 概要 |
|---|---|---|
| ログイン | `/login` | ID/パスワード認証 → JWT 発行 |
| ダッシュボード | `/dashboard` | 挨拶 + サマリカード×3 + 未読お知らせ + 本日の要対応患者 |
| 患者一覧 | `/patients` | 患者検索 + 一覧 |
| 患者詳細 | `/patients/:id` | カルテ画面（基本情報 + AI サマリ + 関連タスクのカンバン） |
| 患者作成 | `/patients/create` | 新規登録フォーム |
| お知らせ一覧 | `/announcements` | 未読/既読タブ切替 |
| お知らせ詳細/編集 | `/announcements/:id` | 詳細表示 + 権限のあるユーザーは編集/削除 |
| お知らせ作成 | `/announcements/create` | 新規投稿 + 自分の投稿一覧 |
| 全タスク | `/tasks` | 一覧 |
| マイタスク | `/tasks/my-tasks` | 自分担当のタスクのみ |
| タスク詳細/編集 | `/tasks/:id` | 詳細 + 編集 + 状態遷移 + 履歴 |
| タスク作成 | `/tasks/create` | 新規登録 |

---

## 起動方法

### 前提
- Node.js 20+
- バックエンド（`team-flow` リポジトリ）が `http://localhost:8080` で稼働していること
- MySQL 8（Docker Compose で立ち上がる想定）

### 手順
```bash
# 1) 依存を入れる
npm install

# 2) API 接続先を .env に設定
echo 'VITE_API_BASE_URL=http://localhost:8080' > .env

# 3) 開発サーバー起動
npm run dev
# → http://localhost:5173

# 4) 初期管理者アカウントでログイン
#    ID: admin / Password: admin1234
```

---

## ディレクトリ構成

```
src/
├── components/
│   ├── ui/              # 汎用 UI（Button, Card, Modal, Badge, PageHeader, Toast, ...）
│   ├── AnnouncementCard.tsx
│   ├── TaskCard.tsx
│   └── PasswordChangeModal.tsx
├── layouts/
│   ├── AppLayout.tsx    # サイドバー + ヘッダー + Outlet
│   ├── Sidebar.tsx      # オフキャンバス対応
│   ├── AppHeader.tsx    # パンくず + 日付 + ユーザーメニュー
│   └── navItems.ts      # ナビ定義（Sidebar と AppHeader で共有）
├── pages/               # ページごとに 1 ファイル
├── contexts/
│   ├── AuthContext.tsx  # 認証状態 + サイレントリフレッシュ
│   └── ToastContext.tsx # 通知（alert の代替）
├── api/                 # fetch ラッパー（tokenStore + 401 自動リフレッシュ）
├── types/               # ドメイン型（Task, Patient, Announcement, ...）
├── utils/               # 純粋関数（category, patient, task の変換ヘルパー）
├── styles/theme.ts      # デザイントークン（色/余白/角丸/フォント）
└── main.tsx             # Provider 重ね順：Theme → Toast → Auth → App
```

---

## 設計方針

### 1. デザイントークンを 1 箇所に集約
色・余白・角丸・フォントサイズは全て `styles/theme.ts` に定義し、styled-components から `props.theme.colors.xxx` で参照。ハードコード禁止。ダークモードは将来追加できるよう `themeLight` / `themeDark` を用意済み。

### 2. 「お手本 4 型」に揃える
`AISummaryCard` / `Modal` / `AppLayout` / `PatientCard` を「正解の型」とし、新規コンポーネントはこの 4 つの書き方（props の受け取り方 / theme の使い方 / 状態の持たせ方 / 責任の分割）に必ず揃える。詳細は [`CLAUDE.md`](./CLAUDE.md)。

### 3. 単一責任・表示と挙動の分離
`PatientCard` は表示のみで遷移は Link に委譲、`Modal` は開閉判断を自身に持ちレイアウトのみ提供、`Toast` は Provider + Context で命令的 API に。責務境界を明示。

### 4. レスポンシブ（README §Design 準拠）
- `lg` 未満（<1024px）：サイドバーがオフキャンバスドロワー化
- `md` 未満（<768px）：フォームの複数列と Dashboard の 3列/2列グリッドを 1 列化、ヘッダー日付非表示、本文余白縮小
- `sm` 未満（<640px）：ヘッダーのユーザー名ラベル非表示（アバターのみ）

### 5. 実装ドキュメントを残す
`docs/implementation/<コンポーネント名>.md` に「何を作ったか / なぜこの設計か / どのお手本に倣ったか / 使った theme トークン / 面接で説明できるポイント」を各実装ごとに残す。

---

## テスト戦略

### テストツール
- **テストランナー**: [Vitest](https://vitest.dev/)
- **コンポーネントテスト**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- **マッチャー**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- **ユーザー操作シミュレーション**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro)

### 設計方針

#### 1. ユニットテストに集中
各コンポーネントの動作のみをテストし、依存先（API、Context、Router）はモック化する設計。

```typescript
// 例：useAuth のモック化
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        setCurrentUser: vi.fn(),
        currentUser: null,
        isLoading: false,
    })
}))
```

メリット：
- テストの実行が高速
- 失敗時の原因特定が容易
- 結果が再現可能

#### 2. アクセシビリティ視点でのテスト
要素の取得には `getByText` ではなく `getByRole` を優先使用。
スクリーンリーダーが認識する構造と一致したテストを実現。

```typescript
// 推奨
screen.getByRole('button', { name: 'ログイン' })

// 非推奨（同一テキストが複数あると失敗）
screen.getByText('ログイン')
```

#### 3. ファクトリパターンによるモックデータ管理
`Partial<T>` を活用し、デフォルト値 + 必要な上書きパターンで保守性を確保。

```typescript
// src/test/factories/taskFactory.ts
export function createMockTask(overrides?: Partial<Task>): Task {
    return {
        id: 1,
        title: 'デフォルトタスク',
        // ...デフォルト値
        ...overrides,
    }
}

// 使用例
const task = createMockTask({ title: 'バイタル測定', priority: 'HIGH' })
```

メリット：
- テストごとに必要なフィールドだけ上書き
- Task 型変更時の修正箇所が1か所
- 型安全（`Partial<T>` による型チェック）

#### 4. 正常系と異常系の両方をテスト

```typescript
// 正常系：API成功時の動作
vi.mocked(login).mockResolvedValue({ token: 'fake-token' })

// 異常系：API失敗時のエラー表示
vi.mocked(login).mockRejectedValue(new Error('認証失敗'))
```

### テストカバレッジ（現状）

| コンポーネント | テスト数 | 内容 |
|---------------|---------|------|
| TaskCard | 3 | 表示テスト |
| PatientCard | 3 | 表示テスト |
| LoginPage | 4 | 表示・入力・成功シナリオ・失敗シナリオ |
| PasswordChangeModal | 4 | 表示・バリデーション×2・正常系 |

### テスト実行

```bash
npm test           # watch モードで実行
npm run test:ui    # UI モードで実行
npm run coverage   # カバレッジレポート生成
```

### 今後の展望

- [ ] PatientDetailPage の統合テスト
- [ ] PrivateRoute の認証ロジックテスト
- [ ] AnnouncementCard、AnnouncementForm のテスト
- [ ] E2E テスト（Playwright 等）の導入検討

### テストレイヤーの理解

このプロジェクトでは現時点でユニットテストに集中しているが、本番運用では以下の階層的なテスト戦略が望ましいと認識している：

- **ユニットテスト** (本リポジトリで実装中)
  - 単一コンポーネントの動作検証
- **統合テスト** (将来実装予定)
  - 複数コンポーネント・実APIの組み合わせ
- **E2Eテスト** (将来実装予定)
  - ブラウザ操作による本番に近い検証

---

## 面接で説明できるポイント

- **デザイントークン駆動**：色・余白・角丸を theme.ts に集約し、ハードコードを禁止。将来のダークモード切替の土台も済んでいる。
- **「お手本 4 型」による一貫性の担保**：新規コンポーネントは 4 つのお手本のいずれかに揃える運用ルールで、記法のブレを最小化。
- **Context の使い分け**：Auth はページ横断で参照するので Context、Toast も呼び出しを 1 関数に集約したいので Context、それ以外は props ドリブンに留める。
- **JWT + サイレントリフレッシュ**：アクセストークンを保持したまま画面遷移でリフレッシュを自動化。401 で自動再試行するインターセプタを `api/` 層に実装。
- **カンバン UI**：ステータス別 4 列を横スクロール可能なボードとして実装。カードクリックで詳細遷移時に「どこから来たか」を React Router の state で保持し、戻る導線を可変化。
- **表示と挙動の分離**：PatientCard は表示のみ・遷移は Link、Modal は開閉判断のみ・レイアウトは children で受ける、といった責務境界の明示。

---

## ライセンス
Personal portfolio. No license granted for reuse.
