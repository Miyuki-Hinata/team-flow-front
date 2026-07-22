# 受け持ち患者ビュー 実装進捗管理

このファイルは **新機能「受け持ち患者ビュー」** の進捗を管理する。
Issue #18（UI整備）とはスコープが異なる新機能のため、`docs/progress.md` とは分けて管理する。
（#18 の progress.md は「既存の素の要素を共通コンポーネントに置換する」ことに特化しており、新機能を混ぜると追跡が濁るため）

チェックの付いた項目は「完了」。**バックエンド → フロント（土台 → 上位）** の順で1つずつ進める。

---

## 機能概要

スタッフがシフト開始時に「受け持ち患者」を選び、その患者にフォーカスして1日働く実務フローを再現する。
普通のタスク管理アプリとの差別化ポイント。

- **受け持ち = standing assignment**：朝固定ではない（シフト制）。クリア/再選択するまで維持される。
- **MyTasks との棲み分け**：MyTasks＝タスク起点（自分にアサインされたタスクを患者で束ねる）。MyPatients＝患者起点（自分が選んだ患者にフォーカスし、その患者の全タスク＋情報＋タイムラインを見る）。統合せず相互リンク。

---

## 確定した設計判断

| 論点 | 決定 | 理由 |
|---|---|---|
| 保存先 | **DB（新テーブル）** | 「ログイン維持」要件＝ユーザー識別。localStorage は端末縛りで別端末で消える。業務データとして正しい。 |
| 永続化の単位 | **standing assignment** | シフト制なので「朝の today」ではない。クリア/再選択まで維持。`assigned_date` は持たず、将来拡張余地として残す。 |
| API 粒度 | **一括PUT（集合置換・冪等）** | リトライ安全・部分失敗が生まれない・「まとめて選んで確定」UXに一致。1件ずつPOSTは却下。 |
| ルート | **`/my-patients` 新設** | Dashboard は俯瞰、これは作業ホーム。Dashboard には導線ウィジェットのみ置く。 |
| タイムライン | **縦・24時間表示** | モバイル対応◯・タスク数に強い。期限超過は時間軸に混ぜず軸上部の独立セクションに赤で強調。 |

---

## バックエンド（別リポジトリ team-flow）

- [ ] `UserPatientAssignment` エンティティ（`user_id`, `patient_id` 複合PK, `created_at`）
- [ ] `UserPatientAssignmentRepository`
- [ ] `GET  /api/me/assigned-patients` → `Patient[]`（認証プリンシパルから user を引く）
- [ ] `PUT  /api/me/assigned-patients`（body `{ patientIds: number[] }` で集合を丸ごと置換。空配列＝クリア）
- [ ] （任意）DTO / マッピング整備

---

## フロント：コンポーネント（土台 → 上位の順）

- [x] **#1 `api/assignments.ts`** — 型付きAPI契約（GET/PUT）。既存 `api/*.ts` に揃える。→ `docs/implementation/assignments-api.md`
- [x] **#2 `Checkbox`（UI土台・新規）** — `Input`/`Select` の書き方に揃える。複数選択の基礎。→ `docs/implementation/Checkbox.md`
- [x] **#3 `SelectablePatientCard`** — `PatientCard`（表示のみ）＋ `Checkbox` の合成。選択状態は呼び出し側の責任。PatientCard は改変しない。→ `docs/implementation/SelectablePatientCard.md`
- [x] **#4 `AssignmentPicker`（Modal）** — 部署フィルタ＋複数選択＋一括保存。`Modal` ＋ `PatientFilter` のパターンを踏襲。→ `docs/implementation/AssignmentPicker.md`
- [ ] **#6 `PatientTimeline`** — 縦・24時間タイムライン。今日の `dueDate` タスクを配置。期限超過は上部の独立セクション。表示のみ（stateなし）で `PatientCard` に倣う。
- [x] **#7 Dashboard 導線ウィジェット** — Dashboard の「担当患者」サマリカードを「受け持ち患者」（人数→`/my-patients`）に置換して達成。「担当患者（タスク由来）」と「受け持ち患者（明示選択）」の名前の紛らわしさも解消。

## フロント：ページ

- [x] **#5 `MyPatientsPage`（`/my-patients`）** — 選択済みビュー。`PatientCard` 一覧＋クリア（`ConfirmDialog`）＋ picker 起動。未選択時は EmptyState＋「受け持ちを選択」CTA。`App.tsx` にルート追加。→ `docs/implementation/MyPatientsPage.md`

---

## 実機確認後の追加修正（2026-07-23）

- [x] **サイドバーに「受け持ち患者」項目を追加** — `navItems.ts` に `/my-patients` を追加、`Sidebar.tsx` に人＋ハートのアイコンを追加。マイタスクの次に配置。
- [x] **Picker の部署フィルタ初期値をログインユーザーの所属部署に** — `AssignmentPicker` で `useAuth()` の `currentUser.departmentId` を初期値に（未所属なら「すべて」）。`UserResponse` は部署単一モデルのため「複数あれば最初の一つ」は departmentId 一択に帰着。
- [x] **Dashboard「担当患者」→「受け持ち患者」に置換** — #7 と同一対応（上記参照）。

## 再利用する既存部品

`PatientCard`（表示のみ・お手本）/ `PatientFilter`（部署フィルタ）/ `Modal` / `ConfirmDialog` / `Select` / `FilterBar` / `EmptyState` / `PageHeader` / `Button` / `Loading`。

## 各実装後にやること（CLAUDE.md §3）

各コンポーネント実装後に `docs/implementation/<コンポーネント名>.md` を作成し、このファイルの該当項目にチェックを入れて一旦停止・報告する。
