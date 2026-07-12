# AppLayout（App Shell 再実装）

## 何を作ったか
App Shell の最上位レイアウト（`src/layouts/AppLayout.tsx`）を再実装した。旧実装は素の `<div flex><Navigation/><Outlet/></div>` だけだったが、README §App Shell とデザインどおりに **Sidebar ＋ AppHeader ＋ Main(Outlet)** を組み立て、ページ背景・最大幅コンテナ・スクロール挙動を整えた。旧 `components/Navigation.tsx` は責務が Sidebar/AppHeader に完全移管されたため**削除**した。

## 構造
```
┌─Shell(min-h:100vh, bg:surface.base)──────────┐
│┌────────┐┌─MainColumn (flex:1, col)─────────┐│
││Sidebar ││ AppHeader (sticky, h:64)         ││
││(sticky)│├──────────────────────────────────┤│
││ w:248  ││ Main (padding:xl, overflow:auto) ││
││ h:100vh││   Container (max-w:1080, center) ││
││        ││     <Outlet /> ← 各ページ         ││
│└────────┘└──────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

## なぜこの設計にしたか
- **Shell = 横並び・min-height:100vh・ページ背景**：Sidebar が sticky で 100vh を占めるので、外側も少なくとも 100vh 必要。背景を `surface.base`（#F7F8FA）にしたことで、これまで暗いだけだった画面全体がデザインの「ほんのり灰色」に変わる（ユーザー報告のあった乖離の主因）。
- **MainColumn に `min-width: 0`**：フレックス子要素の定石。長いテーブルや幅の広いカードが横にはみ出さないよう、min-width の暗黙の `auto` を明示的に 0 に上書きする。これを付けないと、まれに横スクロールが発生する。
- **Main に `overflow: auto`**：Main だけが縦スクロールする。ヘッダーとサイドバーは `sticky` で画面に残る。ページを長くしても、ナビとヘッダーは常に見える設計。
- **Container で max-width:1080**：README §Design Tokens「本文コンテンツの最大幅：1080px」を反映。中央寄せ（`margin: 0 auto`）で大画面でも本文が広がりすぎない。1080px はトークンに無い値だが、README で明示されたレイアウト定数なのでここで直書きで採用した（`spacing` などの汎用トークン体系には属さないため theme 化しないで済ませた）。
- **旧 Navigation の削除**：責務は Sidebar（ナビ項目）と AppHeader（ユーザーメニュー・ログアウト・パスワード変更起動）に完全移管された。ファイルを残すと「どっちが本物？」の混乱を招くので削除。参照は AppLayout の import 1箇所のみだったので安全に消せた。

## 挙動を維持するために気をつけた点
- **ページのマウント順は不変**：`<PrivateRoute><AppLayout /></PrivateRoute>` の子として `<Outlet />` が差し込まれる。旧実装と同じルーティング階層。
- **認証・ログアウトのロジック損失なし**：旧 Navigation の `useAuth` / `logout()` / `PasswordChangeModal` 起動は AppHeader に完全移植済み（`docs/implementation/AppHeader.md` 参照）。

## 使用した theme トークン
- 色：`surface.base`（ページ背景）
- 余白：`spacing.xl`（Main の padding = 32px）
- ※Sidebar / AppHeader が持つ他のトークンは各 doc 参照

## 判断した点・申し送り
- **`max-width:1080px` は AppLayout に固定**：README §Screens で「フォーム系画面は 760px、タスク詳細/編集は 880px」と個別最大幅が指定されているが、それらは各ページ内で自前の Container を持たせて絞る想定（AppLayout の 1080 は上限）。今回は AppLayout の共通値のみ入れた。
- **md 未満で Main の padding を 16px に絞る**：README §レスポンシブに記載あり。オフキャンバス実装と一緒に別Issueで対応する予定（progress.md にスコープ外明記済み）。今回は PC 幅の 32px 固定。
- **旧 Navigation 削除の副作用は無し**：AppLayout 内の import を Sidebar/AppHeader に置き換え済みで、他ファイルからの参照は無かった（`grep -rn Navigation src/` で確認）。

## 面接で説明できるポイント
- **App Shell を3層に分けた**：Shell（全体の器・背景）／MainColumn（縦配列の中間層）／Main+Container（本文の余白と最大幅）。責務を分けたことで、レスポンシブ（Main の padding だけ変える等）や、フォーム画面の Container 幅上書きが差し込みやすくなる。
- **sticky と overflow の組み合わせ**：Sidebar と Header を sticky にしたいなら、スクロールを Main だけに閉じ込めるのが定石。ページ全体を `overflow:auto` にしてしまうと sticky の効果が失われる。
- **`min-width: 0` は flex コンテナの隠れバグ対策**：フレックス子要素の初期 `min-width: auto` が原因で子コンテンツの実幅にフレックスが引っ張られる、というよくある落とし穴を潰した。
- **削除の判断**：責務を移管したら参照を確認して迷わず消す。「残しておく」は将来の混乱の温床。
