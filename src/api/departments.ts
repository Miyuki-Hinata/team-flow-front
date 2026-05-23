export const departments = async () => {
    const response = await fetch('http://localhost:8080/api/departments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}