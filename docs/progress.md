# TeamFlow フロントエンド 実装進捗管理

このファイルは Issue #18（UI整備）の進捗を管理する。CLAUDE.md フェーズ0で作成。
チェックの付いた項目は「完了」。フェーズ1（コンポーネント）→ フェーズ2（ページ）の順で1つずつ進める。

- 参照元：
  - `docs/design/README.md`（デザインの唯一の正解）
  - `docs/design/TeamFlow.dc.html`（見た目・挙動の正解プロトタイプ。※CLAUDE.md表記の `TeamFlow_dc.html` の実ファイル名）
  - `docs/design/TeamFlow_to_share.html`（ブラウザ確認用バンドル）
  - `docs/frontend-overview-and-ui-audit.md`（現状の地図・優先順位）

---

## 後回しの微調整メモ（全体整備後にまとめて対応）

構造を先に整え、細部（サイド）の微修正は全体が揃ってから一括で行う方針。忘れないための控え。

- [x] ~~**氏名のスペース**~~：TaskCard.tsx の1箇所のみ修正で完了（他ファイルは既に半角スペース区切りで統一済みだった）
- [ ] **列揃えの min-width**：TaskCard の状態列(64px)/期限担当列(150px) など、複数行でカラムを揃えるレイアウト値。トークンに無い px のため保留中。必要ならレイアウト定数として導入。
- [x] ~~**カテゴリの意味色**~~：`utils/category.ts` の tone マッピング（緊急=赤 / 連絡=青 / シフト・その他=グレー）を新設し、AnnouncementCard / AnnouncementDetailPage / TaskDetailPage で適用。
- [x] ~~全体の見た目確認~~：App Shell 完成後、Preview で各画面を巡回確認済み。
- [x] ~~**App Shell のオフキャンバス（レスポンシブ）**~~：AppLayout に isSidebarOpen state を持たせ、lg 未満で Sidebar を `position:fixed + transform` の off-canvas ドロワー化、Overlay + ハンバーガーボタン + ナビ項目タップで自動閉じを実装済み。
- [ ] **未読お知らせバッジ（サイドバーのお知らせ項目右）**：件数取得の設計が必要。今回スコープ外・後で実装予定。
- [ ] **ダークモード切替 UI**（ヘッダーのユーザーメニュー内）：theme 側は対応済み、切替 UI・状態管理は未接続。今回スコープ外・後で実装予定。
- [x] ~~**レスポンシブ対応（全ページ整備後にまとめて対応）**~~：以下すべて対応済み：
    - App Shell：lg 未満でサイドバーをオフキャンバス化＋ハンバーガー
    - ヘッダー：md 未満で日付非表示、sm 未満でユーザー名ラベル非表示（アバターのみ）
    - Main の padding：md 未満で 16px に
    - サマリ・フォーム・カンバンの複数列グリッド → md 未満で1列
    - バイタル4列（患者詳細）→ sm 未満で1列
    - 患者カードの「次の対応」ブロック折り返しはデザイン上未使用のため対象外
- [x] ~~【要調査】新規患者登録が失敗する~~：SEX_OPTIONS 英語化 + エラーハンドリング + フロントバリデーション追加 で解決。
- [x] ~~【バックエンド】バリデーションエラーが 401 で返る問題~~：GlobalExceptionHandler に HttpMessageNotReadableException / DataIntegrityViolationException のハンドラを追加、Entity の @NotEmpty 削除 + DB カラムを NULL 許容に変更で解決。
- [x] ~~【フロント】必須項目の再検討~~：バックエンド DTO の @NotEmpty / @NotNull と一致させて 6 項目に絞った（苗字/名前/かな2つ/生年月日/性別）。住所・緊急連絡先・部署・担当医は任意。
- [x] ~~**成功通知の UI 統一（`alert` → アプリ内通知）**~~：`contexts/ToastContext.tsx` を新設（Provider + useToast）、セマンティックカラーで tone を伝えるカード UI、pointer-events 使い分けで背後操作を妨げない設計。PasswordChangeModal / AnnouncementDetailPage / TaskDetailPage / AnnouncementCreatePage / PatientDetailPage の alert を toast.success / toast.error で置換。
- [x] ~~**Dashboard 本格実装（別Issue化候補）**~~：以下すべて対応済み：
    - **サマリカード×3**（担当患者 / 本日のタスク / 未読お知らせ数）：3列グリッドで実装、各カードから該当画面へ遷移
    - **本日の要対応患者リスト**：`myTasks` から「未完了かつ期限が今日以前」を持つ患者を逆引きしてユニーク抽出。PatientCard 再利用
    - **loading 状態**：`useState<T[] | null>` パターンで未取得を表現、揃うまで単一 Loading ゲート
    - **PageHeader の subtitle**：「〇年〇月〇日 (曜)」形式で挨拶付きタイトルとセットに
