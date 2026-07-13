// components/ui/EmptyState.tsx
import styled from 'styled-components'

// EmptyState が受け取る props。
// message は必須（何が「ない」のかは呼び出し側の文脈でしか分からない：
// 「お知らせはありません」「タスクはありません」等を明示的に指定させる）。
type EmptyStateProps = {
    message: string
}

// 白カード風の枠内に、text.muted で中央表示。
// デザイン（TeamFlow.dc.html 466行）：padding:48px; text-align:center; color:#9298A6;
// font-size:16px; background:#FFFFFF; border:1px solid #E2E5EB; border-radius:12px; をトークン化。
const Wrapper = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xxl};
    text-align: center;
    color: ${props => props.theme.colors.text.muted};
    font-size: ${props => props.theme.fontSize.md};
`

// EmptyState 本体。
// 単一責任：「何も無いこと」の表示だけを担う。
// 空判定（`items.length === 0`）は呼び出し側で行い、EmptyState は「表示するかどうか」を判断しない。
export const EmptyState = ({ message }: EmptyStateProps) => {
    return <Wrapper>{message}</Wrapper>
}
