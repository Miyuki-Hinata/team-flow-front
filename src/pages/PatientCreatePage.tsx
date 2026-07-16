import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { createPatient } from '../api/patients'
import { departments as fetchDepartments } from '../api/departments'
import { users as fetchUsers } from '../api/users'
import type { PatientRequest } from '../types/patientRequest'
import type { Department } from '../types/department'
import type { User } from '../types/user'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { SEX_OPTIONS } from '../utils/patient'

// フォーム画面用の中央カラム。README §Design Tokens「フォーム系画面は 760px」に対応
const Column = styled.div`
    max-width: 760px;
    margin: 0 auto;
`

// 戻るリンク：ページ上部に置く「一覧へ戻る」。素の <a> の下線・紫を打ち消し
const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    text-decoration: none;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: ${props => props.theme.spacing.md};

    &:hover {
        color: ${props => props.theme.colors.text.primary};
    }
`

// 白カード。ui/Card は padding: spacing.md(16px) で、デザインの 32px に届かないため
// ページローカルの FormCard を用意（LoginPage の FormCard と同じ理由）
const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

// グループ見出し（「患者基礎情報」「緊急連絡先」など）。
// 本文と同じ 16px（md）で強調・muted 色。フォーム内のセクション見出しとして控えめに主張する。
const GroupLabel = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.muted};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// 区切り線＋見出し（緊急連絡先や医療情報のセパレータ）：GroupLabel と同じ視覚レベルで揃える
const Divider = styled.div`
    border-top: 1px solid ${props => props.theme.colors.border.default};
    padding-top: ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.muted};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// 2列グリッド：苗字/名前などの並び
const Grid2 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};
`

// 3列グリッド：生年月日/性別/電話番号などの並び
const Grid3 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};
`

// ボタン列：右寄せ・横並び（ConfirmDialog と同じレイアウト方針）
const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

// フォーム全体エラー（PasswordChangeModal / LoginPage と同じ流儀）：
// フィールド固有ではなく、送信失敗などフォーム全体のエラーメッセージを控えめに表示する
const ErrorText = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