- [x] ~~**マイタスクを患者別グルーピングに置換**~~：MyTasksPage を患者別セクション表示に刷新。朝一の受け持ち患者ビュー用途。Dashboard の「担当患者」枠のリンク先も /tasks/my-tasks に。
- [x] ~~**患者詳細の追加情報をアコーディオン化**~~：汎用 Accordion（boxed / inline variant 対応）を新設し、生年月日・電話・住所・緊急連絡先を DetailCard 内に inline で埋め込み。患者名との視覚的接続を保ちつつ情報密度を下げる。
- [x] ~~**README 本格整備**~~：プロジェクト概要・技術スタック・画面一覧・起動手順・ディレクトリ構成・設計方針・面接説明ポイントを追加。既存のテスト戦略はそのまま残す。

---

## フェーズ0：全体把握（完了）

- [x] モック全体を確認（README / TeamFlow.dc.html の Screens・Design Tokens・App Shell）
- [x] `docs/progress.md` 作成
- [x] ページ一覧の書き出し（下記）
- [x] コンポーネント一覧の書き出し（実装済み/未実装を明記、下記）

---

## コンポーネント一覧（フェーズ1）

### 実装済み（再作成しない）

`src/components/ui/` 配下の共通コンポーネント：

- [x] **Button** — `ui/Button.tsx`（variant: primary / secondary / danger）※neutral / ghost の追加と全画面への適用は要検討（audit C）
- [x] **Badge** — `ui/Badge.tsx`（tone ベースの汎用バッジ）
- [x] **PriorityBadge** — `ui/PriorityBadge.tsx`（優先度→tone マッピング内包）
- [x] **StatusBadge** — `ui/StatusBadge.tsx`（ステータス→tone マッピング内包）
- [x] **Card** — `ui/Card.tsx`（surface / 角丸 / 余白の土台）
- [x] **PatientCard** — `ui/PatientCard.tsx`（お手本／表示のみ・単一責任）
- [x] **PatientIcon** — `ui/PatientIcon.tsx`（性別=色・年齢層=形の患者アバター）
- [x] **Modal** — `ui/Modal.tsx`（お手本／isOpen・onClose・children の汎用化）
- [x] **AISummaryCard** — `ui/AISummaryCard.tsx`（お手本／Card 土台・開閉トグル）
- [x] **UserMenu** — `ui/UserMenu.tsx`（ヘッダーのユーザードロップダウン。audit K の DropdownMenu 相当）
- [x] **AppLayout** — `layouts/AppLayout.tsx`（お手本／Outlet でページ差し込み）

### 既存だが「素の実装」で、共通コンポーネント適用によるリファクタ対象

`src/components/` 直下。存在はするが、audit によれば内部が素の `<button>/<input>/<select>/<span>` で書かれており、土台コンポーネント完成後に置き換える。土台が揃ったので順次リファクタ中。

お知らせ系：
- [x] **AnnouncementCard** — Card/Badge/PriorityBadge へ置換・未読ドット化（デザイン準拠）→ doc: `implementation/AnnouncementCard.md`
- [x] **AnnouncementList** — 器 `<div>` を縦積み＋gap の styled コンテナへ（トークン化）→ doc: `implementation/AnnouncementList.md`
- [x] **AnnouncementTabs** — 素 `<button>` をセグメント表現に（theme化・`$active` transient prop）→ doc: `implementation/AnnouncementTabs.md`

タスク系：
- [x] **TaskCard** — Card/StatusBadge/PriorityBadge/Badge へ置換・`styled(Link)` リンク化 → doc: `implementation/TaskCard.md`
- [x] **TaskList** — 器 `<div>` を縦積み＋gap の styled コンテナへ（AnnouncementList と同一方針）→ doc: `implementation/TaskList.md`
- [x] **TaskListContainer** — 器 `<div>` を縦積み＋gap の styled コンテナへ（フィルタ状態は不変）→ doc: `implementation/TaskListContainer.md`
- [x] **TaskFilter** — 素 `<select>`×2 を TaskStatusSelect / PrioritySelect へ置換（「すべて」は placeholder で）→ doc: `implementation/TaskFilter.md`

