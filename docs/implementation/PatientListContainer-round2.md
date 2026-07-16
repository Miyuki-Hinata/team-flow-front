# PatientListContainer（フィルタバー枠の追加）

## 何を作ったか
`src/components/PatientListContainer.tsx` に `Card` を1階層追加し、フィルタバー（`PatientFilter`）を白カード枠で囲んだ。デザイン（`TeamFlow.dc.html` 270行）の「白背景・薄い枠線・角丸12px・padding 16px」の枠に一致。

## 変更内容
```diff
- <PatientFilter ... />
+ <Card>
+     <PatientFilter ... />
+ </Card>
  <PatientList ... />
```

## なぜこの設計にしたか
### 既存の `ui/Card` をそのまま流用できた
`ui/Card` は `padding: spacing.md（16px）` / `border-radius: radius.lg（12px）` / `background: surface.raised` / `border: 1px solid border.default` を持つ。**デザインのフィルタバー枠の値と完全一致**するため、追加スタイルは1つも書かず、Card でラップするだけで済んだ。トークン厳守・DRY・単一責任のすべてを満たす。

### PatientFilter 自体は変更しない
「枠を持たせるか否か」はコンテナ（呼び出し側）の責任と判断。PatientFilter 単体では枠を持たず、包む側が必要に応じて Card 等でラップする方針。将来モーダル内で PatientFilter を使う場面が来ても、枠なしで置ける。

## 挙動を維持するために気をつけた点
- **フィルタ state・絞り込みロジック・子への props はすべて不変**
- props インターフェース不変（`patients` / `departments` / `doctors`）
- default export のまま維持

## 使用した theme トークン
- 直接は使わない（Card にすべて委譲）

## 面接で説明できるポイント
- **既存土台の再利用**：フィルタ枠の値がたまたま Card トークンと一致 → 新たに styled を作らずに済んだ。「デザインとトークンが整合していれば、再利用性が自然に高まる」ことの実例。
- **枠を持つ／持たないの責任分割**：`PatientFilter` は素の中身だけを持ち、包む側（Container）が用途に応じて枠を付ける／付けないを決める設計判断。
