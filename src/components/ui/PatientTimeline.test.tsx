import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { themeLight } from '../../styles/theme'
import { PatientTimeline } from './PatientTimeline'
import type { Task } from '../../types/task'
import { createMockTask } from '../../test/factories/taskFactory'
import { createMockPatient } from '../../test/factories/patientFactory'

// dueDate はタイムゾーン無しのローカル日時文字列（バックエンドの LocalDateTime と同形式）。
// 実行日に依存しないよう「今日/昨日の指定時刻」を動的に組み立てる。
const pad = (n: number) => String(n).padStart(2, '0')
const localIso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
const todayAt = (h: number, m = 0) => {
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return localIso(d)
}
const yesterdayAt = (h: number) => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(h, 0, 0, 0)
    return localIso(d)
}

// 遷移先を観測するためのプローブ（現在の pathname を DOM に出す）
const LocationProbe = () => {
    const location = useLocation()
    return <div data-testid="loc">{location.pathname}</div>
}

// PatientTimeline は「どの日を表示するか」を props で受け取る（向こう1週間の日付切替）。
// テストは todayAt/yesterdayAt で今日視点のタスクを組むため、既定の表示日も「今日」に揃える。
// ルータは MemoryRouter：遷移先を LocationProbe で観測しつつ、jsdom の履歴をテスト間で汚さないため。
const renderTimeline = (tasks: Task[], date: Date = new Date()) =>
    render(
        <ThemeProvider theme={themeLight}>
            <MemoryRouter initialEntries={['/my-patients']}>
                <PatientTimeline tasks={tasks} date={date} />
                <LocationProbe />
            </MemoryRouter>
        </ThemeProvider>
    )

describe('PatientTimeline', () => {
    it('期限超過も本日タスクも無ければ空表示を出す', () => {
        renderTimeline([])
        // 表示日が today のときの空メッセージ（別日を選ぶと「この日の〜」に変わる）
        expect(screen.getByText('本日のタスクはありません')).toBeInTheDocument()
    })

    it('期限が今日より前の未完了タスクは「期限超過」セクションに出る', () => {
        const overdue = createMockTask({ id: 1, title: '点滴交換', dueDate: yesterdayAt(16), taskStatus: 'CREATED' })
        renderTimeline([overdue])

        expect(screen.getByText(/期限超過/)).toBeInTheDocument()
        expect(screen.getByText('点滴交換')).toBeInTheDocument()
    })

    it('完了済み(DONE)の過去タスクは期限超過に出さない', () => {
        const doneOverdue = createMockTask({ id: 2, title: '完了済みケア', dueDate: yesterdayAt(9), taskStatus: 'DONE' })
        renderTimeline([doneOverdue])

        // 期限超過にも本日にも該当しない → 空表示
        expect(screen.getByText('本日のタスクはありません')).toBeInTheDocument()
        expect(screen.queryByText('完了済みケア')).not.toBeInTheDocument()
    })

    it('本日のタスクはカードで表示され、タイムライン見出しが出る', () => {
        const task = createMockTask({ id: 3, title: 'リハビリ付き添い', dueDate: todayAt(10, 0) })
        renderTimeline([task])

        // 見出しは日付切替の導入で「タイムライン」に統一された（どの日を見ているかは呼び出し側の日付UIが示す）
        expect(screen.getByText('タイムライン')).toBeInTheDocument()
        expect(screen.getByText('リハビリ付き添い')).toBeInTheDocument()
    })

    it('タスクの無い時間は1時間おきの目盛りが出る（空き時間の可視化）', () => {
        // 10時にだけタスク → 9時は空き目盛りとして表示される
        const task = createMockTask({ id: 4, title: '検温', dueDate: todayAt(10, 0) })
        renderTimeline([task])

        expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    it('同時刻に2件以上あると「同時刻 N件」の囲みでまとまる', () => {
        const a = createMockTask({ id: 5, title: '採血', dueDate: todayAt(10, 0) })
        const b = createMockTask({ id: 6, title: '与薬', dueDate: todayAt(10, 0) })
        renderTimeline([a, b])

        expect(screen.getByText(/同時刻/)).toBeInTheDocument()
        expect(screen.getByText('採血')).toBeInTheDocument()
        expect(screen.getByText('与薬')).toBeInTheDocument()
    })

    it('タスクが1件だけの時刻は「同時刻」の囲みを付けない', () => {
        const task = createMockTask({ id: 7, title: '単発ケア', dueDate: todayAt(13, 0) })
        renderTimeline([task])

        expect(screen.queryByText(/同時刻/)).not.toBeInTheDocument()
    })

    it('タスクカードをクリックするとタスク詳細へ遷移する', () => {
        const task = createMockTask({ id: 42, title: 'ガーゼ交換', dueDate: todayAt(10, 0) })
        renderTimeline([task])

        // カード内のタイトルをクリック → 親カード(role=link)の onClick で /tasks/42 へ
        fireEvent.click(screen.getByText('ガーゼ交換'))
        expect(screen.getByTestId('loc')).toHaveTextContent('/tasks/42')
    })

    it('患者名ピルをクリックすると患者詳細へ遷移する（タスク遷移は発火しない）', () => {
        const patient = createMockPatient({ id: 77, lastName: '佐藤', firstName: '花子' })
        const task = createMockTask({ id: 43, title: '清拭', dueDate: todayAt(10, 0), patient })
        renderTimeline([task])

        // 患者名ピルをクリック → stopPropagation で /patients/77 のみ
        fireEvent.click(screen.getByText('佐藤 花子'))
        expect(screen.getByTestId('loc')).toHaveTextContent('/patients/77')
    })
})
