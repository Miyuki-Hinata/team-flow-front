# TeamFlow フロントエンド — 全体像 & 共通UIコンポーネント洗い出し

> 本ドキュメントは実コードの読み取りに基づく。推測箇所はその旨を明記。
> 現時点で `src/components/ui/Button.tsx`（`variant: primary | secondary | danger`）のみ共通化済み。

---

# パート1：アプリ全体像（ステップ1の結果）

## 1. ページ一覧（ルーティング定義）

ルーティングは `src/App.tsx:43-56` で定義。`/login` 以外はすべて `PrivateRoute`（`src/App.tsx:20-36`）でラップされ、未ログインだと `/login` にリダイレクトされる。

| URLパス | コンポーネント | ファイル | 認証 |
|---|---|---|---|
| `/login` | LoginPage | `src/pages/LoginPage.tsx` | 不要 |
| `/dashboard` | DashboardPage | `src/pages/DashboardPage.tsx` | 必要 |
| `/announcements` | AnnouncementsPage | `src/pages/AnnouncementsPage.tsx` | 必要 |
| `/announcements/create` | AnnouncementCreatePage | `src/pages/AnnouncementCreatePage.tsx` | 必要 |
| `/announcements/:id` | AnnouncementDetailPage | `src/pages/AnnouncementDetailPage.tsx` | 必要 |
| `/tasks` | TasksPage | `src/pages/TasksPage.tsx` | 必要 |
| `/tasks/create` | TaskCreatePage | `src/pages/TaskCreatePage.tsx` | 必要 |
| `/tasks/my-tasks` | MyTasksPage | `src/pages/MyTasksPage.tsx` | 必要 |
| `/tasks/:id` | TaskDetailPage | `src/pages/TaskDetailPage.tsx` | 必要 |
| `/patients` | PatientPage | `src/pages/PatientPage.tsx` | 必要 |
| `/patients/create` | PatientCreatePage | `src/pages/PatientCreatePage.tsx` | 必要 |
| `/patients/:id` | PatientDetailPage | `src/pages/PatientDetailPage.tsx` | 必要 |

※ catch-all（`*`）や `/` のリダイレクト定義は無い。

## 2. 各ページの役割

- **LoginPage** — ログインID/パスワードでログイン。成功後 `state.from` → `sessionStorage` → `/dashboard` の優先順でリダイレクト（`src/pages/LoginPage.tsx:33-42`）。
- **DashboardPage** — トップ。未読お知らせ最大3件＋各画面へのリンク（`src/pages/DashboardPage.tsx:18-36`）。
- **AnnouncementsPage** — お知らせ一覧。緊急表示・未読/既読タブ・カードクリックで既読化（`src/pages/AnnouncementsPage.tsx:32-48`）。
- **AnnouncementCreatePage** — お知らせ作成フォーム＋自分の作成済み一覧（その場で削除可）（`src/pages/AnnouncementCreatePage.tsx:33-58`）。
- **AnnouncementDetailPage** — 詳細表示＋インライン編集/削除＋変更履歴。編集/削除は権限者のみ（`src/pages/AnnouncementDetailPage.tsx:100-101`）。
- **TasksPage** — 全タスク一覧＋作成リンク（`src/pages/TasksPage.tsx:16-21`）。
- **MyTasksPage** — 自分担当のタスク一覧（`src/pages/MyTasksPage.tsx:10-21`）。
- **TaskCreatePage** — タスク作成フォーム（担当者複数選択・全員割当等）（`src/pages/TaskCreatePage.tsx:38-56`）。
- **TaskDetailPage** — 詳細表示＋インライン編集/削除＋ステータスのクイック変更＋変更履歴（`src/pages/TaskDetailPage.tsx:88-109`）。
- **PatientPage** — 患者一覧（部署・医師でフィルタ）＋作成リンク（`src/pages/PatientPage.tsx:26-42`）。
- **PatientCreatePage** — 患者作成フォーム（担当医は `users('DOCTOR')` で絞込）（`src/pages/PatientCreatePage.tsx:36`）。
- **PatientDetailPage** — 患者基本情報＋AIタスクサマリ生成/再生成＋タスクのカンバン表示（タブ・並び替え）（`src/pages/PatientDetailPage.tsx:116-126, 241-260`）。

