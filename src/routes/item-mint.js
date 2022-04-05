import React, { useState, useEffect } from 'react'
import Pact from 'pact-lang-api'
import kadenaAPI from '../kadena-config'

const ItemMint = () => {
    const [requestKey, setRequestKey] = useState('')

    const handleMintButton = async () => {
        try {
            const cmd = {
                pactCode: `(jbsi.product_identification.create-item 'item125 'Doggies "http://doggies.com" "Great doggies muah!" "10/2/11" true (read-keyset 'admin-keyset) 'act126)`,
                envData: {
                    "admin-keyset": ["f7f4a6f7848bd8a955b0a84f4da5d6c9000104c8c0cae4f5e31cb708efdbeaa0"],
                },
                keyPairs: {
                    publicKey: "f7f4a6f7848bd8a955b0a84f4da5d6c9000104c8c0cae4f5e31cb708efdbeaa0",
                    secretKey: "a43b6230f0b741e04299c386bec45ddaef230e4bd6ff6d095af5e9dcd8115c47",
                },
                meta: Pact.lang.mkMeta(
                    "1853c995c7d69283f3eecadfb32e3f69da7f615bcffbe342d2c0fd9e5949d4f6",
                    kadenaAPI.meta.chainId,
                    kadenaAPI.meta.gasPrice,
                    kadenaAPI.meta.gasLimit,
                    kadenaAPI.meta.creationTime(),
                    kadenaAPI.meta.ttl
                ),
                networkId: kadenaAPI.meta.networkId
            }

            const res = await Pact.fetch.send(cmd, kadenaAPI.meta.localhost)
            console.log(res)
            setRequestKey(res.requestKeys[0])
            console.log(res.requestKeys[0])

        } catch (error) {
            console.log(error.message)
        }
    }

  

    useEffect(() => {
        console.log('im a side effect')
        if(! requestKey) return

        const handleListen = async (requestKey) => {
            const res = await Pact.fetch.listen({listen: requestKey}, kadenaAPI.meta.localhost)
            console.log(res)
        }

        handleListen(requestKey)
    }, [requestKey])


    return (
        <div className="flex justify-center">
            <p>Mint Items</p>
            <button className="py-2 px-10 bg-blue-500 rounded shadow font-medium text-white" onClick={handleMintButton}>Mint</button>
        </div>
        
    )
}

export default ItemMint