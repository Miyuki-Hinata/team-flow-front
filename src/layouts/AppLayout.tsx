// layouts/AppLayout.tsx
import { useState } from 'react'
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
// md 未満では余白を spacing.md (16px) に絞る（README §レスポンシブ挙動）
const Main = styled.main`
    flex: 1 1 auto;
    overflow: auto;
    padding: ${props => props.theme.spacing.xl};

    @media (max-width: ${props => props.theme.breakpoints.md}) {
        padding: ${props => props.theme.spacing.md};
    }
`

// コンテンツ中央寄せ＋最大幅（README §Design Tokens「本文コンテンツの最大幅：1080px」を反映）。
// 1080px はトークンに無い値だが README で明示されたレイアウト定数なのでここで直書きで採用する
const Container = styled.div`
    max-width: 1080px;
    margin: 0 auto;
`

// off-canvas サイドバー背後の半透明オーバーレイ。
// lg 未満で「サイドバーが開いているとき」だけ表示。クリックで閉じる導線も担う。
// README §レスポンシブ挙動：rgba(0,7,45,.5) をそのまま採用
const Overlay = styled.div`
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 7, 45, 0.5);
    z-index: 30;                     /* Sidebar より下・Header より上 */

    @media (max-width: ${props => props.theme.breakpoints.lg}) {
        display: block;
    }
`

export const AppLayout = () => {
    // サイドバー開閉状態は Layout 側で一元管理し、Sidebar / AppHeader / Overlay の3者で共有する
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const openSidebar = () => setIsSidebarOpen(true)
    const closeSidebar = () => setIsSidebarOpen(false)

    return (
        <Shell>
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* オーバーレイは開いているときだけ描画。lg 以上では CSS 側で非表示 */}
            {isSidebarOpen && <Overlay onClick={closeSidebar} />}

            <MainColumn>
                <AppHeader onOpenSidebar={openSidebar} />
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
