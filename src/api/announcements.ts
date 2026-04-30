export const announcements = async () => {
    const response = await fetch('http://localhost:8080/api/announcements', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response.json()
}

export const markAsRead = async (id: number) => {
    const response = await fetch(`http://localhost:8080/api/announcements/${id}/read`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
}