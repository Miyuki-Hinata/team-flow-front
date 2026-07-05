import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PatientCard } from './ui/PatientCard'
import { createMockPatient } from '../test/factories/patientFactory'
import { ThemeProvider } from 'styled-components'
import { themeLight } from '../styles/theme'

const selectedThemeColor = themeLight

describe('PatientCard', () => {
    
    it('患者名が表示される', () => {
        const patient = createMockPatient({ 
            lastName: '佐藤', 
            firstName: '花子' 
        })
        
        render(
            <ThemeProvider theme={selectedThemeColor}>         
                <BrowserRouter>
                    <PatientCard patient={patient} />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
    })

    it('生年月日から年齢が計算されて表示される', () => {
        const today = new Date()
        const birthDate = new Date(today.getFullYear() - 35, today.getMonth(), today.getDate())
        const birth = birthDate.toISOString().split('T')[0]

        const patient = createMockPatient({ birth })

        render(
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <PatientCard patient={patient}/>
                </BrowserRouter>
            </ThemeProvider>
        )

        expect(screen.getByText(/35歳/)).toBeInTheDocument()

    })
    
    it('主治医情報がある時に表示される', () => {
        const patient = createMockPatient({
            doctor: { 
                id: 1, 
                lastName: '田中', 
                firstName: '真一郎' 
            } as any
        })
        
        render(
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <PatientCard patient={patient} />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        expect(screen.getByText(/田中 真一郎/)).toBeInTheDocument()
    })
})