// styled-components の「テーマの型(DefaultTheme)」に、
// 自分が作った theme.ts の中身(Theme型)を教えるためのファイル。
import 'styled-components'
import type { Theme } from './theme'

// styled-components の型定義を「上書き拡張する」
// styled-components という外部ライブラリの型定義に、中身を追加しますよ という宣言
declare module 'styled-components' {
    // DefaultTheme の中身を、自分の Theme 型と同じにする。
    // 「中身が空の interface」を lint は禁止しているが、ここは styled-components 公式
    // ドキュメントどおりの拡張方法（type エイリアスでは declare module のマージができない）
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefaultTheme extends Theme{}
}