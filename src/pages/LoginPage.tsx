import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { login } from '../api/auth'
import { getCurrentUser } from '../api/users'
import { setAccessToken } from '../api/tokenStore'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FormField } from '../components/ui/FormField'

// 全画面：LoginPage は AppLayout の外にある唯一のページ。サイドバーもヘッダーもない。
// デザインどおり濃紺全画面（brand.navyDeep）で中央配置。
const Screen = styled.div`
    position: fixed;
    inset: 0;
    background: ${props => props.theme.colors.brand.navyDeep};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${props => props.theme.spacing.lg};
`

// 中央カラム：max-width:420px（デザイン準拠のレイアウト定数）。
// 420px はトークンには無いが、Login 画面固有のレイアウト値なのでここで直書き採用。
const Column = styled.div`
    width: 100%;
    max-width: 420px;
`

// 上部ブランド行：ロゴ四角 + "TeamFlow" 白
const Brand = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.xl};
`

// ロゴ四角：40px ティール塗り角丸（Sidebar のロゴが 32px、Login は少し大きい 40px）
const LogoMark = styled.div`
    width: 40px;
    height: 40px;
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.brand.teal};
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 40px;
`

const BrandName = styled.span`
    color: ${props => props.theme.colors.text.onBrand};
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.bold};
    letter-spacing: 0.02em;
`

// 白カード。ui/Card は padding: spacing.md(16px) 固定でデザインの 32px に届かないため、
// ページローカルの FormCard を用意（Card 本体には手を入れない）。
const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
`

// 見出し
const Title = styled.h1`
    margin: 0 0 ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// サブテキスト（案内）
const Subtitle = styled.p`
    margin: 0 0 ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 入力欄（FormField + Input）の縦積みコンテナ
const Fields = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// フォーム全体のエラー（PasswordChangeModal と同じ流儀。フィールド固有ではないので独立表示）
const ErrorText = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

// ログインボタン：フル幅＋高さ大きめ（デザイン h:48）。
// ui/Button の見た目・variant はそのまま使いつつ、ページ固有の寸法だけ上書きするラッパー。
// 48px は theme.spacing.xxl と一致する値なのでトークンから引ける。
const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.spacing.sm};
    width: 100%;
    height: ${props => props.theme.spacing.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// 下部フッター
const Footer = styled.p`
    margin: ${props => props.theme.spacing.lg} 0 0;
    text-align: center;
    font-size: ${props => props.theme.fontSize.xs};
    line-height: 1.8;
    /* 画面背景は brand.navyDeep（モード共通の濃紺）なので、文字もモード共通の onBrand を
       薄めて使う。デモアカウントの案内を載せるため text.secondary より視認性を上げた */
    color: ${props => props.theme.colors.text.onBrand};
    opacity: 0.8;
`

// ロゴアイコン（Sidebar と同じ稲妻風 SVG。共通化すると密結合になるためページ内に留める）
const LogoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 13h4l2 5 4-12 2 7h4"
              stroke="#FFFFFF" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

function LoginPage() {
    const [loginId, setLoginId] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { setCurrentUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogin = async () => {
        try {
            setErrorMessage('')

            // ログイン処理
            const result = await login(loginId, password)
            setAccessToken(result.token)

            // ユーザー情報を取得してContextにセット
            const user = await getCurrentUser()
            setCurrentUser(user)

            // リダイレクト先を決定する（優先順位順）
            // 1. PrivateRouteからstate経由で渡されたパス（未ログインで直接URLを開いた場合）
            // 2. sessionStorageに保存されたパス（セッション切れで強制遷移された場合）
            // 3. デフォルトの /dashboard
            const from =
                (location.state as { from?: string })?.from ||
                sessionStorage.getItem('redirectAfterLogin') ||
                '/dashboard'

            // 使い終わったsessionStorageのエントリは削除しておく
            sessionStorage.removeItem('redirectAfterLogin')

            // replace: true にすることで、ブラウザの「戻る」でログイン画面に戻れないようにする
            navigate(from, { replace: true })
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    return (
        <Screen>
            <Column>
                <Brand>
                    <LogoMark>
                        <LogoIcon />
                    </LogoMark>
                    <BrandName>TeamFlow</BrandName>
                </Brand>

                <FormCard>
                    <Title>ログイン</Title>
                    <Subtitle>ログインIDとパスワードを入力してください</Subtitle>

                    <Fields>
                        <FormField label="ログインID" htmlFor="login-id">
                            <Input
                                id="login-id"
                                type="text"
                                placeholder="例：nakajima"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                            />
                        </FormField>

                        <FormField label="パスワード" htmlFor="login-password">
                            <Input
                                id="login-password"
                                type="password"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormField>

                        {/* エラーはフォーム全体で1箇所に集約（PasswordChangeModal と同じ流儀） */}
                        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                        <SubmitButton onClick={handleLogin}>ログイン</SubmitButton>
                    </Fields>
                </FormCard>

                {/* 公開デモの案内。架空でも病院名を名乗ると実在システムと誤認されうるため、
                    プロダクト名で名乗り、デモアカウントとデータの扱いを明示する */}
                <Footer>
                    デモ環境：<code>nurse / admin1234</code>（管理者は <code>admin / admin1234</code>）でログインできます
                    <br />
                    データはすべて架空のもので、毎日 4:00 に初期化されます
                </Footer>
            </Column>
        </Screen>
    )
}

export default LoginPage
