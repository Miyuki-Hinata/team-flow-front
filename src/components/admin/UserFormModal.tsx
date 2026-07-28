import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { roleLabel, roleOrder } from '../../utils/role'
import { LEVEL_ADMIN, LEVEL_MEMBER, isAdminLevel } from '../../utils/user'
import type { Role } from '../../types/role'
import type { User } from '../../types/user'
import type { Department } from '../../types/department'
import type { UserInput } from '../../api/users'

// ユーザーの「追加/編集」フォーム。
// 部署・カテゴリ・プロジェクトは項目が1〜2個なので行内編集にしたが、
// ユーザーは10項目あり行内には収まらないため Modal に分離する。
// このコンポーネントは「入力値の保持と検証」だけに責任を絞り、
// 実際の保存（API呼び出し）と一覧の更新は onSubmit で呼び出し側（UserSection）に委ねる。

// 追加と編集で同じフォームを使い回す。user が null なら追加、あれば編集。
type UserFormModalProps = {
    isOpen: boolean
    onClose: () => void
    user: User | null            // null = 新規追加モード
    departments: Department[]    // 部署の選択肢（親から渡す＝ProjectSection と同じ方針）
    onSubmit: (input: UserInput) => Promise<void>
}

// Modal 内の縦積みフォーム。Modal 自身は幅を持たないのでここで指定する
const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    width: min(480px, 90vw);
    max-height: 80vh;
    overflow-y: auto;
`

const Title = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 姓と名のように「対で入力する項目」を横並びにして縦の長さを抑える
const Row = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};

    /* 中の FormField を等幅にする（min-width:0 で入力欄のはみ出しを防ぐ） */
    > * {
        flex: 1 1 0;
        min-width: 0;
    }
`

// チェックボックスとラベルを横に並べる。label で囲んで文字クリックでも切り替わるようにする
const CheckboxRow = styled.label`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.fontSize.md};
    cursor: pointer;
`

