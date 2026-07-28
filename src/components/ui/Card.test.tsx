import { render, screen } from '@testing-library/react'
import styled, { ThemeProvider } from 'styled-components'
import { Card } from './Card'
import { themeLight } from '../../styles/theme'

const selectedThemeColor = themeLight

// Card は styled(Card) で拡張される前提の土台コンポーネント（管理ページの各セクションが使う）。
// className を中の要素へ渡し忘れると、拡張したスタイルが「エラーも警告も出さずに無視される」。
// 見た目が崩れるだけで気づきにくい壊れ方なので、テストで固定しておく。
describe('Card', () => {

    it('children が表示される', () => {
        render(
            <ThemeProvider theme={selectedThemeColor}>
                <Card>中身</Card>
            </ThemeProvider>
        )

        expect(screen.getByText('中身')).toBeInTheDocument()
    })

    it('styled(Card) で拡張したスタイルが適用される（className が中の要素へ渡る）', () => {
        // styled(Card) は生成したクラス名を className props として Card に渡す。
        // Card がそれを CardContainer へ渡していれば、この gap が実際に効く。
        const StyledCard = styled(Card)`
            gap: 24px;
        `

        render(
            <ThemeProvider theme={selectedThemeColor}>
                <StyledCard>中身</StyledCard>
            </ThemeProvider>
        )

        // children を持つ要素＝CardContainer 自身に指定が届いているかを見る
        const container = screen.getByText('中身')
        expect(container).toHaveStyle({ gap: '24px' })
    })
})