## 3. ページ間の遷移

- **グローバルナビ**（`src/components/Navigation.tsx:21-24`、ログイン時のみ全画面表示）：お知らせ一覧 / 患者一覧 / 全タスク一覧 / マイタスク、ユーザー名メニュー → パスワード変更（モーダル）/ ログアウト。
- LoginPage → `/dashboard`（または元ページ）
- DashboardPage → `/announcements`, `/patients`, `/mypage`, `/my-tasks`, `/tasks`（一部は実在ルートと不一致：後述）
- AnnouncementsPage → `/announcements/create`、カード → `/announcements/:id`（`src/components/AnnouncementCard.tsx:11`）
- 各 Create/Detail → 作成・削除後に一覧へ戻る
- TasksPage / MyTasksPage → `/tasks/create`、`TaskCard` → `/tasks/:id`（`src/components/TaskCard.tsx:12`）
- PatientPage → `/patients/create`、`PatientCard` → `/patients/:id`（`src/components/PatientCard.tsx:10`）

## 4. 認証・権限

- **状態管理**：`AuthContext`（`src/contexts/AuthContext.tsx`）が `currentUser` 保持。アクセストークンはメモリのみ、リフレッシュトークンは HttpOnly Cookie。起動時 `refresh()` でサイレント再取得（`src/contexts/AuthContext.tsx:25-38`）。
- **401処理**：`fetchWithAuth`（`src/api/apiClient.ts`）が401検知 → 1回だけリフレッシュ＆リトライ。失敗時は現在URLを `sessionStorage` 保存して `/login` へ。
- **ページ保護**：`/login` 以外すべて `PrivateRoute`（`src/App.tsx:45-55`）。
- **role による表示分岐は2箇所のみ**：
  1. お知らせ編集/削除ボタン＝作成者本人 or 管理者のみ（`src/pages/AnnouncementDetailPage.tsx:100-101`、判定は `UserResponse.admin` boolean）。
  2. 患者作成の担当医セレクト＝`users('DOCTOR')` で `Role==='DOCTOR'` のみ取得（`src/pages/PatientCreatePage.tsx:36`）。
- `Role` 型（11職種、`src/types/role.ts`）は定義されているが、画面制御に使われているのは `admin` boolean のみ。タスクの編集/削除ボタンは無条件表示（`src/pages/TaskDetailPage.tsx:247-248`）。

## 仕様が曖昧だった箇所

1. Dashboard のリンク先 `/mypage` `/my-tasks` が実在ルートと不一致（`src/pages/DashboardPage.tsx:34-35`）。
2. catch-all / `/` リダイレクトが無い（`src/App.tsx:43-56`）。
3. タスクとお知らせで権限チェックの一貫性が無い（タスク編集/削除は誰でも見える）。
4. `Role`（11職種）の使いどころが不明（実質 `admin` のみ稼働）。
5. API ベースURL `http://localhost:8080` がハードコード（例 `src/api/users.ts:7`）。
6. PatientDetailPage のタブ命名揺れ（`'all'|'category'|'my'` とコメント中の `department`）。
7. AnnouncementCard が `Link` の内側で `onClick`（既読化）を同時発火（`src/components/AnnouncementCard.tsx:11-15`）。

---

# パート2：共通UIコンポーネント洗い出し（今回の本題）

## 前提

- `src/styles/theme.ts` に**デザイントークンが既に整備済み**（spacing / radius / fontSize / fontWeight / colors.semantic（success/warning/danger/info の main+bg）/ colors.brand / surface / text / border）。
- にもかかわらず、現状ほとんどの画面は**素の `<button>` `<input>` `<select>` `<span>` と inline style**で書かれており、トークンが活かされていない。共通化の余地が非常に大きい。

