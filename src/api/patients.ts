
export const patients = async () => {
    const response = await fetch('http://localhost:8080/api/patients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}