// パスワード欄の下に出す補足（編集時の「空欄なら変更しない」を明示）
const Hint = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.xs};
`

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

// 職種セレクトの選択肢。roleLabel の全職種を roleOrder（医師→看護師→…）の順に並べる。
// 職種を決め打ちで列挙せず対応表から生成するので、Role が増えても自動で選択肢に載る。
const roleOptions = (Object.keys(roleLabel) as Role[])
    .sort((a, b) => roleOrder[a] - roleOrder[b])
    .map(role => ({ value: role, label: roleLabel[role] }))

export const UserFormModal = ({ isOpen, onClose, user, departments, onSubmit }: UserFormModalProps) => {
    // 入力値。フォームの各欄は個別 state ではなく1つのオブジェクトでまとめて持つ
    // （項目が多く、開くたびに丸ごと初期化したいため）
    const [loginId, setLoginId] = useState('')
    const [lastName, setLastName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastNameKana, setLastNameKana] = useState('')
    const [firstNameKana, setFirstNameKana] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [departmentId, setDepartmentId] = useState<number | null>(null)
    const [role, setRole] = useState<Role | ''>('')
    const [isAdmin, setIsAdmin] = useState(false)

    // 未入力エラー。項目名 → メッセージ の対応で持ち、FormField の error に渡す
    const [errors, setErrors] = useState<Record<string, string>>({})

    // 保存中の二重送信を防ぐ
    const [isSaving, setIsSaving] = useState(false)

    // モーダルを開くたびにフォームを初期化する。
    // 編集なら対象ユーザーの値を流し込み、新規なら空にする。
    // ※ パスワードだけは編集時も必ず空から始める（既存のハッシュは取得できないし、
    //    空欄のまま保存すればサーバー側で「変更しない」と扱われる）。
    useEffect(() => {
        if (!isOpen) return

        setLoginId(user?.loginId ?? '')
        setLastName(user?.lastName ?? '')
        setFirstName(user?.firstName ?? '')
        setLastNameKana(user?.lastNameKana ?? '')
        setFirstNameKana(user?.firstNameKana ?? '')
        setEmail(user?.email ?? '')
        setPassword('')
        setDepartmentId(user?.department?.id ?? null)
        setRole(user?.role ?? '')
        // UI 上は「管理者権限」チェックだが、内部表現は level(1/2)。画面に level という語は出さない
        setIsAdmin(isAdminLevel(user?.level))
        setErrors({})
    }, [isOpen, user])

    const departmentOptions = departments.map(d => ({ value: String(d.id), label: d.departmentName }))

    // 入力チェック。サーバー側でも検証されるが、往復する前に画面で気づけるようにする
    const validate = (): Record<string, string> => {
        const next: Record<string, string> = {}
        if (!loginId.trim()) next.loginId = 'ログインIDを入力してください'
        if (!lastName.trim()) next.lastName = '姓を入力してください'
        if (!firstName.trim()) next.firstName = '名を入力してください'
        if (!lastNameKana.trim()) next.lastNameKana = '姓（かな）を入力してください'
        if (!firstNameKana.trim()) next.firstNameKana = '名（かな）を入力してください'
        if (!email.trim()) next.email = 'メールアドレスを入力してください'
        if (!role) next.role = '職種を選択してください'
        // パスワードは新規追加のときだけ必須（編集時は空欄＝変更しない）
        if (!user && !password) next.password = 'パスワードを入力してください'
        return next
    }

    const handleSubmit = async () => {
        const nextErrors = validate()
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return

        setIsSaving(true)
        try {
            await onSubmit({
                loginId: loginId.trim(),
                lastName: lastName.trim(),
                firstName: firstName.trim(),
                lastNameKana: lastNameKana.trim(),
                firstNameKana: firstNameKana.trim(),
                email: email.trim(),
                // 空欄なら送らない（サーバー側で「変更しない」と判定される）
                password: password || undefined,
                departmentId,
                role: role as Role,   // validate 済みなので '' ではない
                level: isAdmin ? LEVEL_ADMIN : LEVEL_MEMBER,
            })
        } finally {
            // 成功・失敗どちらでもボタンを操作可能に戻す
            // （閉じるかどうかは onSubmit の結果を知る呼び出し側が決める）
            setIsSaving(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Form>
                <Title>{user ? 'ユーザーの編集' : 'ユーザーの追加'}</Title>

                <FormField label="ログインID" htmlFor="user-loginId" error={errors.loginId}>
                    <Input
                        id="user-loginId"
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                    />
                </FormField>

                <Row>
                    <FormField label="姓" htmlFor="user-lastName" error={errors.lastName}>
                        <Input id="user-lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </FormField>
                    <FormField label="名" htmlFor="user-firstName" error={errors.firstName}>
                        <Input id="user-firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </FormField>
                </Row>

                <Row>
                    <FormField label="姓（かな）" htmlFor="user-lastNameKana" error={errors.lastNameKana}>
                        <Input id="user-lastNameKana" type="text" value={lastNameKana} onChange={(e) => setLastNameKana(e.target.value)} />
                    </FormField>
                    <FormField label="名（かな）" htmlFor="user-firstNameKana" error={errors.firstNameKana}>
                        <Input id="user-firstNameKana" type="text" value={firstNameKana} onChange={(e) => setFirstNameKana(e.target.value)} />
                    </FormField>
                </Row>

                <FormField label="メールアドレス" htmlFor="user-email" error={errors.email}>
                    <Input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormField>

                <FormField label="職種" htmlFor="user-role" error={errors.role}>
                    <Select
                        id="user-role"
                        placeholder="職種を選択"
                        options={roleOptions}
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role | '')}
                    />
                </FormField>

                <FormField label="部署" htmlFor="user-department">
                    <Select
                        id="user-department"
                        placeholder="部署を選択（任意）"
                        options={departmentOptions}
                        value={departmentId === null ? '' : String(departmentId)}
                        onChange={(e) => setDepartmentId(e.target.value === '' ? null : Number(e.target.value))}
                    />
                </FormField>

                <FormField label="パスワード" htmlFor="user-password" error={errors.password}>
                    <Input
                        id="user-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormField>
                {/* 編集時だけ「空欄なら変更しない」ことを明示する（新規では誤解を招くので出さない） */}
                {user && <Hint>変更しない場合は空欄のままにしてください</Hint>}

                {/* level(1/2) という内部表現は見せず、「管理者権限」というチェックで表現する */}
                <CheckboxRow>
                    <Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                    管理者権限を付与する（マスタ管理・ユーザー管理が可能になります）
                </CheckboxRow>

                <Actions>
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>キャンセル</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? '保存中…' : '保存'}
                    </Button>
                </Actions>
            </Form>
        </Modal>
    )
}