## 1. 繰り返し現れるUI要素（使用箇所つき）

### A. Select（ドロップダウン）★最大の重複
ほぼ全フォーム・全フィルタに登場し、構造が完全に同型（`<option value="">プレースホルダ</option>` ＋ `.map` で options）。

| 用途 | 使用箇所 |
|---|---|
| プロジェクト選択 | `AnnouncementCreatePage.tsx:82-90`, `AnnouncementDetailPage.tsx:120-128`, `TaskCreatePage.tsx:80-88`, `TaskDetailPage.tsx:147-155` |
| カテゴリ選択 | `AnnouncementCreatePage.tsx:92-100`, `AnnouncementDetailPage.tsx:129-137`, `TaskCreatePage.tsx:90-98`, `TaskDetailPage.tsx:156-164` |
| 部署選択 | `AnnouncementCreatePage.tsx:102-110`, `AnnouncementDetailPage.tsx:138-146`, `PatientCreatePage.tsx:127-138`, `PatientFilter.tsx:19-30` |
| 患者選択 | `TaskCreatePage.tsx:100-108`, `TaskDetailPage.tsx:165-173` |
| 担当医選択 | `PatientCreatePage.tsx:141-154`, `PatientFilter.tsx:31-41` |
| 優先度（LOW/MED/HIGH） | `AnnouncementCreatePage.tsx:112-119`, `AnnouncementDetailPage.tsx:147-154`, `TaskCreatePage.tsx:120-127`, `TaskDetailPage.tsx:174-181`, `TaskFilter.tsx:23-31` |
| ステータス（未着手/進行中/…） | `TaskCreatePage.tsx:110-118`, `TaskDetailPage.tsx:182-190`, `TaskDetailPage.tsx:238-246`, `TaskFilter.tsx:13-22` |
| 性別 | `PatientCreatePage.tsx:89-94` |
| 並び替え | `PatientDetailPage.tsx:202-209` |

→ 提案：汎用 `<Select>`（スタイル）＋ `options:{value,label}[]` を受ける形。さらに優先度・ステータスは選択肢が固定なので `PrioritySelect` / `TaskStatusSelect` として専用ラップを用意すると重複が一気に消える。

### B. Text Input / フォームフィールド
素の `<input>`（text/password/date/tel/datetime-local）が全フォームに散在。`<label>＋<input>` のペアも繰り返し。

- `LoginPage.tsx:51-62`
- `PasswordChangeModal.tsx:54-78`（label+input×3）
- `AnnouncementCreatePage.tsx:70-128`、`AnnouncementDetailPage.tsx:108-161`
- `TaskCreatePage.tsx:68-159`、`TaskDetailPage.tsx:135-205`
- `PatientCreatePage.tsx:54-122`（input×8）

→ 提案：`<Input>`（スタイル付き）＋ `<FormField label>{children}</FormField>`（label・エラーメッセージ枠を内包）。

### C. Button ＝ 既存 `ui/Button.tsx` への置き換え対象
`variant` 付き Button は作成済みだが、**実際に使われているのは `LoginPage.tsx:65` のみ**。他は全部素の `<button>`。

| variant | 該当する素のbutton |
|---|---|
| primary（作成/保存/変更/生成） | `AnnouncementCreatePage.tsx:130`, `AnnouncementDetailPage.tsx:163`, `TaskCreatePage.tsx:161`, `TaskDetailPage.tsx:220`, `PatientCreatePage.tsx:159`, `PasswordChangeModal.tsx:84`, `PatientDetailPage.tsx:168,175` |
| secondary（キャンセル/閉じる） | `AnnouncementDetailPage.tsx:164`, `TaskDetailPage.tsx:221`, `PasswordChangeModal.tsx:85` |
| danger（削除） | `AnnouncementCreatePage.tsx:143`, `AnnouncementDetailPage.tsx:177`, `TaskDetailPage.tsx:248` |
| 編集（neutral/secondary） | `AnnouncementDetailPage.tsx:176`, `TaskDetailPage.tsx:247` |

