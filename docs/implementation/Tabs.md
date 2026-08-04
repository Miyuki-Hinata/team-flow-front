# Tabs（セグメント風タブ切替）

## 何を作ったか
沈んだ面（surface.sunken）を器とし、アクティブなタブだけ白背景で浮き上がらせるセグメント UI。件数バッジ付きに対応。AnnouncementsPage の未読/既読タブと PatientDetailPage のタスクタブ（すべて/カテゴリ別/マイタスク）で共通利用する。

## なぜこの設計にしたか
- **ジェネリクス `<T extends string>`**：呼び出し側が具体的な union 型（`'unread' | 'read'` や `'all' | 'category' | 'my'` 等）を保ったまま `onChange` を受け取れる。any や string 型に落とさず、コンパイル時に typo を検出できる。
- **状態は呼び出し側で持つ（controlled）**：`activeValue` / `onChange` を受ける形にして、ページ側の `useState` と自然に繋がるようにした。Modal のような開閉状態内包パターンは使わない（アクティブタブはページのビジネスロジックと結びつくため）。
- **count は optional**：件数バッジは付けたい/付けたくないの両方に対応。undefined なら「(N)」自体を出さない。
- **items 配列で並び順を制御**：呼び出し側が items の順で表示順を決められる。並び替えロジックはコンポーネント側に置かない。
- **共通化による重複解消**：AnnouncementTabs と PatientDetailPage で同一の styled 定義が 2 箇所にあった重複を、`ui/Tabs.tsx` 1 箇所に集約。将来スタイルを変えたい時の修正箇所も 1 箇所に。
- **薄いラッパ AnnouncementTabs を残した理由**：件数計算などのドメイン固有ロジックを Tabs 側に持ち込まないため。ドメインラッパ層を介することで、Tabs は純粋な UI に留まる。

## どのお手本に倣ったか
- **PatientCard.tsx / AISummaryCard.tsx**：`type ○○Props = {...}` の分割代入で受け取る流儀。表示のみに責務を絞る単一責任。
- **AnnouncementTabs.tsx（既存）**：セグメント風の見た目（沈んだ面の器 + アクティブ白）と `$active` transient prop の書き方をそのまま踏襲・共通化。

## 使用した theme トークン
- `colors.surface.sunken` — 器の背景（沈んだ面）
- `colors.surface.raised` — アクティブタブの背景（白）
- `colors.text.primary` / `.secondary` — アクティブ/非アクティブの文字色
- `spacing.xs` / `.sm` / `.md` — 器のパディングとタブ間の間隔
- `radius.md` / `.sm` — 器（8px）と内側タブ（4px）の入れ子な角丸
- `fontSize.sm` / `fontWeight.bold` — タブ文字
