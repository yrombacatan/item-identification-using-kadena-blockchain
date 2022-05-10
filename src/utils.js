const getDate = () => {
    const date = new Date()
    const month = date.getMonth()
    const day = date.getDate()
    const year = date.getFullYear()
    
    return `${day}/${month + 1}/${year}`
}

const removePrefixK = (string) => {
    return string.at(0) === 'k' ? string.slice(2) : string
}

export {
    getDate,
    removePrefixK,
}