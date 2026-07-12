import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { themeLight } from '../styles/theme'
import TaskCard from './TaskCard'
import { createMockTask } from '../test/factories/taskFactory'

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
        const task = createMockTask({
            patient: {
                id: 1,
                lastName: '山田',
                firstName: '太郎'
            } as any
        })

        renderCard(<TaskCard task={task} />)

        // 姓名の連結は元コードどおり `+ '' +`（スペースなしで詰まる）を温存中
        expect(screen.getByText(/山田太郎/)).toBeInTheDocument()
    })
})
