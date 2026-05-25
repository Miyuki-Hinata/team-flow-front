export const users = async () => {
    const response = await fetch('http://localhost:8080/api/users', {
         method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response.json()
}