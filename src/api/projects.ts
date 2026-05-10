
export const projects = async () => {
    const response = await fetch('http://localhost:8080/api/projects', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}