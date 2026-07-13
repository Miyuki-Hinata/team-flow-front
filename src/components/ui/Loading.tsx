// components/ui/Loading.tsx
import styled from 'styled-components'

// Loading が受け取る props。
// message は任意（既定「読み込み中...」）で、呼び出し側が用途に応じて上書きできる。
type LoadingProps = {
    message?: string
}

// 表示コンテナ：ページ内で目立ちすぎず、かつ余白を取って埋没しない位置に置く。
// 中央寄せ・補助文字色・本文サイズ（README §Design Tokens：小さすぎる文字を避け読みやすく）。
const Wrapper = styled.div`
    padding: ${props => props.theme.spacing.xl};
    text-align: center;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.md};
`

// Loading 本体。
// 単一責任：「読み込み中の表示」だけを担う。取得ロジック・エラー表示は持たない。
// 既定文言をここに置くことで、呼び出し側は Loading を書くだけで済む。
export const Loading = ({ message = '読み込み中...' }: LoadingProps) => {
    return <Wrapper>{message}</Wrapper>
}
