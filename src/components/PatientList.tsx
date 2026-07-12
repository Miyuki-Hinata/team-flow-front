import type { Patient } from '../types/patient'
import { PatientCard } from './ui/PatientCard'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

type Props = {
    patients: Patient[]
}

// カード全体を包むリンク。<a> 既定の下線・紫を打ち消す（お知らせ系・タスク系と同じ方針）
const CardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`

// カード列：縦積み＋ spacing.md の gap（他一覧と統一して一体感を出す）
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const PatientList = ({ patients }: Props) => {
    return (
        <List>
            {patients.map(patient => (
                <CardLink to={`/patients/${patient.id}`} key={patient.id}>
                    <PatientCard patient={patient} />
                </CardLink>
            ))}
        </List>
    )
}

export default PatientList
