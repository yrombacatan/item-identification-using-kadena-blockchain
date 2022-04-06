const connectWallet = async () => {
    const host = "http://localhost:9467/v1/accounts"
    const res = await fetch(host, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            asset: 'kadena'
        })
    })

    return await res.json()
}

const checkWallet = async () => {
    // check if already exist
    if(localStorage.getItem('accountAddress')) {
        return { status: 'success', data: JSON.parse(localStorage.getItem('accountAddress'))}
    } 

    // else connect and store
    try {
        const result = await connectWallet()

        if(result.status === 'success') {
            localStorage.setItem('accountAddress', JSON.stringify(result.data))
        }

        return result

    } catch (error) {
        console.log('im here utility catch')
        return {status: 'error', data: error}
    }
}

const removedPrefixK = (accountList) => {
    // we use the first account address
    // removed prefix "k"
    return accountList[0].at(0) === 'k' ? accountList[0].slice(2) : accountList[0]
}

export { checkWallet, removedPrefixK }