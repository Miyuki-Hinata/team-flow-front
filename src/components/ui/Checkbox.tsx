// components/ui/Checkbox.tsx
import styled from 'styled-components'

// Checkbox が受け取る props の型。
// Input/Select と同じ方針で、標準の <input> 属性（checked / onChange / disabled / name / id /
// aria-* など）をまるごと継承する。
// ただし type だけは 'checkbox' に固定したいので Omit で除外し、呼び出し側が上書きできないようにする。
type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

// 見た目だけを担う styled.input[type=checkbox]。
// ネイティブのチェックボックスをそのまま使い、accent-color で色だけブランドのティールに差し替える。
// → 独自に box + SVG チェックを描かず、キーボード操作・フォーカス・スクリーンリーダー対応を
//   ブラウザ標準に委ねられる（Input/Select が素の要素を style するのと同じ考え方）。
const StyledCheckbox = styled.input`
    /* サイズ：本文と並べても視認・タップしやすい 18px 四方。
       余白トークン(spacing)は「隙間」用なので寸法には使わず、
       既存方針（レイアウト定数としての px 直書き許容）に沿って実寸で固定する。
       チェックボックスは文字サイズに連動させない方が押しやすいため rem ではなく px。 */
    width: 18px;
    height: 18px;

    /* チェック時の塗り色をティールに（押してほしい操作＝アクセント色に揃える） */
    accent-color: ${props => props.theme.colors.brand.teal};

    /* クリックできることを示すカーソル */
    cursor: pointer;

    /* フォーカス時：キーボード操作の「今ここ」をティールの輪郭で示す
       （Input が枠線をティールにして示すのと同じ意図。checkbox には枠がないので outline で表現） */
    &:focus-visible {
        outline: 2px solid ${props => props.theme.colors.brand.teal};
        outline-offset: 2px;
    }

    /* 無効時：操作不可カーソル */
    &:disabled {
        cursor: not-allowed;
    }
`

// Checkbox 本体。
// label やテキストは持たない（単一責任：チェックボックスの見た目と属性転送のみ）。
// 隣に何を並べるか（患者カード等）は呼び出し側の責任。ラベル付けが要る場合は
// 呼び出し側が aria-label を rest 経由で渡すか、<label> で囲んで関連付ける。
export const Checkbox = ({ ...rest }: CheckboxProps) => {
    return <StyledCheckbox type="checkbox" {...rest} />
}
