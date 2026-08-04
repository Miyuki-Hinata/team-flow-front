# ThemeModeContext（ライト / ダークモード切替）

## 何を作ったか
`theme.ts` に用意されていた `themeLight` / `themeDark` を実際に切り替えられるようにする Context Provider。ユーザーメニューのトグルから即時切替でき、選択は localStorage に永続化される。

## なぜこの設計にしたか
- **styled-components の ThemeProvider を内部で包む**：アプリ側は `<ThemeModeProvider>` 1 つで済む。theme オブジェクトの受け渡しを App / main / 各画面に一切書かせない。
- **`mode` / `setMode` / `toggle` の 3 API**：ラジオ UI・トグルボタン・アイコン単体、いずれの UI にも対応できるように使い分ける口を用意。
- **localStorage 永続化**：`useEffect(() => { localStorage.setItem(...) }, [mode])` のシンプルな片方向書き込み。読み込みは `useState` の初期化関数で 1 回だけ。SSR 想定はないが `typeof window === 'undefined'` の防御は入れておく（保険）。
- **システム設定（`prefers-color-scheme`）に追随しない**：明示切替のみとした。医療現場は端末を共有するケースもあり、ユーザーごとの明示的意思をアプリに残す方が予測しやすいという判断。
- **絵文字は使わない**：CLAUDE.md ルールに準拠。「ダークモードに切替」「ライトモードに切替」のテキストのみで意図を伝える。
- **API を `useMemo` で固定**：value オブジェクトの参照を安定させ、Consumer 側の不要な再レンダーを避ける定石。
- **`ThemeMode = 'light' | 'dark'` の union 型**：文字列型より意図が伝わり、typo をコンパイル時に検出できる。
- **localStorage キーの名前空間**：`teamflow.themeMode` のようにアプリプレフィックスを付けて、他アプリと共存する場面で衝突を避ける（同一オリジンで複数アプリを動かすケースを想定）。

## どのお手本に倣ったか
- **ToastContext.tsx**：Provider + useXxx フック + Context の三点セットの構成。Provider 外で呼ばれた時に明確にエラーで落とす防御的な useHook 実装も同じ。
- **AuthContext.tsx**：状態は自分で持ち、外からは API を通じて操作させる設計方針。

## 使用した theme トークン
本ファイル自身は theme トークンを直接は使わない（テーマそのものを切り替える立場）。ダーク切替時に見た目に反映されるトークンは `themeDark.colors.*` に集約。
