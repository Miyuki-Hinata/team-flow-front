import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PageHeader } from '../components/ui/PageHeader'
import { MasterSection } from '../components/admin/MasterSection'
import { ProjectSection } from '../components/admin/ProjectSection'
import type { Department } from '../types/department'
import type { Category } from '../types/category'
import { departments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments'
import { categories, createCategory, updateCategory, deleteCategory } from '../api/categories'

// 管理ページ（admin 限定）。部署・カテゴリ・プロジェクトのマスタを追加/編集/削除する。
// 部署・カテゴリは「名前1項目」なので汎用 MasterSection を使い回し、
// プロジェクトは「名前＋部署」なので専用 ProjectSection を使う。
// ルートの admin ガードは S5（AdminRoute）で付ける。

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

    return (
        <div>
            <PageHeader title="管理" subtitle="部署・カテゴリ・プロジェクトの管理（管理者のみ）" />

            <Stack>
                {/* 部署：名前1項目のCRUD。api の戻り値を {id, name} に正規化して渡す。
                    変更後は onChanged で親の部署一覧も取り直し、プロジェクトのドロップダウンへ反映 */}
                <MasterSection
                    title="部署"
                    itemLabel="部署名"
                    fetchItems={async () => (await departments()).map((d: Department) => ({ id: d.id, name: d.departmentName }))}
                    onCreate={createDepartment}
                    onUpdate={updateDepartment}
                    onDelete={deleteDepartment}
                    onChanged={reloadDepartments}
                />

                {/* カテゴリ：同じく名前1項目のCRUD */}
                <MasterSection
                    title="カテゴリ"
                    itemLabel="カテゴリ名"
                    fetchItems={async () => (await categories()).map((c: Category) => ({ id: c.id, name: c.categoryName }))}
                    onCreate={createCategory}
                    onUpdate={updateCategory}
                    onDelete={deleteCategory}
                />

                {/* プロジェクト：名前＋所属部署。部署一覧は親から渡す（追加した部署が即ドロップダウンに出る） */}
                <ProjectSection departments={departmentList} />
            </Stack>
        </div>
    )
}

export default AdminPage
