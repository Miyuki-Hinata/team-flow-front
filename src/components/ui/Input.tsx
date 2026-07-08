// components/ui/Input.tsx
import styled from 'styled-components'

// Input が受け取る props の型。
// 独自 props は増やさず、HTML の <input> が持つ標準属性（value / onChange /
// type / placeholder / disabled / name / id など）をまるごと継承する。
// → 呼び出し側は素の <input> と同じ感覚で使えて、属性を自前で列挙しなくて済む。
type InputProps = React.InputHTMLAttributes<HTMLInputElement>

// 見た目だけを担う styled.input。
// 色・余白・角丸・文字サイズはすべて theme トークンから引く（ハードコード禁止）。
const StyledInput = styled.input`
    /* 背景：一段沈んだ面（入力欄用の色）。文字色は主要テキスト */
    background: ${props => props.theme.colors.surface.sunken};
    color: ${props => props.theme.colors.text.primary};

    /* 枠線・角丸：通常時はうっすらした標準の枠線 */
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};

    /* 余白：上下は狭め(sm)・左右は標準(md)。文字サイズは本文基準(md) */
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.md};

    /* プレースホルダーはヒント色（muted）で薄く */
    &::placeholder {
        color: ${props => props.theme.colors.text.muted};
    }

    /* フォーカス時：outline は消し、枠線をティールにして「今ここ」を示す */
    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.brand.teal};
    }

    /* 無効時：操作不可カーソル＋文字を薄く */
    &:disabled {
        cursor: not-allowed;
        color: ${props => props.theme.colors.text.muted};
    }
`

// Input 本体。
// 受け取った標準属性は分割代入した rest としてまとめ、StyledInput にそのまま転送する。
// label やエラー表示は持たない（単一責任：入力欄の見た目と属性転送のみ。それらは FormField が担当）。
export const Input = ({ ...rest }: InputProps) => {
    return <StyledInput {...rest} />
}