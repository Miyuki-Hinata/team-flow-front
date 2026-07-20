import { useState } from 'react'
import type { ReactNode } from 'react'
import styled from 'styled-components'

// ------------------------------------------------------------
// Accordion（折りたたみ表示）
// ------------------------------------------------------------
// タイトル行をクリックすると本文が開閉する汎用パーツ。
// PatientDetailPage の追加情報（住所・電話・緊急連絡先）のように「重要度が低いが必要な情報」を
// 普段は畳んでおくために使う。
//
// お手本 Modal.tsx と同じく、開閉状態はコンポーネント自身が useState で持つ（呼び出し側に管理させない）。
// ただし初期状態だけは props で指定できるようにして、ページごとの好みに合わせられるようにした。
// ------------------------------------------------------------

type Props = {
    // 見出しに出す文字列（例：「追加情報」）
    title: string
    // 折りたたまれる本文。任意の React 要素を受け取れるよう children で
    children: ReactNode
    // 初期開閉状態。デフォルトは閉じた状態
    defaultOpen?: boolean
}

// 外枠：白カード風・薄い枠線・角丸で他のカード類と統一感を出す
const Container = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    overflow: hidden;                 /* 内側の角を親の角丸で切り取る */
`

// 見出しボタン：素の <button> のリセット + theme。カード幅いっぱいに広げてクリック領域を最大化
// hover 時に薄く色を変え、押せる感を出す
const Header = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;

    &:hover {
        background: ${props => props.theme.colors.surface.sunken};
    }
`

// タイトル：カード見出しと同じ大きさ・強調・主要文字色
const Title = styled.span`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// キャレット：open で 180 度回転（AppHeader のドロップダウンと同じパターン）
const Caret = styled.span<{ $open: boolean }>`
    display: inline-flex;
    color: ${props => props.theme.colors.text.secondary};
    transform: rotate(${props => props.$open ? 180 : 0}deg);
    transition: transform 0.15s ease;
`

// 本文エリア：閉じているときは display:none で描画自体を止める（アニメは今回スコープ外）
// 開いているときは Header との視覚的区切りとして上枠線を出す
const Body = styled.div`
    padding: ${props => props.theme.spacing.lg};
    border-top: 1px solid ${props => props.theme.colors.border.default};
`

// キャレット SVG（AppHeader と同じデザインで統一）
const CaretIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7 10l5 5 5-5"
              stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const Accordion = ({ title, children, defaultOpen = false }: Props) => {
    // 開閉状態は自身で管理。呼び出し側は「見出し」と「中身」を渡すだけで済む
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <Container>
            {/* aria-expanded を持たせてスクリーンリーダーにも開閉状態を伝える */}
            <Header
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(prev => !prev)}
            >
                <Title>{title}</Title>
                <Caret $open={isOpen}>
                    <CaretIcon />
                </Caret>
            </Header>

            {/* 閉じているときは中身を DOM に出さない（内部の重い描画コストを避ける） */}
            {isOpen && <Body>{children}</Body>}
        </Container>
    )
}
