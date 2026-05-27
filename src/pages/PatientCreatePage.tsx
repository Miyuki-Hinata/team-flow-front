import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPatient } from '../api/patients'
import { departments as fetchDepartments } from '../api/departments'
import { users as fetchUsers } from '../api/users'
import type { PatientRequest } from '../types/patientRequest'
import type { Department } from '../types/department'
import type { User } from '../types/user'

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
    
    const navigate = useNavigate()
    
    // 初回マウント時に部署と医師を取得
    useEffect(() => {
        fetchDepartments().then(data => setDepartments(data))
        fetchUsers('DOCTOR').then(data => setDoctors(data))
    }, [])

    // 汎用ハンドラ
    const handleChange = (field: keyof PatientRequest) => 
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setPatient({ ...patient, [field]: e.target.value })
        }
    
    // 送信処理
    const handleSubmit = async () => {
        await createPatient(patient)
        navigate('/patients')  // 一覧に戻る
    }
    
    return (
        <div>
            <h1>患者作成</h1>
            <input
                type="text"
                placeholder="苗字"
                value={patient.lastName}
                onChange={handleChange('lastName')}
            />

            <input
                type="text"
                placeholder="名前"
                value={patient.firstName}
                onChange={handleChange('firstName')}
            />

            <input
                type="tel"
                placeholder="電話番号"
                value={patient.tel ?? ''}
                onChange={handleChange('tel')}
            />

            
            {/* セレクト：部署 */}
            <select
                value={patient.departmentId ?? ''}
                onChange={(e) => setPatient({
                    ...patient,
                    departmentId: e.target.value === '' ? undefined : Number(e.target.value)
                })}
            >
                <option value="">部署を選択</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
            </select>
            
            {/* セレクト：担当医 ← 自分で書いてみてください */}
            <select
                value={patient.doctorId ?? ''}
                onChange={(e) => setPatient({
                    ...patient,
                    doctorId: e.target.value === '' ? undefined : Number(e.target.value)
                })}
            >
                <option value="">担当医を選択</option>
                {
                    doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.lastName + ' ' + d.firstName}</option>
                    ))
                }
            </select>


            
            {/* 送信ボタン */}
            <button onClick={handleSubmit}>作成</button>
        </div>
    )
}

export default PatientCreatePage