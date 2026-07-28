import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import type { TabItem } from '../components/ui/Tabs'
import { MasterSection } from '../components/admin/MasterSection'
import { ProjectSection } from '../components/admin/ProjectSection'
import { UserSection } from '../components/admin/UserSection'
import type { Department } from '../types/department'
import type { Category } from '../types/category'
import { departments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments'
import { categories, createCategory, updateCategory, deleteCategory } from '../api/categories'

// 管理ページ（admin 限定）。ユーザー・部署・カテゴリ・プロジェクトを追加/編集/削除する。
// 部署・カテゴリは「名前1項目」なので汎用 MasterSection を使い回し、
// プロジェクトは「名前＋部署」なので専用 ProjectSection、ユーザーは項目が多いので UserSection を使う。
// ルートの admin ガードは AdminRoute（App.tsx）で付けている。
//
// 4セクションを縦に並べると、ユーザーが増えるほど下のセクションまでスクロールが遠くなる。
// 管理作業は一度に1種類しか行わない（部署とカテゴリを見比べる場面がない）ため、
// 排他表示のタブにして「どのセクションへも常に1クリック」で届くようにした。

// タブの識別子。文字列の union にして、切り替え処理でタイプミスを型で弾く
type AdminTab = 'users' | 'departments' | 'categories' | 'projects'

// タブの並び。ユーザーは更新頻度が最も高いので先頭＝初期表示にする
const TAB_ITEMS: TabItem<AdminTab>[] = [
    { value: 'users', label: 'ユーザー' },
    { value: 'departments', label: '部署' },
    { value: 'categories', label: 'カテゴリ' },
    { value: 'projects', label: 'プロジェクト' },
]

// タブとその中身を縦に並べる
const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

const AdminPage = () => {
    // 部署一覧はここ（親）で保持し、ProjectSection のドロップダウンと共有する。
    // 部署セクションで追加/更新/削除されたら onChanged→reloadDepartments で取り直し、
    // ProjectSection の選択肢も即座に最新化される（別セクションでもリロード不要）。
    const [departmentList, setDepartmentList] = useState<Department[]>([])
    const reloadDepartments = () => {
        departments().then(setDepartmentList).catch(() => setDepartmentList([]))
    }
    useEffect(reloadDepartments, [])

    // 表示中のタブ。初期値は更新頻度が最も高いユーザー
    const [activeTab, setActiveTab] = useState<AdminTab>('users')

    // 選択中のタブに対応するセクションを返す。
    // ※部署とカテゴリはどちらも MasterSection なので、同じ位置に描画すると React が
    //   「同じ種類の要素」とみなしてインスタンスを再利用してしまい、初回だけ動く
    //   useEffect(reload, []) が再実行されず前のタブのデータが residual で残る。
    //   呼び出し側で key={activeTab} を付けて明示的に作り直すことで防ぐ（下の <Stack> 参照）。
    const renderActiveSection = () => {
        switch (activeTab) {
            case 'users':
                // ユーザー：部署一覧を渡し、フォームの部署ドロップダウンで使う
                return <UserSection departments={departmentList} />

            case 'departments':
                // 部署：名前1項目のCRUD。api の戻り値を {id, name} に正規化して渡す。
                // 変更後は onChanged で親の部署一覧も取り直し、プロジェクトのドロップダウンへ反映
                return (
                    <MasterSection
                        title="部署"
                        itemLabel="部署名"
                        fetchItems={async () => (await departments()).map((d: Department) => ({ id: d.id, name: d.departmentName }))}
                        onCreate={createDepartment}
                        onUpdate={updateDepartment}
                        onDelete={deleteDepartment}
                        onChanged={reloadDepartments}
                    />
                )

            case 'categories':
                // カテゴリ：同じく名前1項目のCRUD
                return (
                    <MasterSection
                        title="カテゴリ"
                        itemLabel="カテゴリ名"
                        fetchItems={async () => (await categories()).map((c: Category) => ({ id: c.id, name: c.categoryName }))}
                        onCreate={createCategory}
                        onUpdate={updateCategory}
                        onDelete={deleteCategory}
                    />
                )

            case 'projects':
                // プロジェクト：名前＋所属部署。部署一覧は親から渡すので、
                // 別タブで部署を足しても切り替えた時点で選択肢に載っている
                return <ProjectSection departments={departmentList} />
        }
    }

    return (
        <div>
            <PageHeader title="管理" subtitle="ユーザー・部署・カテゴリ・プロジェクトの管理（管理者のみ）" />

            <Stack>
                <Tabs items={TAB_ITEMS} activeValue={activeTab} onChange={setActiveTab} />

                {/* key にタブ名を入れて、切り替えのたびにセクションを作り直す。
                    これが無いと部署→カテゴリの切替でコンポーネントが再利用され、
                    見出しだけカテゴリになって中身が部署のまま、という状態になる */}
                <div key={activeTab}>{renderActiveSection()}</div>
            </Stack>
        </div>
    )
}

export default AdminPage
