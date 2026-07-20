import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { themeLight, themeDark } from '../styles/theme'

// ------------------------------------------------------------
// ThemeModeContext（ライト / ダークモード切替）
// ------------------------------------------------------------
// theme.ts では themeLight / themeDark を用意済みだが、これまで固定で themeLight を使っていた。
// このコンテキストで「現在のモード + 切替関数」を提供し、AppHeader のユーザーメニューから切り替えられるようにする。
//
// 内部で styled-components の ThemeProvider を包み込み、外の main.tsx からは
// <ThemeModeProvider><App/></ThemeModeProvider> だけで済むようにする。
// これで theme の受け渡しをコンポーネント側に一切書かなくてよい。
// ------------------------------------------------------------

export type ThemeMode = 'light' | 'dark'

type ThemeModeApi = {
    mode: ThemeMode
    // 明示切替（ラジオ等から呼びたいとき）
    setMode: (mode: ThemeMode) => void
    // トグル（アイコンボタン等から呼びたいとき）
    toggle: () => void
}

const ThemeModeContext = createContext<ThemeModeApi | undefined>(undefined)

// localStorage キー：将来別の設定が増えても衝突しないよう名前空間を切る
const STORAGE_KEY = 'teamflow.themeMode'

// 初期値は localStorage、なければ light 固定（システム設定は今回は追随しない・明示切替のみ）
const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
}

type Props = {
    children: ReactNode
}

export const ThemeModeProvider = ({ children }: Props) => {
    const [mode, setModeState] = useState<ThemeMode>(getInitialMode)

    // モード変化を localStorage に永続化。次回起動時にも状態が復元される
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, mode)
    }, [mode])

    // API を useMemo で固定して不要な再レンダーを避ける
    const api = useMemo<ThemeModeApi>(() => ({
        mode,
        setMode: setModeState,
        toggle: () => setModeState(prev => prev === 'light' ? 'dark' : 'light'),
    }), [mode])

    // mode に応じて実際の theme を切り替え、styled-components の ThemeProvider に渡す。
    // 呼び出し側は theme を意識せず ThemeModeProvider 1 つで済む
    const theme = mode === 'dark' ? themeDark : themeLight

    return (
        <ThemeModeContext.Provider value={api}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    )
}

// カスタムフック：呼び出し側は const { mode, toggle } = useThemeMode()
// Provider 外で呼ばれた場合は明確にエラーで落とす（初期化ミスに気付ける）
export const useThemeMode = (): ThemeModeApi => {
    const ctx = useContext(ThemeModeContext)
    if (!ctx) throw new Error('useThemeMode は ThemeModeProvider の内側で呼び出してください')
    return ctx
}
