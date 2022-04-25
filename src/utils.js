const getDate = () => {
    const date = new Date()
    const month = date.getMonth()
    const day = date.getDate()
    const year = date.getFullYear()
    
    return `${day}/${month + 1}/${year}`
}

export {
    getDate
}