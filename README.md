# TeamFlow フロントエンド

[![Frontend CI](https://github.com/Miyuki-Hinata/team-flow-front/actions/workflows/ci.yml/badge.svg)](https://github.com/Miyuki-Hinata/team-flow-front/actions/workflows/ci.yml)

病棟の多職種チームがタスクを患者単位で共有するアプリ「TeamFlow」の **React フロントエンド**です。
React 19 + TypeScript + styled-components の SPA で、デザイントークンの一元管理・ライト/ダーク切替・JWT のサイレントリフレッシュ・「お手本 4 型」によるコード一貫性の仕組みを実装しています。

> **プロジェクト全体の入口は [`team-flow`](https://github.com/Miyuki-Hinata/team-flow)（バックエンド）です。**
> 「なぜ作ったか」「解決したい課題」「認証・DB 設計」「セットアップ手順」はそちらの README にまとめています。
> このリポジトリの README は**フロントエンドの技術詳細**に絞ります。

| | |
|---|---|
| プロジェクト全体・セットアップ | [`team-flow` README](https://github.com/Miyuki-Hinata/team-flow) |
| 全コンポーネントの設計意図 | [`docs/implementation/`（46 本）](./docs/implementation) |
| コードの一貫性ルール | [`CLAUDE.md`](./CLAUDE.md) |

---

## 技術スタック

| 目的 | 技術 |
|---|---|
| UI | React 19 / TypeScript |
| ビルド | Vite 8 |
| スタイリング | styled-components 6（デザイントークンを `props.theme` 経由で参照） |
| ルーティング | React Router 7（`PrivateRoute` / `AdminRoute` で多段ガード） |
| テスト | Vitest 4 + React Testing Library |
| CI | GitHub Actions（push ごとに lint → vitest → build） |

---

## 設計のポイント

### 1. デザイントークンを 1 箇所に集約し、ライト/ダークを切替可能に

色・余白・角丸・フォントサイズはすべて [`styles/theme.ts`](./src/styles/theme.ts) に定義し、コンポーネントからは `props.theme.colors.xxx` で参照します。**ハードコード禁止**（`#0E9384` を直接書かない）。

このルールの見返りが**ダークモード**です。全コンポーネントがトークン経由で色を引いているため、[`ThemeModeContext`](./src/contexts/ThemeModeContext.tsx) が `themeLight` / `themeDark` を差し替えるだけで全画面が追従します。切替はヘッダーのユーザーメニューから行い、選択は localStorage に保存されます。個別コンポーネントにダーク対応のコードは 1 行もありません。

### 2. 「お手本 4 型」でコードの書き方を強制的に揃える

新規コンポーネントは、`AISummaryCard`（props の型定義と分割代入）/ `Modal`（開閉判断を自身に持つ汎用化）/ `AppLayout`（レイアウトとページの責任分離）/ `PatientCard`（theme の使い方・表示専任）の **4 つのお手本のどれかと同じ書き方**で書く、というルールを [`CLAUDE.md`](./CLAUDE.md) に定めて運用しています。

これは AI コーディング支援を全面的に使う開発体制とセットの仕組みです。AI は呼ぶたびに違う書き方を提案してくるため、**「正解の型」を先に固定してそこに揃えさせる**ことで、誰が（何が）書いてもコードベースの一貫性が保たれるようにしました。各コンポーネントがどの型に倣ったかは [`docs/implementation/`](./docs/implementation) に 1 本ずつ記録しています。

### 3. 認証は「メモリ上のトークン + サイレントリフレッシュ」

アクセストークン（15 分）は localStorage ではなく**メモリ上**（[`api/tokenStore.ts`](./src/api/tokenStore.ts)）に保持し、XSS で盗まれる面を減らしています。ページリロードで消えますが、HttpOnly Cookie のリフレッシュトークンで [`AuthContext`](./src/contexts/AuthContext.tsx) が自動再取得するため、ユーザーはログインし直す必要がありません。API 呼び出しは [`api/apiClient.ts`](./src/api/apiClient.ts) に集約し、**401 が返ったらリフレッシュ→ 1 回だけ自動再試行**します。

### 4. 権限ガードは UI 側の「二重目」

[`App.tsx`](./src/App.tsx) の `PrivateRoute`（未認証→ログインへ）と `AdminRoute`（非管理者→ダッシュボードへ）で画面を包み、サイドバーの「管理」メニューも権限で出し分けます。ただし**これは体験のためのガードで、防御の本体はバックエンド**（Spring Security の `hasRole`）です。この役割分担は [`team-flow` README の設計ポイント 3](https://github.com/Miyuki-Hinata/team-flow#3-権限は職種と分離しapi-と-ui-で二重にガード) 参照。

### 5. 表示と挙動の分離

`PatientCard` は表示のみで遷移は呼び出し側の `Link` に委譲、`Modal` は開閉判断を自身に持ちレイアウトは `children` で受ける、`Toast` は Provider + Context で命令的 API に集約——という責務境界を守っています。Context を使うのは**ページ横断で本当に必要なもの**（認証・テーマ・トースト・未読件数）だけで、それ以外は props で渡します（Redux を入れなかった理由も同じで、全体共有が必要な状態がこの 4 つ程度だったためです）。

### 6. レスポンシブ

- `lg` 未満（<1024px）：サイドバーがオフキャンバスドロワー化
- `md` 未満（<768px）：フォーム複数列と Dashboard のグリッドを 1 列化、ヘッダー日付非表示
- `sm` 未満（<640px）：ヘッダーのユーザー名ラベル非表示（アバターのみ）

ブレークポイントも theme.ts のトークンです。

---

## テスト戦略

**6 ファイル / 26 件、すべて緑**（`npx vitest run`）。

### 方針

1. **ユニットテストに集中** — 依存先（API・Context・Router）は `vi.mock` でモック化し、コンポーネント単体の振る舞いを速く・再現可能に検証する
2. **`getByRole` を優先** — スクリーンリーダーが認識する構造と一致したクエリでテストする（`getByText` は同一テキストの重複に弱い）
3. **ファクトリパターン** — モックデータは `createMockTask(overrides?: Partial<Task>)` の形で共通化。型変更時の修正が 1 箇所で済む
4. **正常系と異常系の両方** — 例：ログイン成功時の API 呼び出し引数と、失敗時のエラー表示を両方検証

### 現在のカバレッジ

| テスト対象 | 件数 | 主な内容 |
|---|---|---|
| [PatientTimeline](./src/components/ui/PatientTimeline.test.tsx) | 9 | 期限超過の分離表示・完了タスクの除外・同時刻グルーピング・クリック遷移（イベント伝播の制御含む） |
| [LoginPage](./src/pages/LoginPage.test.tsx) | 5 | 表示・入力・成功時の API 引数・失敗時のエラー表示 |
| [PasswordChangeModal](./src/components/PasswordChangeModal.test.tsx) | 4 | 表示・バリデーション×2・正常系 |
| [TaskCard](./src/components/TaskCard.test.tsx) | 3 | 表示 |
| [PatientCard](./src/components/ui/PatientCard.test.tsx) | 3 | 表示 |
| [Card](./src/components/ui/Card.test.tsx) | 2 | children 描画・`styled(Card)` 拡張時の className 伝播 |

バックエンド側のテスト 22 件（MockMvc による認証・認可の回帰テスト 15 件を含む）は [`team-flow`](https://github.com/Miyuki-Hinata/team-flow) にあります。

```bash
npm test           # watch モード
npx vitest run     # 1回だけ実行（CI と同じ）
npm run coverage   # カバレッジレポート
```

### CI

push ごとに GitHub Actions で `npm run lint` → `npx vitest run` → `npm run build` を実行します（[`.github/workflows/ci.yml`](./.github/workflows/ci.yml)）。
テストだけでなく build も含めているのは、型検査が `tsc -b`（build の前段）でしか走らないためです。Vite の開発サーバーと Vitest は速度のため型検査を省くので、型エラーは CI の build ステップで検出します。

---

## 画面一覧

| 画面 | パス | ガード |
|---|---|---|
| ログイン | `/login` | — |
| ダッシュボード | `/dashboard` | PrivateRoute |
| 受け持ち患者（一覧 / 24hタイムライン） | `/my-patients` | PrivateRoute |
| 患者一覧 / 詳細 | `/patients`, `/patients/:id` | PrivateRoute |
| 患者登録 | `/patients/create` | **AdminRoute** |
| 全タスク / マイタスク | `/tasks`, `/tasks/my-tasks` | PrivateRoute |
| タスク詳細 / 作成 | `/tasks/:id`, `/tasks/create` | PrivateRoute |
| お知らせ一覧 / 詳細 / 作成 | `/announcements`, `/announcements/:id`, `/announcements/create` | PrivateRoute |
| 管理（ユーザー・部署・カテゴリ・プロジェクト） | `/admin` | **AdminRoute** |

未定義パスは `/dashboard` へリダイレクト（catch-all）。

---

## ディレクトリ構成

```
src/
├── components/
│   ├── ui/              # 汎用 UI 27 個（Button, Card, Modal, Badge, KanbanBoard, PatientTimeline, ...）
│   └── ...              # ドメイン寄りの複合コンポーネント（TaskList, AssignmentPicker, ...）
├── layouts/
│   ├── AppLayout.tsx    # サイドバー + ヘッダー + Outlet
│   ├── Sidebar.tsx      # オフキャンバス対応・権限でメニュー出し分け
│   ├── AppHeader.tsx    # パンくず + ユーザーメニュー（テーマ切替・ログアウト）
│   └── navItems.ts      # ナビ定義（Sidebar と AppHeader で共有）
├── pages/               # ページごとに 1 ファイル（ルーティング単位）
├── contexts/            # ThemeMode / Toast / Auth / AnnouncementCount
├── api/                 # apiClient（401自動リフレッシュ）+ tokenStore + ドメイン別モジュール
├── types/               # ドメイン型（Task, Patient, Announcement, ...）
├── utils/               # 純粋関数（表示用変換ヘルパー）
├── styles/theme.ts      # デザイントークン（themeLight / themeDark）
└── main.tsx             # Provider 重ね順：ThemeMode → Toast → Auth → AnnouncementCount
```

---

## 起動方法

バックエンド（API + MySQL）が必要です。**手順全体は [`team-flow` README のセットアップ](https://github.com/Miyuki-Hinata/team-flow#セットアップ) を参照**してください。フロント単体は：

```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev            # → http://localhost:5173（デモアカウント：nurse / admin1234）
```

---

## 今後の課題

- [#23](https://github.com/Miyuki-Hinata/team-flow/issues/23) Storybook 導入（テーマ切替 decorator つき）と GitHub Pages 公開
- [#27](https://github.com/Miyuki-Hinata/team-flow/issues/27) E2E テスト（Selenium）

---

Personal portfolio. No license granted for reuse.
