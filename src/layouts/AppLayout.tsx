// layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'

// アプリ全体の器：サイドバーとメインカラムを横並びに。高さ 100vh で画面を占有し、内側でスクロールさせる
const Shell = styled.div`
    display: flex;
    min-height: 100vh;
    background: ${props => props.theme.colors.surface.base};
`

// メインカラム：ヘッダー（固定高）＋メイン（残り全部）を縦に並べる。min-width:0 は
// フレックス子要素で長いコンテンツが横にはみ出すのを防ぐ定番の対処
const MainColumn = styled.div`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
`

// メイン本体：ページの余白（32px）と、スクロール時にヘッダーだけ固定するための overflow:auto
const Main = styled.main`
    flex: 1 1 auto;
    overflow: auto;
    padding: ${props => props.theme.spacing.xl};
`

// コンテンツ中央寄せ＋最大幅（README §Design Tokens「本文コンテンツの最大幅：1080px」を反映）。
// 1080px はトークンに無い値だが README で明示されたレイアウト定数なのでここで直書きで採用する
const Container = styled.div`
    max-width: 1080px;
    margin: 0 auto;
`

export const AppLayout = () => {
    return (
        <Shell>
            <Sidebar />
            <MainColumn>
                <AppHeader />
                <Main>
                    <Container>
                        {/* 各ページ（PatientPage / DashboardPage など）がここに差し込まれる */}
                        <Outlet />
                    </Container>
                </Main>
            </MainColumn>
        </Shell>
    )
}
