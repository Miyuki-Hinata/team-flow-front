import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { announcements as fetchAnnouncements } from '../api/announcements'
import { useAuth } from './AuthContext'

// ------------------------------------------------------------
// AnnouncementCountContext（未読お知らせ件数の共有）
// ------------------------------------------------------------
// サイドバーの「お知らせ」項目に付ける未読バッジのために、未読件数をアプリ全体で共有する。
// Sidebar だけで fetch していると、AnnouncementsPage で既読化してもサイドバーに反映されないため、
// 「既読化した側から refresh を呼ぶ」経路を提供する。
//
// 初回：Provider マウント時に fetch → 未読件数を集計
// 既読化後：呼び出し側（AnnouncementsPage 等）が `refresh()` を呼ぶ → 再 fetch して同期
// ------------------------------------------------------------

type AnnouncementCountApi = {
    unreadCount: number
    // 未読件数を再取得。既読化・作成・削除など、件数が変わりうる操作の後に呼ぶ
    refresh: () => Promise<void>
}

const AnnouncementCountContext = createContext<AnnouncementCountApi | undefined>(undefined)

type Props = {
    children: ReactNode
}

export const AnnouncementCountProvider = ({ children }: Props) => {
    const [unreadCount, setUnreadCount] = useState(0)
    // ログイン状態を見て、未ログイン時は API 呼び出しをスキップする（401 の空ボディで
    // JSON パースエラーが出るのを防ぐため）
    const { currentUser } = useAuth()

    // refresh は依存なしで安定させ、Consumer 側の useEffect 依存に安全に入れられるようにする
    const refresh = useCallback(async () => {
        try {
            const list = await fetchAnnouncements()
            setUnreadCount(list.filter(a => !a.isRead).length)
        } catch {
            // 取得失敗時はバッジ更新を諦める（既存の値を維持し、UI をクラッシュさせない）
        }
    }, [])

    // ログイン後にのみ取得。ログアウト時（currentUser が null に戻る）はバッジを 0 に戻す。
    // これにより /login 表示中の 401 起因の JSON パースエラーを回避する
    useEffect(() => {
        if (!currentUser) {
            setUnreadCount(0)
            return
        }
        refresh()
    }, [currentUser, refresh])

    const api = useMemo<AnnouncementCountApi>(() => ({
        unreadCount,
        refresh,
    }), [unreadCount, refresh])

    return (
        <AnnouncementCountContext.Provider value={api}>
            {children}
        </AnnouncementCountContext.Provider>
    )
}

// カスタムフック：Provider 外呼び出しは明確にエラーで落として初期化ミスに気付ける
export const useAnnouncementCount = (): AnnouncementCountApi => {
    const ctx = useContext(AnnouncementCountContext)
    if (!ctx) throw new Error('useAnnouncementCount は AnnouncementCountProvider の内側で呼び出してください')
    return ctx
}
