---

## テスト戦略

### テストツール
- **テストランナー**: [Vitest](https://vitest.dev/)
- **コンポーネントテスト**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- **マッチャー**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- **ユーザー操作シミュレーション**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro)

### 設計方針

#### 1. ユニットテストに集中
各コンポーネントの動作のみをテストし、依存先（API、Context、Router）はモック化する設計。

```typescript
// 例：useAuth のモック化
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        setCurrentUser: vi.fn(),
        currentUser: null,
        isLoading: false,
    })
}))
```

メリット：
- テストの実行が高速
- 失敗時の原因特定が容易
- 結果が再現可能

#### 2. アクセシビリティ視点でのテスト
要素の取得には `getByText` ではなく `getByRole` を優先使用。
スクリーンリーダーが認識する構造と一致したテストを実現。

```typescript
// 推奨
screen.getByRole('button', { name: 'ログイン' })

// 非推奨（同一テキストが複数あると失敗）
screen.getByText('ログイン')
```

#### 3. ファクトリパターンによるモックデータ管理
`Partial<T>` を活用し、デフォルト値 + 必要な上書きパターンで保守性を確保。

```typescript
// src/test/factories/taskFactory.ts
export function createMockTask(overrides?: Partial<Task>): Task {
    return {
        id: 1,
        title: 'デフォルトタスク',
        // ...デフォルト値
        ...overrides,
    }
}

// 使用例
const task = createMockTask({ title: 'バイタル測定', priority: 'HIGH' })
```

メリット：
- テストごとに必要なフィールドだけ上書き
- Task 型変更時の修正箇所が1か所
- 型安全（`Partial<T>` による型チェック）

#### 4. 正常系と異常系の両方をテスト

```typescript
// 正常系：API成功時の動作
vi.mocked(login).mockResolvedValue({ token: 'fake-token' })

// 異常系：API失敗時のエラー表示
vi.mocked(login).mockRejectedValue(new Error('認証失敗'))
```

### テストカバレッジ（現状）

| コンポーネント | テスト数 | 内容 |
|---------------|---------|------|
| TaskCard | 3 | 表示テスト |
| PatientCard | 3 | 表示テスト |
| LoginPage | 4 | 表示・入力・成功シナリオ・失敗シナリオ |
| PasswordChangeModal | 4 | 表示・バリデーション×2・正常系 |

### テスト実行

```bash
npm test           # watch モードで実行
npm run test:ui    # UI モードで実行
npm run coverage   # カバレッジレポート生成
```

### 今後の展望

- [ ] PatientDetailPage の統合テスト
- [ ] PrivateRoute の認証ロジックテスト
- [ ] AnnouncementCard、AnnouncementForm のテスト
- [ ] E2E テスト（Playwright 等）の導入検討

### テストレイヤーの理解

このプロジェクトでは現時点でユニットテストに集中しているが、本番運用では以下の階層的なテスト戦略が望ましいと認識している：

- **ユニットテスト** (本リポジトリで実装中)
  - 単一コンポーネントの動作検証
- **統合テスト** (将来実装予定)
  - 複数コンポーネント・実APIの組み合わせ
- **E2Eテスト** (将来実装予定)
  - ブラウザ操作による本番に近い検証