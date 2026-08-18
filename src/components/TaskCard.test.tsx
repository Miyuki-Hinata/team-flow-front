import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { themeLight } from '../styles/theme'
import TaskCard from './TaskCard'
import { createMockTask } from '../test/factories/taskFactory'
import { createMockPatient } from '../test/factories/patientFactory'

// styled-components が theme を参照するため ThemeProvider で包むヘルパー。
// PatientCard.test / LoginPage.test / PasswordChangeModal.test と同じパターン。
const renderCard = (ui: React.ReactElement) =>
    render(
        <ThemeProvider theme={themeLight}>
            <BrowserRouter>{ui}</BrowserRouter>
        </ThemeProvider>
    )

describe('TaskCard', () => {

    it('タスクタイトルが表示される', () => {
        const task = createMockTask({ title: 'バイタル測定' })

        renderCard(<TaskCard task={task} />)

        expect(screen.getByText('バイタル測定')).toBeInTheDocument()
    })

    it('優先度とステータスが表示される', () => {
        const task = createMockTask({
            priority: 'HIGH',
            taskStatus: 'CREATED'
        })

        renderCard(<TaskCard task={task} />)

        // 今日のリファクタで、生の "HIGH" / "CREATED" ではなく
        // PriorityBadge / StatusBadge の日本語ラベルで表示するようになった
        expect(screen.getByText('優先度 高')).toBeInTheDocument()
        expect(screen.getByText('未着手')).toBeInTheDocument()
    })

    it('患者情報がある時に表示される', () => {
        // 部分オブジェクトの as any キャストではなく、ファクトリで完全な Patient を渡す
        // （lint の no-explicit-any 対応。型が正しいままテストの意図も読める）
        const task = createMockTask({
            patient: createMockPatient({ lastName: '山田', firstName: '太郎' })
        })

        renderCard(<TaskCard task={task} />)

        // 姓名は半角スペース区切り（アプリ全体で表記統一。以前は空文字連結で「山田太郎」と詰まっていたのを修正）
        expect(screen.getByText(/山田 太郎/)).toBeInTheDocument()
    })
})
