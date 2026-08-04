# Sidebar

## 何を作ったか
App Shell の左サイドバー（`src/layouts/Sidebar.tsx`）。ロゴ、5つのナビ項目、施設情報の3ブロック構成。現在地を `useLocation` で判定してアクティブ表示する。ナビ定義は `layouts/navItems.ts` に集約し、AppHeader（パンくず）と共有する。

## 構造（デザイン `TeamFlow.dc.html` 99–135行 準拠）
```
┌───────────────────┐
│ [■TF] TeamFlow    │  ← Brand（ロゴマーク＋名前）
│                   │
│ メニュー          │  ← NavHeading
│  🏠 ダッシュボード │  ← NavLink（アクティブ=teal 塗り）
│  👤 患者一覧      │
│  📢 お知らせ      │
│  ☰  全タスク      │
│  ✅ マイタスク    │
│                   │
│ ─────────────    │  ← Facility（区切り線＋施設情報）
│ さくら総合病院    │
│ 3F 内科病棟       │
└───────────────────┘
w:248, bg:#00072D, sticky, h:100vh
```

## なぜこの設計にしたか
- **ナビ定義を `navItems.ts` に集約**：Sidebar のナビ項目とヘッダーのパンくず（現在画面名）で同じ「パス⇔日本語ラベル」を使う。二重管理を避けるため、`NAV_ITEMS: { path, label }[]` として1箇所に定義した。追加/変更時はここだけ直せば両方に反映される（4問中の #4）。
- **アクティブ判定を「前方一致＋より具体を優先」で実装**：`pathname.startsWith(itemPath)` だけだと `/tasks/my-tasks` にいるときに `/tasks`（全タスク）も同時にアクティブ判定される。`NAV_ITEMS` の中に「より具体なパス」があってそれも一致するなら、当該項目は false 扱いにすることで、常に1項目だけが光る。
- **アクティブ状態は `$active`（transient prop）で表現**：DOM の `<a>` に `active` 属性が漏れないようにする（styled-components の作法）。アクティブ=`brand.teal` 塗り＋`text.onBrand`（白）＋強調、非アクティブ=`text.muted` の淡いグレー、というデザインの tabStyle 相当。
- **アイコンはインライン SVG で `stroke="currentColor"`**：親の `color`（アクティブ=白 / 非アクティブ=muted）を継承するため、色切替を SVG 側に持たせずに済む。外部アイコンライブラリ依存を追加しない（README §Assets）。
- **区切り線 `#1A2348` は直書きを許容**：README §Design Tokens に「サイドバー内の区切り線」として明示された値だが、暗背景専用のため通常の `border.default`（明背景用）では代用できず、theme トークンにも独立枠が無い。README の定義そのままの値なので暗背景専用として直書きで採用した（別途 theme に `colors.sidebarBorder` を追加する案もあるが、他所で使わないため今回は入れなかった）。
- **サイドバーはナビゲーションの単一責任**：ロゴ・ナビ項目・施設情報のみ。ユーザーメニューやモーダル起動は AppHeader 側に持たせる。

## 使用した theme トークン
- 色：`brand.navyDeep`（背景）/ `brand.teal`（ロゴマーク・アクティブ背景）/ `text.onBrand`（ロゴ名・アクティブ文字）/ `text.muted`（非アクティブ文字）/ `text.secondary`（メニュー見出し・施設情報）/ `border.strong`（サイドバー全体の既定文字色）
- 余白：`spacing.xl`（ブロック間 gap）/ `spacing.lg`（padding 縦）/ `spacing.md`（padding 横・見出し余白）/ `spacing.sm`（ブランド gap・ナビ padding・アイコン gap）/ `spacing.xs`（ナビ項目間）
- 角丸：`radius.md`（ロゴマーク・ナビ項目）
- 文字：`fontSize.lg` + `fontWeight.bold`（ブランド名）/ `fontSize.md`（ナビ項目）/ `fontSize.xs`（見出し・施設情報）
- 行間：`lineHeight.normal`（施設情報）

## 判断した点・申し送り（Q&A で確認済み）
- **オフキャンバス（レスポンシブ）は今回スコープ外**：lg 未満でのドロワー化＋ハンバーガーは後で実装予定として progress.md に控えた。
- **未読お知らせバッジは今回スコープ外**：件数取得の設計が別問題のため、後で実装予定。今回は「お知らせ」項目に赤丸バッジ枠を用意していない（追加時は NavLink 内 `margin-left:auto` の要素として足す想定）。
- **ダークモード切替は今回スコープ外**（ヘッダー側）。
- **施設情報は固定文言**：現状「さくら総合病院 / 3F 内科病棟」をハードコード。将来 `useAuth().currentUser` の所属情報から出す想定。
