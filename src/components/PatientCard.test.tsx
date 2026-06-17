import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PatientCard from './PatientCard'
import { createMockPatient } from '../test/factories/patientFactory'

describe('PatientCard', () => {
    
    it('患者名が表示される', () => {
        const patient = createMockPatient({ 
            lastName: '佐藤', 
            firstName: '花子' 
        })
        
        render(
            <BrowserRouter>
                <PatientCard patient={patient} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
    })
    
    it('生年月日と性別が表示される', () => {
        const patient = createMockPatient({ 
            birth: '1990-05-15', 
            sex: '女性' 
        })
        
        render(
            <BrowserRouter>
                <PatientCard patient={patient} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('1990-05-15')).toBeInTheDocument()
        expect(screen.getByText('女性')).toBeInTheDocument()
    })
    
    it('主治医情報がある時に表示される', () => {
        const patient = createMockPatient({
            doctor: { 
                id: 1, 
                lastName: '田中', 
                firstName: '医師' 
            } as any
        })
        
        render(
            <BrowserRouter>
                <PatientCard patient={patient} />
            </BrowserRouter>
        )
        
        expect(screen.getByText('田中 医師')).toBeInTheDocument()
    })
})