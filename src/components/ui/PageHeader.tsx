// components/ui/PageHeader.tsx
import type { ReactNode } from 'react'
import styled from 'styled-components'

// PageHeader が受け取る props。
// action は ReactNode で汎用的に受ける（Button でも Link でも自由に差し込める。Modal と同じ children 合成の発想）。
type PageHeaderProps = {
    title: string       // ページタイトル（例：「お知らせ」）
    subtitle?: string   // タイトル下の補助テキスト（例：「未読 3 件」）
    action?: ReactNode  // 右側のアクション要素（例：<Button>新規作成</Button>）
}

// ヘッダー全体：左（タイトル・サブ）と右（アクション）を justify-between で両端配置。
// align-items: flex-end で底辺揃え（デザイン準拠：右のボタンとタイトル下端が揃う）。
// margin-bottom: lg(24px) でページ本文との間に余白を確保。
const Wrapper = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.lg};
`

// 左ブロック：タイトル＋サブテキストを縦積み。
// align-items: flex-start でタイトル・サブテキストを明示的に左寄せに固定する
// （既定の stretch のままだと親幅に引き伸ばされ、視覚的に中央っぽく見える問題があった）
const TitleGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.xs};
`

// タイトル：ページタイトル用の最大サイズ（xxl=28px、fontWeight.bold）
const Title = styled.h1`
    margin: 0;
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// サブテキスト：ラベルサイズ・補助文字色で控えめに
const Subtitle = styled.p`
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// PageHeader 本体。
// 単一責任：ページ上部の「タイトル・サブテキスト・右アクション」の並びだけを担う。
// アクションの中身（ボタンの見た目・遷移先）は呼び出し側に委ねる。
export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
    return (
        <Wrapper>
            <TitleGroup>
                <Title>{title}</Title>
                {/* subtitle は任意。ある時だけ表示（短絡評価） */}
                {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </TitleGroup>

            {/* action も任意。<Button> や <Link> をそのまま差し込める */}
            {action}
        </Wrapper>
    )
}
