import type { ReactNode } from 'react'
import styled from 'styled-components'

// ------------------------------------------------------------
// FilterBar（フィルタ入力を横並びにする器）
// ------------------------------------------------------------
// 検索入力 / Select / チップ など、フィルタ用の入力群を一行で並べる汎用コンテナ。
// 狭い画面では自然に折り返す。TaskFilter / PatientFilter で共有。
//
// 責務は「並べ方」だけ。中に何を入れるかは呼び出し側で自由に組み立てられる（children）。
// styled 定義自体は各フィルタで重複していたので 1 箇所に集約する。
// ------------------------------------------------------------

type Props = {
    children: ReactNode
}

// 横並び + 折り返し許容 + 中央寄せ。
// box-sizing: border-box を全子要素に効かせて、styled(Input) の width:100% でも親をはみ出さないようにする
const Bar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.sm};
    align-items: center;

    * {
        box-sizing: border-box;
    }
`

export const FilterBar = ({ children }: Props) => {
    return <Bar>{children}</Bar>
}
