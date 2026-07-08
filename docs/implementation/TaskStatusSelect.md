# TaskStatusSelect

## 何を作ったか
タスクのステータス（CREATED / PROGRESS / REVIEWING / DONE）専用のセレクト（`src/components/ui/TaskStatusSelect.tsx`）。汎用 `Select` をラップし、ステータスの選択肢を内部で固定する薄いコンポーネント。

## なぜこの設計にしたか
- **汎用 Select のラッパーにした**：見た目・`<option>` 描画・属性転送は Select が担うため、TaskStatusSelect は「ステータスという意味づけ（固定 options）」だけを足す薄い層にした。PrioritySelect と同じ構造。
- **値の型を `types/task.ts` の `TaskStatus` から import**：ステータスの値の正典はドメイン型。独自再定義でズレるのを避ける。
- **ラベルは表示コンポーネント `StatusBadge` と同一表記に揃えた**（未着手 / 進行中 / レビュー待ち / 完了）：同じステータスがバッジとセレクトで別表記になるとユーザーが混乱するため、アプリ全体で表記を統一する。※既存の素の `<select>` には「レビュー中」表記も混在していたが、キュレーション済みの StatusBadge 側（「レビュー待ち」）に合わせた。
- **options を「型を元にした map」で生成**：`TaskStatus` を配列とラベル表（`Record<TaskStatus, string>`）の土台にし、値の増減に型で追従できるようにした。
- **並び順は作業フロー順（未着手→進行中→レビュー待ち→完了）**：業務の進み方と一致させ、選びやすくした。
- **placeholder を独自 props で追加**：`<select>` は placeholder 属性を持たないため任意 props として足し、Select に流す。
- **単一責任**：ステータスの「意味づけ」だけを担う。

## どのお手本に倣ったか
- **Select.tsx**：ラップして `{...rest}` を転送する構成。
- **StatusBadge.tsx**：値→ラベルの対応表（`Record`）を内包する意味づけパターン。ラベル文言もここに合わせた。
- **PrioritySelect.tsx**：同時に作った兄弟コンポーネントと構造を完全に揃えた。

## 使用した theme トークン
直接は使わない（見た目は汎用 `Select` に委譲）。→ Input / Select と同一の見た目。

## 面接で説明できるポイント
- **表記の一元化**：Badge とラベルを揃えることで、UI 全体での用語の一貫性を保つ判断。「レビュー中／レビュー待ち」のような表記ゆれをどちらに寄せたか、根拠つきで説明できる。
- **型駆動 options**：ドメイン型 `TaskStatus` を単一の出所にして、選択肢・ラベルの整合を型で担保。
- **兄弟コンポーネントの一貫性**：PrioritySelect と構造・書き味を揃え、読み手が両者を同じ型として理解できるようにした。