→ 不足バリエーションは「3.バリエーション数」を参照。`disabled` 状態（`PatientDetailPage.tsx:168,175`）の対応も必要。

### D. Card（Linkで包んだ箱）
3種が同じ構造（`<Link>` → `<div>` → タイトル＋メタ情報 span 群）。

- `src/components/TaskCard.tsx`（全体）
- `src/components/PatientCard.tsx`（全体）
- `src/components/AnnouncementCard.tsx`（全体）

→ 提案：汎用 `<Card>`（枠・余白・角丸・surface色・ホバー）を土台にし、各 XxxCard は中身だけ持つ形へ。

### E. List（カードを map するだけ）
3つともほぼ同一。`TaskList.tsx`, `PatientList.tsx`, `AnnouncementList.tsx`（いずれも全体）。
→ ジェネリック `<List items renderItem>` で一本化可能（ただし薄いので優先度は中）。

### F. FilterBar（select を並べた絞り込み行）
`src/components/TaskFilter.tsx`, `src/components/PatientFilter.tsx`。Select 共通化後は「Select を横並びにする器」として薄くできる。

### G. Tabs（カウント付き切替）
- `src/components/AnnouncementTabs.tsx`（未読/既読、inline style で太字切替）
- `PatientDetailPage.tsx:187-197`（すべて/カテゴリ別/マイタスク）

→ `<Tabs items activeKey onChange>` で共通化。

### H. Modal / Overlay
現状 1 箇所だが inline style で fixed オーバーレイを自前実装。今後 確認ダイアログ等で再利用必至。
- `src/components/PasswordChangeModal.tsx:37-48`（オーバーレイ＋中央パネル）
- 削除確認は現状 `window.confirm` 無しの即実行（`alert` のみ）→ 将来 `<ConfirmDialog>` 化候補。

→ 提案：`<Modal isOpen onClose>{children}</Modal>`（オーバーレイ＋パネル）。

### I. Badge / Tag ★トークンと相性最高
優先度・ステータス・カテゴリ・部署を**素の `<span>`** で色なし表示している。theme の `colors.semantic`（main/bg ペア）がまさにこの用途。

- 優先度: `TaskCard.tsx:16`, `AnnouncementCard.tsx:19`, `TaskDetailPage.tsx:229`, `AnnouncementDetailPage.tsx:173`
- ステータス: `TaskCard.tsx:15`, `TaskDetailPage`（select表示）, Kanbanの見出し `PatientDetailPage.tsx:248`
- カテゴリ/部署: `TaskCard.tsx:17`, `PatientCard.tsx:16`, `AnnouncementCard.tsx:17-18`, `AnnouncementDetailPage.tsx:171-172`

→ 提案：`<Badge tone="success|warning|danger|info|neutral">` ＋ `PriorityBadge` / `StatusBadge`（値→tone のマッピングを内包）。

### J. 変更履歴リスト（History）
お知らせとタスクで**完全に同一の描画**（changedAt / changedBy / fieldName / old→new）。
- `AnnouncementDetailPage.tsx:183-197`
- `TaskDetailPage.tsx:252-266`

→ `<HistoryList histories>` に共通化（型は `AnnouncementHistory`/`TaskHistory` を統一 or ジェネリック）。

### K. ナビゲーション / ヘッダー & ドロップダウンメニュー
`src/components/Navigation.tsx`。ユーザー名ボタン＋開閉メニュー（`:26-46`）は汎用 `<DropdownMenu>` に切り出せる。ヘッダー自体は theme の `brand.navy` を使うバー化候補。

### L. 状態表示（Loading / Empty）
同じ文言が散在。
- "読み込み中..."：`AnnouncementDetailPage.tsx:98`, `TaskDetailPage.tsx:128`, `PatientDetailPage.tsx:153,226`
- "〜ありません/タスクなし"：`DashboardPage.tsx:20`, `AnnouncementCreatePage.tsx:135`, `TaskDetailPage.tsx:255`, `PatientDetailPage.tsx:254` ほか