患者系：
- [x] **PatientList** — 器 `<div>` を縦積み styled へ、素 `<Link>` を `styled(Link)` へ → doc: `implementation/PatientList.md`
- [x] **PatientListContainer** — 器 `<div>` を縦積み styled へ（フィルタ state 不変）→ doc: `implementation/PatientListContainer.md`
- [x] **PatientFilter** — 素 `<select>`×2 を汎用 `ui/Select` に置換（placeholder に「部署：」「担当医：」プレフィックス）→ doc: `implementation/PatientFilter.md`

その他：
- [x] **Navigation**（暫定・App Shell フェーズで再設計）— 素 `<button>`/`<Link>` を `ui/Button`/`styled(Link)` へ・`var(--bg)` を theme へ → doc: `implementation/Navigation.md`
- [x] **UrgentAnnouncements** — 器 `<div>` を縦積み styled へ（他一覧と同じ `spacing.md`）→ doc: `implementation/UrgentAnnouncements.md`
- [x] **PasswordChangeModal** — 素 `<input>`×3・`<button>`×2 を Input/FormField/Button へ・エラー表示を theme 化 → doc: `implementation/PasswordChangeModal.md`

App Shell（4分割）：
- [x] **navItems**（ナビ定義の単一情報源）— Sidebar/AppHeader パンくずで共有する `NAV_ITEMS` 配列と `findCurrentLabel(pathname)` → `layouts/navItems.ts`
- [x] **Sidebar** — 248px サイドバー（ロゴ/ナビ×5/施設情報・現在地ハイライト）→ `layouts/Sidebar.tsx` / doc: `implementation/Sidebar.md`
- [x] **AppHeader** — パンくず／日付／ユーザーメニュー（旧 Navigation のロジック移植＋外クリック閉じ追加）→ `layouts/AppHeader.tsx` / doc: `implementation/AppHeader.md`
- [x] **AppLayout 再実装** — Shell/MainColumn/Main+Container の3層に整理、ページ背景 `surface.base`・最大幅 1080px、旧 `components/Navigation.tsx` 削除 → doc: `implementation/AppLayout.md`

### 未実装（今回作る。audit の推奨着手順どおりに上から1つずつ）

**土台（最優先）**

- [x] **Input** — 全フォームの素 `<input>`（text/password/date/tel/datetime-local）を置換（audit B・優先1）→ `ui/Input.tsx` / doc: `implementation/Input.md`
- [x] **Select**（汎用） — `options: {value,label}[]` を受ける（audit A・優先2）→ `ui/Select.tsx` / doc: `implementation/Select.md`
- [x] **PrioritySelect** — Select の固定ラップ（優先度）→ `ui/PrioritySelect.tsx` / doc: `implementation/PrioritySelect.md`
- [x] **TaskStatusSelect** — Select の固定ラップ（ステータス）→ `ui/TaskStatusSelect.tsx` / doc: `implementation/TaskStatusSelect.md`
- [x] **FormField** — `<label>` ＋ エラー枠を内包（audit B）→ `ui/FormField.tsx` / doc: `implementation/FormField.md`
- [x] **ConfirmDialog** — Modal 派生の削除確認ダイアログ（audit H・優先6）→ `ui/ConfirmDialog.tsx` / doc: `implementation/ConfirmDialog.md`

**専用（後回し可）**

- [x] **HistoryList** — 変更履歴の共通描画（お知らせ/タスク詳細で同一。audit J・優先7）→ doc: `implementation/HistoryList.md`
- [x] **Accordion** — 折りたたみ表示（boxed / inline variant）→ doc: `implementation/Accordion.md`
- [x] **Toast**（+ ToastContext / useToast） — 画面右上に自動消去される通知 UI（alert 代替）→ doc: `implementation/Toast.md`
- [ ] **Tabs**（汎用・カウント付き） — お知らせ未読/既読・患者詳細カンバンタブ（audit G・優先8）
- [ ] **FilterBar** — Select を横並びにする器（audit F・優先9。Select 共通化後は薄い）
- [x] **KanbanBoard** — 患者詳細のカンバン（PatientDetailPage のローカル定義から `ui/KanbanBoard.tsx` に切り出し。audit 10）→ doc: `implementation/KanbanBoard.md`
- [ ] **List**（ジェネリック） — カードを map する器（audit E）
- [x] **PageHeader** — タイトル＋作成リンクの一覧共通ヘッダー（audit M）→ `ui/PageHeader.tsx` / doc: `implementation/PageHeader.md`
- [x] **EmptyState** — 「〜ありません」の共通表示（audit L）→ `ui/EmptyState.tsx` / doc: `implementation/EmptyState.md`
- [x] **Loading** — 「読み込み中...」の共通表示（audit L）→ `ui/Loading.tsx` / doc: `implementation/Loading.md`