const PatientCreatePage = () => {
    // フォーム入力の state（1つのオブジェクトで管理）
    const [patient, setPatient] = useState<PatientRequest>({
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        birth: '',
        sex: '',
        address: '',
        tel: '',
        emergencyContactName: '',
        emergencyContactTel: '',
        doctorId: undefined,
        departmentId: undefined,
    })

    // セレクト用のデータ
    const [departments, setDepartments] = useState<Department[]>([])
    const [doctors, setDoctors] = useState<User[]>([])

    // フォーム全体のエラーメッセージ（送信失敗時にサーバーのメッセージを表示する）
    const [errorMessage, setErrorMessage] = useState<string>('')

    const navigate = useNavigate()

    // 初回マウント時に部署と医師を取得
    useEffect(() => {
        fetchDepartments().then(data => setDepartments(data))
        fetchUsers('DOCTOR').then(data => setDoctors(data))
    }, [])

    // 汎用ハンドラ（Input / Select の両方に対応）
    const handleChange = (field: keyof PatientRequest) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setPatient({ ...patient, [field]: e.target.value })
        }

    // 送信処理：成功時は /patients へ、失敗時はエラーメッセージを表示する
    const handleSubmit = async () => {
        setErrorMessage('')

        // 送信前の簡易バリデーション：必須項目が空なら送信中止しエラー表示。
        // どの項目が足りないかを日本語で列挙して、ユーザーが即座に修正できるようにする。
        // ※ tel は PatientRequest 型上 optional なので必須チェックから除外している。
        const missing: string[] = []
        if (!patient.lastName.trim())             missing.push('苗字')
        if (!patient.firstName.trim())            missing.push('名前')
        if (!patient.lastNameKana.trim())         missing.push('苗字（かな）')
        if (!patient.firstNameKana.trim())        missing.push('名前（かな）')
        if (!patient.birth)                       missing.push('生年月日')
        if (!patient.sex)                         missing.push('性別')
        if (!patient.address.trim())              missing.push('住所')
        if (!patient.emergencyContactName.trim()) missing.push('緊急連絡先の人物名')
        if (!patient.emergencyContactTel.trim()) missing.push('緊急連絡先の電話番号')
        if (patient.departmentId === undefined)   missing.push('部署')
        if (patient.doctorId === undefined)       missing.push('担当医')

        if (missing.length > 0) {
            setErrorMessage(`以下の項目を入力してください：${missing.join('、')}`)
            return
        }

        try {
            await createPatient(patient)
            navigate('/patients')
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    // Select の options（department / doctor は数値ID→string 変換）
    const departmentOptions = departments.map(d => ({
        value: String(d.id),
        label: d.departmentName,
    }))
    const doctorOptions = doctors.map(d => ({
        value: String(d.id),
        label: d.lastName + ' ' + d.firstName,
    }))

    return (
        <Column>
            {/* 戻るリンク（デザインでは PageHeader の上に置かれる） */}
            <BackLink to="/patients">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                患者一覧へ戻る
            </BackLink>

            <PageHeader title="患者を追加" />

            <FormCard>
                {/* --- 患者基礎情報（氏名〜住所を含む） --- */}
                <GroupLabel>患者基礎情報</GroupLabel>
                <Grid2>
                    <FormField label="苗字" htmlFor="patient-lastName">
                        <Input
                            id="patient-lastName"
                            type="text"
                            placeholder="例：山田"
                            value={patient.lastName}
                            onChange={handleChange('lastName')}
                        />
                    </FormField>
                    <FormField label="名前" htmlFor="patient-firstName">
                        <Input
                            id="patient-firstName"
                            type="text"
                            placeholder="例：太郎"
                            value={patient.firstName}
                            onChange={handleChange('firstName')}
                        />
                    </FormField>
                </Grid2>

                {/* --- 氏名（かな） --- */}
                <Grid2>
                    <FormField label="苗字（かな）" htmlFor="patient-lastNameKana">
                        <Input
                            id="patient-lastNameKana"
                            type="text"
                            placeholder="例：やまだ"
                            value={patient.lastNameKana}
                            onChange={handleChange('lastNameKana')}
                        />
                    </FormField>
                    <FormField label="名前（かな）" htmlFor="patient-firstNameKana">
                        <Input
                            id="patient-firstNameKana"
                            type="text"
                            placeholder="例：たろう"
                            value={patient.firstNameKana}
                            onChange={handleChange('firstNameKana')}
                        />
                    </FormField>
                </Grid2>

                {/* --- 基本情報：生年月日 / 性別 / 電話番号 --- */}
                <Grid3>
                    <FormField label="生年月日" htmlFor="patient-birth">
                        <Input
                            id="patient-birth"
                            type="date"
                            value={patient.birth}
                            onChange={handleChange('birth')}
                        />
                    </FormField>
                    <FormField label="性別" htmlFor="patient-sex">
                        <Select
                            id="patient-sex"
                            placeholder="選択してください"
                            options={SEX_OPTIONS}
                            value={patient.sex}
                            onChange={handleChange('sex')}
                        />
                    </FormField>
                    <FormField label="電話番号" htmlFor="patient-tel">
                        <Input
                            id="patient-tel"
                            type="tel"
                            placeholder="例：090-1234-5678"
                            value={patient.tel ?? ''}
                            onChange={handleChange('tel')}
                        />
                    </FormField>
                </Grid3>

                {/* --- 住所 --- */}
                <FormField label="住所" htmlFor="patient-address">
                    <Input
                        id="patient-address"
                        type="text"
                        placeholder="例：東京都〇〇区〇〇 1-2-3"
                        value={patient.address}
                        onChange={handleChange('address')}
                    />
                </FormField>

                {/* --- 緊急連絡先 --- */}
                <Divider>緊急連絡先</Divider>
                <Grid2>
                    <FormField label="人物名" htmlFor="patient-emergencyName">
                        <Input
                            id="patient-emergencyName"
                            type="text"
                            placeholder="例：山田 花子（妻）"
                            value={patient.emergencyContactName ?? ''}
                            onChange={handleChange('emergencyContactName')}
                        />
                    </FormField>
                    <FormField label="電話番号" htmlFor="patient-emergencyTel">
                        <Input
                            id="patient-emergencyTel"
                            type="tel"
                            placeholder="例：090-8765-4321"
                            value={patient.emergencyContactTel ?? ''}
                            onChange={handleChange('emergencyContactTel')}
                        />
                    </FormField>
                </Grid2>

                {/* --- 医療情報：部署 / 担当医 --- */}
                <Divider>医療情報</Divider>
                <Grid2>
                    <FormField label="部署（科）" htmlFor="patient-department">
                        <Select
                            id="patient-department"
                            placeholder="選択してください"
                            options={departmentOptions}
                            value={patient.departmentId === undefined ? '' : String(patient.departmentId)}
                            onChange={(e) => setPatient({
                                ...patient,
                                departmentId: e.target.value === '' ? undefined : Number(e.target.value),
                            })}
                        />
                    </FormField>
                    <FormField label="担当医" htmlFor="patient-doctor">
                        <Select
                            id="patient-doctor"
                            placeholder="選択してください"
                            options={doctorOptions}
                            value={patient.doctorId === undefined ? '' : String(patient.doctorId)}
                            onChange={(e) => setPatient({
                                ...patient,
                                doctorId: e.target.value === '' ? undefined : Number(e.target.value),
                            })}
                        />
                    </FormField>
                </Grid2>

                {/* --- ボタン列（エラーがあればボタン列の直前に表示） --- */}
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
                <Actions>
                    <Button variant="secondary" onClick={() => navigate('/patients')}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        登録する
                    </Button>
                </Actions>
            </FormCard>
        </Column>
    )
}

export default PatientCreatePage