→ `<Loading>` / `<EmptyState message>` の小コンポーネント。

### M. ページ見出し＋作成リンク（PageHeader）
一覧3ページが「タイトル＋『◯◯作成』リンク」の同型。`TasksPage.tsx:18`, `PatientPage.tsx:36`, `AnnouncementsPage.tsx:34`。
→ `<PageHeader title action>` 候補（優先度低）。

## 2. それぞれのバリエーション数（目安）

| コンポーネント | 必要バリエーション |
|---|---|
| **Button**（既存・要拡張） | `primary` / `secondary` / `danger` は実装済。追加で **neutral（編集など中立操作）** と、できれば **link/ghost（タブ・テキストリンク風）**。状態は `disabled`、サイズは `md` 主体で当面 `sm`/`md` の2段あれば十分 |
| **Select** | スタイルは1種。中身で **PrioritySelect / TaskStatusSelect** の2固定ラップ＋汎用（任意options）の計3 |
| **Input** | type違い（text/password/date/tel/datetime-local）は1コンポーネントの `type` prop で吸収 → **実質1種**＋エラー表示状態 |
| **Badge** | tone **5種**：`success`(完了/LOW) / `warning`(MEDIUM/期限近) / `danger`(緊急/HIGH) / `info`(情報) / `neutral`(カテゴリ・部署)。＋ 値マッピング済の `PriorityBadge`・`StatusBadge` |
| **Card** | 土台1種（surface/hover）＋ 用途別ラッパー3（Task/Patient/Announcement） |
| **Modal** | 汎用1種＋ 派生 `ConfirmDialog`（OK/キャンセル）1 |
| **Tabs** | 1種（カウント表示は任意prop） |
| **List** | 1種（ジェネリック） |
| **FilterBar / PageHeader / HistoryList / EmptyState / Loading / DropdownMenu** | 各1種 |

## 3. 優先順位

### 土台（どのページでも使う・最優先）
theme のトークンを実際に効かせる入口になるもの。ここから着手すると全画面が一気に整う。

1. **Input** — 全フォームの素 `<input>` を置換（B）。
2. **Select**（＋ PrioritySelect / StatusSelect）— 最大の重複源（A）。これ一つで6ファイル以上が簡素化。
3. **Badge**（＋ Priority/StatusBadge）— theme.semantic を活かす最短ルート、視認性も上がる（I）。
4. **Card** — 一覧系3画面の見た目を統一（D）。
5. **Button 既存の全面適用 ＋ neutral/ghost 追加** — 既に有るのに未使用なので、置換だけで効果大（C）。
6. **Modal**（＋ ConfirmDialog）— 既存モーダルの整理＋削除確認の受け皿（H）。

### 専用（特定ページ/機能だけ・後回し可）
7. **HistoryList** — Detail 2ページのみ（J）。
8. **Tabs** — お知らせ一覧・患者詳細のみ（G）。
9. **FilterBar** — 一覧2ページのみ（F、Select共通化後は薄い）。
10. **KanbanBoard** — 現状 `PatientDetailPage.tsx:241-260` にローカル定義。患者詳細専用だが切り出しておくと再利用余地あり。
11. **DropdownMenu / PageHeader / EmptyState / Loading / List** — 薄いユーティリティ、手が空いたら。

### 着手順の推奨
`Input → Select(+Priority/Status) → Badge → Card → Button適用 → Modal` の順。
理由：(1) 使用頻度が高く、(2) theme トークンの適用が進み、(3) 各ページの JSX 行数が最も減るため。Detail系専用（History/Tabs/Kanban）は土台が固まってから。

> 注：既存 `ui/Button.tsx` と重複しないこと。Button は拡張（neutral/ghost 追加・全画面適用）の方針で、再作成はしない。
