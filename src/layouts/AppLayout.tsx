import { Outlet } from 'react-router-dom'
import Navigation  from '../components/Navigation'

export const AppLayout = () => {
    
    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <Navigation />
                {/* ここに各ページ（PatientDetailPageなど）が差し込まれる */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}