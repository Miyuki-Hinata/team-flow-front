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

// 見た目のバリエーション。
//   - 'boxed' (デフォルト): 独立した白カード（枠線・角丸あり）。単体でセクションを作る場合に
//   - 'inline': 他のカード内に埋め込む用（背景・枠線・角丸なし、上下だけ区切り線）。
//     患者詳細カード内に「追加情報」を続けて置くケースなど、親カードの一部として溶け込ませたいとき
type AccordionVariant = 'boxed' | 'inline'

type Props = {
    // 見出しに出す文字列（例：「追加情報」）
    title: string
    // 折りたたまれる本文。任意の React 要素を受け取れるよう children で
    children: ReactNode
    // 初期開閉状態。デフォルトは閉じた状態
    defaultOpen?: boolean
    // 見た目のバリエーション。デフォルトは 'boxed'（独立カード）
    variant?: AccordionVariant
}

// 外枠：boxed は白カード風、inline は親カード内に溶け込む形（背景・枠線・角丸なし・上に区切り線のみ）
const Container = styled.div<{ $variant: AccordionVariant }>`
    background: ${props => props.$variant === 'boxed'
        ? props.theme.colors.surface.raised
        : 'transparent'};
    border: ${props => props.$variant === 'boxed'
        ? `1px solid ${props.theme.colors.border.default}`
        : 'none'};
    border-top: ${props => props.$variant === 'inline'
        ? `1px solid ${props.theme.colors.border.default}`  /* 親カード内の基本情報との仕切り */
        : `1px solid ${props.theme.colors.border.default}`};
    border-radius: ${props => props.$variant === 'boxed'
        ? props.theme.radius.lg
        : 0};
    overflow: hidden;                 /* 内側の角を親の角丸で切り取る（boxed 時） */
`

// 見出しボタン：素の <button> のリセット + theme。カード幅いっぱいに広げてクリック領域を最大化
// inline 時は親カードの padding が既に効いているので左右パディングを 0 にして揃える
const Header = styled.button<{ $variant: AccordionVariant }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md} ${props => props.$variant === 'boxed'
        ? props.theme.spacing.lg
        : 0};
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;

    &:hover {
        /* inline 時は親の背景色と干渉するので hover 反転はしない（見出しのマイナス感を避ける） */
        background: ${props => props.$variant === 'boxed'
            ? props.theme.colors.surface.sunken
            : 'transparent'};
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

// 本文エリア：閉じているときは描画自体を止める（条件描画で対応・下記参照）
// 開いているときは Header との視覚的区切りとして上枠線を出す
// inline 時は左右パディングを 0 にして親カードの padding に揃える（Header と同じ考え方）
const Body = styled.div<{ $variant: AccordionVariant }>`
    padding: ${props => props.theme.spacing.lg} ${props => props.$variant === 'boxed'
        ? props.theme.spacing.lg
        : 0};
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

export const Accordion = ({ title, children, defaultOpen = false, variant = 'boxed' }: Props) => {
    // 開閉状態は自身で管理。呼び出し側は「見出し」と「中身」を渡すだけで済む
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <Container $variant={variant}>
            {/* aria-expanded を持たせてスクリーンリーダーにも開閉状態を伝える */}
            <Header
                $variant={variant}
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
            {isOpen && <Body $variant={variant}>{children}</Body>}
        </Container>
    )
}
