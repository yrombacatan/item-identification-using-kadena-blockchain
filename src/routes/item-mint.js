import React, { useState, useEffect } from 'react'
import Pact from 'pact-lang-api'

import kadenaAPI from '../kadena-config'
import { checkWallet, signTransaction } from '../wallet';

import { v4 as uuidv4 } from 'uuid';

const ItemMint = () => {
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
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
            const account = checkWallet()
            const date = getDate()
            const itemId = uuidv4()
            const activityId = uuidv4() 
            const url = "https://some-fixed-ipfs-url.com"

            const cmd = {
                pactCode: `(jbsi.product_identification.create-item "${itemId}" "${inputList.name}" "${url}" "${inputList.description}" "${date}" true (read-keyset "user-keyset") "${activityId}")`,
                caps: [],
                envData: {
                    "user-keyset": [account],
                },
                sender: `k:${account}`,
                chainId: kadenaAPI.meta.chainId,
                gasLimit: kadenaAPI.meta.gasLimit,
                gasPrice: kadenaAPI.meta.gasPrice,
                signingPubKey: account, // account with no prefix k here
                ttl: kadenaAPI.meta.creationTime(),
                networkId: kadenaAPI.meta.networkId,
            }

            const { requestKeys } = await signTransaction(cmd)
            setRequestKey(requestKeys[0])   

        } catch (error) {
            console.log(error.message)
        }
    }

    const handleListen = async (requestKey) => {
        try {
          setLoading(true)
          setError(false)
          setResult('')
    
          const { result, gas } = await Pact.fetch.listen({ listen: requestKey }, kadenaAPI.meta.localhost)
          if(result.status === 'failure') {
            setLoading(false)
            return setError(result.error.message)
          }
    
          console.log(result)
          setResult(result)
          setLoading(false)
        } catch (error) {
          setLoading(false)
          setError(error.message)
          console.log('im here')
        }
      }

    useEffect(() => {
        if(! requestKey) return
        let allow = true
        if(allow) handleListen(requestKey)
        
        // cleanup effect
        return () => allow = false
    }, [requestKey])

    return (
        <main className="md:w-3/4 mx-auto flex justify-center min-h-screen items-center p-5">
            <div className='text-center w-full'>
                <h1 className='text-2xl font-bold'>Mint your Item</h1>
                <div className='w-36 h-36 bg-gray-500 rounded mx-auto my-10'></div>
                <div className='sm:w-1/2 mx-auto'>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4'>Name</label>
                        <input type="text" name='name' className='flex-auto border p-2 rounded' 
                            value={inputList.name} 
                            onChange={handleInputChange}/>
                    </div>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4'>Description</label>
                        <input type="text" name='description' className='flex-auto border p-2 rounded' 
                            value={inputList.description} 
                            onChange={handleInputChange}/>
                    </div>
                    <div className='flex flex-col mb-5 sm:flex-row sm:items-center'>
                        <label className='text-left font-semibold text-gray-500 sm:basis-1/4'>Attributes</label>
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