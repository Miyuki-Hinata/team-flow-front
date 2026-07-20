# Toast（トースト通知）

## 何を作ったか
`alert()` を代替する、画面右上に一時表示されるトースト通知の仕組み（Context + Provider + カスタムフック + 見た目）。

## なぜこの設計にしたか
- **Context を選んだ理由**：呼び出し側は `useToast()` 一発でどのページからでも通知を出せる。トーストの表示コンテナ（DOM）はアプリに1つあれば十分なので、Provider がその責務を持つ。
- **命令的な API（`toast.success('...')`）**：Modal と違い、通知は「呼んだら出て消える」流れが自然。宣言的（isOpen state を各画面で持つ）にすると呼び出し側の記述量が増えるのでシンプルな命令的にした。
- **type を絞る（success / error / info）**：意味色の一貫性を守るため。任意の色を渡せる API にすると色の意味がぶれる。
- **自動消去 3.2秒**：短すぎると読めず、長すぎると邪魔になる。3〜4秒あたりが業界標準。
- **`pointer-events: none` をコンテナに**：背後の操作を邪魔しないため。個別カードだけ `pointer-events: auto` で受ける。
- **クリックで即消える**：ユーザーがすぐ消したいときの UX。

## どのお手本に倣ったか
- **Modal.tsx**：`isOpen` / `onClose` を持ち、コンポーネント自身が表示判断する分離パターン → トーストも状態を Provider 内に閉じ、外からは命令だけ渡す形にした。
- **AISummaryCard.tsx**：props を `type ○○Props = {...}` で型定義し分割代入で受ける流儀に揃えた。
- **theme トークンのみで色を引く**：ハードコード禁止のルールに従い、`semantic.success / danger / info` を tone マッピングで参照。

## 使用した theme トークン
- `colors.semantic.success.main` / `.danger.main` / `.info.main` — 左端の tone ストリップ色
- `colors.surface.raised` — カード背景（白）
- `colors.text.primary` — 本文文字色
- `spacing.md` / `.lg` / `.sm` — パディングと配置間隔
- `radius.md` — 角丸
- `fontSize.sm` — 本文サイズ
- `lineHeight.normal` — 行間

## 面接で説明できるポイント
- **Provider パターンで DOM を 1 箇所に集約**：トーストが呼ばれる場所と描画される場所を分離。個別ページに描画責務を持たせない。
- **`pointer-events` の使い分け**：`fixed` オーバーレイが背後の操作を邪魔しないためのテクニック（コンテナ透過・カード受付）。
- **API の粒度設計**：`showToast(type, message)` ではなく `toast.success(message)` にした理由は「呼び出し側の意図（成功/失敗）が読み取りやすい」。
- **アニメーション**：`keyframes` で右からスライドイン。styled-components の `keyframes` API を活用。
- **ID 生成**：`Date.now() + Math.random()` で同一ミリ秒での衝突を避け、React key の warning を防いでいる。
