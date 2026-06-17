import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TaskCard from './TaskCard'
import { createMockTask } from '../test/factories/taskFactory'

describe('TaskCard', () => {
    
    it('タスクタイトルが表示される', () => {
        const task = createMockTask({ title: 'バイタル測定' })
        
        render(
            <BrowserRouter>
                <TaskCard task={task} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('バイタル測定')).toBeInTheDocument()
    })
    
    it('優先度とステータスが表示される', () => {
        const task = createMockTask({ 
            priority: 'HIGH', 
            taskStatus: 'CREATED' 
        })
        
        render(
            <BrowserRouter>
                <TaskCard task={task} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('HIGH')).toBeInTheDocument()
        expect(screen.getByText('CREATED')).toBeInTheDocument()
    })
    
    it('患者情報がある時に表示される', () => {
        const task = createMockTask({
            patient: { 
                id: 1, 
                lastName: '山田', 
                firstName: '太郎' 
            } as any
        })
        
        render(
            <BrowserRouter>
                <TaskCard task={task} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('山田太郎')).toBeInTheDocument()
    })
})