> 着手順（audit 推奨）：`Input → Select(+Priority/Status) → Badge(済) → Card(済) → Button適用 → Modal(済/ConfirmDialog)` → 専用（History/Tabs/Kanban…）。
> 実質、未実装の土台は **Input → Select → PrioritySelect → TaskStatusSelect → FormField → ConfirmDialog** の順で着手する。

---

## ページ一覧（フェーズ2）

`src/App.tsx` のルーティングと README の Screens/Views を突き合わせたもの。
（※ページ自体は既に存在するが、共通コンポーネント適用による整備がフェーズ2の対象。）

| # | 画面（README） | ルート | ファイル | 整備 |
|---|---|---|---|---|
| 1 | ログイン | `/login` | `pages/LoginPage.tsx` | [x] doc: `implementation/LoginPage.md` |
| 2 | ダッシュボード | `/dashboard` | `pages/DashboardPage.tsx` | [x] doc: `implementation/DashboardPage.md` |
| 3 | 患者一覧 | `/patients` | `pages/PatientPage.tsx` | [x] doc: `implementation/PatientPage.md` |
| 4 | 患者詳細 | `/patients/:id` | `pages/PatientDetailPage.tsx` | [x] |
| — | 患者作成 | `/patients/create` | `pages/PatientCreatePage.tsx` | [x] doc: `implementation/PatientCreatePage.md` |
| 5 | お知らせ一覧 | `/announcements` | `pages/AnnouncementsPage.tsx` | [x] |
| 6 | お知らせ作成 | `/announcements/create` | `pages/AnnouncementCreatePage.tsx` | [x] |
| 7 | お知らせ編集 | （詳細内インライン） | `pages/AnnouncementDetailPage.tsx` | [ ] |
| — | お知らせ詳細 | `/announcements/:id` | `pages/AnnouncementDetailPage.tsx` | [x] |
| 8 | 全タスク | `/tasks` | `pages/TasksPage.tsx` | [x] |
| 8 | マイタスク | `/tasks/my-tasks` | `pages/MyTasksPage.tsx` | [x] |
| 9 | タスク作成 | `/tasks/create` | `pages/TaskCreatePage.tsx` | [x] |
| 10 | タスク詳細 | `/tasks/:id` | `pages/TaskDetailPage.tsx` | [x] |
| 11 | タスク編集 | （詳細内インライン） | `pages/TaskDetailPage.tsx` | [ ] |
| 12 | パスワード変更モーダル | ヘッダーから起動 | `components/PasswordChangeModal.tsx` | [ ] |

### 備考（README の Screens と実ルーティングの差分）

- README の「お知らせ編集(7)」「タスク編集(11)」は独立画面として記載されているが、実装では詳細ページ内のインライン編集。今回は既存構造を踏襲する。
- 「パスワード変更モーダル(12)」はルートを持たず、ヘッダーのユーザーメニューから起動するモーダル。
- audit「仕様が曖昧だった箇所」（Dashboard のリンク先不一致 `/mypage` `/my-tasks`、catch-all 無し、権限チェック非一貫、Role 未活用 等）は **Issue #18 の範囲外**。今回は触らず別Issueへ。

---

## 進め方（CLAUDE.md §5 準拠）

- コンポーネント／ページは **必ず1つずつ** 実装 → `docs/implementation/<名前>.md` 作成 → 本ファイルにチェック → **一旦停止して報告**。自動で次に進まない。
- お手本（AISummaryCard / Modal / AppLayout / PatientCard）と §2 技術ルール（theme トークン厳守・styled-components・props 分割代入・1責任・日本語コメント・型省略なし）に従う。
