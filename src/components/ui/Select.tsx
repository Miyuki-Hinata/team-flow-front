// components/ui/Select.tsx
import styled from 'styled-components'

// Select が受け取る props の型。
// 標準の <select> 属性（value / onChange / disabled / name / id など）は
// SelectHTMLAttributes で丸ごと継承し、それに独自 props を2つだけ足す。
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[] // 選択肢のデータ（値と表示ラベルの組）
    placeholder?: string                         // 未選択時に先頭へ出す見出し
}

// 見た目だけを担う styled.select。
// トークンは Input.tsx と完全に揃える（同じフォーム内で並ぶため統一が最重要）。
const StyledSelect = styled.select`
    /* 背景：入力欄用の沈んだ面。文字色は主要テキスト（Input と同じ） */
    background: ${props => props.theme.colors.surface.sunken};
    color: ${props => props.theme.colors.text.primary};

    /* 枠線・角丸：通常時はうっすらした標準の枠線 */
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};

    /* 余白：上下は狭め(sm)・左右は標準(md)。文字サイズは本文基準(md) */
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.md};

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

// Select 本体。
// 独自 props（options / placeholder）は明示的に取り出し、残りの標準属性だけを
// rest として StyledSelect に転送する。
// ※ options / placeholder を <select> に渡すと不正な DOM 属性になるため rest から除外する。
export const Select = ({ options, placeholder, ...rest }: SelectProps) => {
    return (
        <StyledSelect {...rest}>
            {/* placeholder があれば先頭に空 value の option を置く → 未選択状態(value="")を表現 */}
            {placeholder && <option value="">{placeholder}</option>}

            {/* 選択肢データを <option> に変換。key は一意な option.value を使う */}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </StyledSelect>
    )
}
