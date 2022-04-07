import React, { useState, useEffect } from 'react'
import Pact from 'pact-lang-api'

import kadenaAPI from '../kadena-config'
import { checkWallet, removedPrefixK } from '../wallet';

import { v4 as uuidv4 } from 'uuid';

const ItemMint = () => {
    const [requestKey, setRequestKey] = useState('')
    const [inputList, setInputList] = useState({
        name: '',
        description: '',
        attributes: '',
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setInputList(prev => ({...prev, [name]: value }))
    }

    const getDate = () => {
        const date = new Date()
        const month = date.getMonth()
        const day = date.getDate()
        const year = date.getFullYear()
        return `${day}/${month + 1}/${year}`
    }

    const handleMintButton = async () => {
        try {
            const { status, data } = await checkWallet()

            if(status === "error") {
                return console.log(data)
            }

            const date = getDate()
            const itemId = uuidv4()
            const activityId = uuidv4() 
            const accountAddress = removedPrefixK(data)
            const url = "https://some-fixed-ipfs-url.com"

            const cmd = {
                pactCode: `(jbsi.product_identification.create-item "${itemId}" "${inputList.name}" "${url}" "${inputList.description}" "${date}" true (read-keyset "user-keyset") "${activityId}")`,
                envData: {
                    "user-keyset": [accountAddress],
                },
                keyPairs: {
                    publicKey: "9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
                    secretKey: "a44dd7fd3dde24724c41f4c8c654cb78ec80f0b6c761c4520570c2aadf8bf4e5",
                },
                meta: Pact.lang.mkMeta(
                    "9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
                    kadenaAPI.meta.chainId,
                    kadenaAPI.meta.gasPrice,
                    kadenaAPI.meta.gasLimit,
                    kadenaAPI.meta.creationTime(),
                    kadenaAPI.meta.ttl
                ),
                networkId: kadenaAPI.meta.networkId
            }
            const res = await Pact.fetch.send(cmd, kadenaAPI.meta.localhost)
            setRequestKey(res.requestKeys[0])   

        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        if(! requestKey) return

        const handleListen = async (requestKey) => {
            const res = await Pact.fetch.listen({listen: requestKey}, kadenaAPI.meta.localhost)
            console.log(res)
        }

        handleListen(requestKey)
    }, [requestKey])


    return (
        <main className="md:w-3/4 mx-auto flex justify-center min-h-screen items-center p-5">
            <div className='text-center w-full'>
                <h1 className='text-2xl font-bold'>Mint your Item</h1>
                <div className='w-36 h-36 bg-gray-500 rounded mx-auto my-10'></div>
                <div className='sm:w-1/2 mx-auto'>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4 sm:text-center sm:border-l'>Name</label>
                        <input type="text" name='name' className='flex-auto border p-2 rounded' 
                            value={inputList.name} 
                            onChange={handleInputChange}/>
                    </div>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4 sm:text-center sm:border-l'>Description</label>
                        <input type="text" name='description' className='flex-auto border p-2 rounded' 
                            value={inputList.description} 
                            onChange={handleInputChange}/>
                    </div>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4 sm:text-center sm:border-l'>Attributes</label>
                        <input type="text" name='attributes' className='flex-auto border p-2 rounded' 
                            value={inputList.attributes} 
                            onChange={handleInputChange}/>
                    </div>
                </div>
                <div>
                    <button className="py-2 px-10 bg-blue-500 rounded shadow font-medium text-white" onClick={handleMintButton}>Submit</button>
                </div>
            </div>
        </main>
    )
}

export default ItemMint