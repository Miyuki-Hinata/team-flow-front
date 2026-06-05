import { useState, useEffect } from 'react'
import type { Task } from '../types/task'
import { getPatientById } from '../api/patients'
import { useNavigate } from 'react-router-dom'
import { getTasksByPatientId } from '../api/tasks'
import { useParams } from 'react-router-dom'
import type { Patient } from '../types/patient'

const PatientDetailPage = () => {
    const navigate = useNavigate()
    
    const { id }  = useParams()

    const [tasks, setTasks] = useState<Task[] | null>(null);

    const [patient, setPatient] = useState<Patient | null>(null)

    useEffect(() => {
        getPatientById(Number(id))
            .then(data => {
                setPatient(data)
            })
            .catch((error) => {
                alert(error.message)
                navigate('/patients')
            })
        getTasksByPatientId(Number(id))
            .then(data => {
                setTasks(data)
            })
            .catch((error) => {
                alert(error.message)
                navigate('/patients')
            })
                
    }, [id])
    
    return (
        <div>
            {patient ? (
                <div>
                    <h2>{patient.lastName} {patient.firstName}</h2>
                    <p>生年月日：{patient.birth}</p>
                </div>
            ) : (
                <p>読み込み中...</p>
            )}
        </div>
    )
}

export default PatientDetailPage