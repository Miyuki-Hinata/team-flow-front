# PatientPage（ページ整備）

## 何を作ったか
`src/pages/PatientPage.tsx` の整備。素の `<div>` / `<Link>` を土台コンポーネント（`PageHeader` / `Button`）に置き換えた。ページ本体はフィルタと一覧をまとめた `PatientListContainer` に委ね、PatientPage 自身はデータ取得＋ヘッダー＋Container の組み立てに責務を絞る。

## 何を何に置き換えたか
| 旧 | 新 | 補足 |
|---|---|---|
| `<Link to="/patients/create">患者作成</Link>`（素） | `PageHeader.action` に `<Button variant="primary">患者を追加</Button>`＋`useNavigate` | 素のリンクからボタンへ格上げ・デザインの緑塗り button に対応 |
| ヘッダー無し | `PageHeader title="患者一覧" subtitle="全 N 名"` | 一覧共通ヘッダーを適用 |
| 器の `<div>` | そのまま（レイアウトは PageHeader ＋ Container で完結） | 追加の器不要 |

## なぜこの設計にしたか
### PageHeader の subtitle は「全 N 名」だけ
デザイン（`TeamFlow.dc.html` 262行）では `{{ totalLabel }}` に「全 N 名・緊急 N 名」のように**状態別内訳**が出る想定だが、`Patient` 型に `status`（緊急/経過観察/安定/情報）フィールドが**現状無い**（`types/patient.ts` 参照）。**ドメインモデルの拡張が必要な新規機能**なので今回は別Issue。全患者数だけならコスト小さく実装可能なので、`patients.length` で軽く subtitle を出す。

### 「患者を追加」ボタンは `<Button onClick={navigate}>` パターン
`useNavigate()` を使って onClick で遷移。既存 `AppHeader.tsx` のパスワード変更モーダル起動と同じパターンで、Button を Link 化するのではなく Button の onClick で遷移させることで、`ui/Button` の見た目（primary variant = 緑塗り）をそのまま活かせる。Link を styled 継承して Button 風にする案もあるが、Button コンポーネントの variant システムを二重に持つことになるので不採用。

### PatientListContainer の中身は触らない
リファクタ済みの `PatientListContainer` / `PatientFilter` / `PatientList` がそのまま活きる。ページ側は「何を渡すか」だけ管理する薄い層で OK。

## スコープ外にした項目（別Issue候補）
デザインには以下があるが、いずれも**新規機能・ドメイン拡張が必要**なので今回は入れない：
- **患者名検索 input**（`TeamFlow.dc.html` 271行）：現状 `PatientFilter` に無い（部署・担当医セレクトのみ）。追加すると PatientFilter の型・フィルタロジック拡張が必要
- **状態 Select**（緊急/経過観察/安定/情報）：Patient.status フィールドが無いためドメイン拡張が必要
- **緊急 N 名 サブテキスト**：同上
- **状態別セクション分け**（緊急/経過観察/安定・その他）：同上

これらは **「患者データモデル拡張 + 検索・状態フィルタ実装」の Issue** として1つにまとめるのが望ましい。progress.md に申し送り予定。

## 挙動を維持するために気をつけた点
- **データ取得（`useState` × 2、`useEffect` で2つ並行 fetch）は不変**
- **担当医の抽出ロジック**（Map で `doctor.id` をキーに重複排除）は完全にそのまま。可読性のため位置は変えず、コメントだけ追加
- **`/patients/create` への遷移先は不変**
- **default export のまま**維持

## 使用した theme トークン
- 直接は使わない（レイアウトはすべて PageHeader / PatientListContainer / Button に委譲）

## 判断した点・申し送り
- **PatientPage 本体は「薄い層」に**：データ取得＋ヘッダー＋Container のみ。フィルタ・リスト表示・カード見た目は全部下位に委譲。責務分割が明快。
- **subtitle は現状「全 N 名」のみ**：デザインの「緊急 N 名」を出すには Patient に status を追加する必要あり。別Issue で対応推奨。
