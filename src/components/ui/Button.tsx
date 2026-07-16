import styled, { css } from 'styled-components'
// ↑ css というものを追加で読み込む（後で説明します）

// Buttonが受け取るpropsの型を定義
// variantは「この3つのどれか」しか受け付けない、と型で縛る
type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'ghost'
}

// variantごとのスタイル「対応表」を作る
const variantStyles = {
    // primary：ティール塗りつぶし・白文字
    primary: css`
        background: ${props => props.theme.colors.brand.teal};
        color: ${props => props.theme.colors.text.onBrand};
        border: none;
    `,
    // secondary：白背景・ティール文字・ティール枠線
    secondary: css`
        background: ${props => props.theme.colors.surface.raised};
        color: ${props => props.theme.colors.brand.teal};
        border: 1px solid ${props => props.theme.colors.brand.teal};
    `,
    // danger：赤塗りつぶし・白文字
    danger: css`
        background: ${props => props.theme.colors.semantic.danger.main};
        color: ${props => props.theme.colors.text.onBrand};
        border: none;
    `,
    neutral: css`
        background: ${props => props.theme.colors.surface.raised};   /* 白 */
        color: ${props => props.theme.colors.text.primary};          /* 黒文字 */
        border: 1px solid ${props => props.theme.colors.border.default}; /* グレー枠 */
    `,
    ghost: css`
        background: transparent;                                      /* 背景なし */
        color: ${props => props.theme.colors.text.secondary};        /* 控えめな文字 */
        border: none;
    `,
}

// Button本体
export const Button = styled.button<ButtonProps>`
    /* 全variant共通のスタイル */
    display: inline-flex;             /* アイコン + テキストを並べられるように */
    align-items: center;              /* アイコンと文字の縦中央揃え */
    gap: ${props => props.theme.spacing.xs};  /* アイコンと文字の間隔（テキストのみの場合は影響なし） */
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border-radius: ${props => props.theme.radius.md};
    font-size: ${props => props.theme.fontSize.md};
    cursor: pointer;

    /* variantごとのスタイルを、対応表から引いて適用する */
    /* variantが指定されなければ primary を使う（|| で既定値） */
    ${props => variantStyles[props.variant || 'primary']}
    font-weight: ${props => props.theme.fontWeight.bold};
`