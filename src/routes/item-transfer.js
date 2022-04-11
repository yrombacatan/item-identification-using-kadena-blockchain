import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

import Pact from "pact-lang-api"
import kadenaAPI from "../kadena-config"

import { v4 as uuidv4 } from 'uuid';

const ItemTransfer = () => {
  const [item, setItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [requestKey, setRequestkey] = useState('')
  const [result, setResult] = useState('')
  const params = useParams()

  const fetchItem = async (id) => {
    try {
      const cmd = {
        pactCode: `(jbsi.product_identification.item-details "${id}")`,
        meta: Pact.lang.mkMeta(
          kadenaAPI.meta.sender,
          kadenaAPI.meta.chainId,
          kadenaAPI.meta.gasPrice,
          kadenaAPI.meta.gasLimit,
          kadenaAPI.meta.creationTime(),
          kadenaAPI.meta.ttl
        ),
        networkId: kadenaAPI.meta.networkId
      }

      const { result } = await Pact.fetch.local(cmd, kadenaAPI.meta.localhost)

      if(result.status === 'failure') {
        setItem('')
        setLoading(false)
        return setError(result.error.message)
      }

      const item = {...result.data.body, keys: result.data.keys }

      setLoading(false)
      setError(false)
      setItem(item)

    } catch (error) {
      setItem('')
      setLoading(false)
      return setError(error.message)
    }
  }

  const handleInputChange = e => setReceiverAddress(e.target.value)

  const handleTransfer = async () => {
    try {
      const activityId = uuidv4()
      const cmd = {
        pactCode: `(jbsi.product_identification.transfer-item "${item.keys}" "${activityId}" (read-keyset "receiver-keyset"))`,
        envData: {
          "receiver-keyset": [receiverAddress],
        },
        keyPairs: {
            publicKey: "9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
            secretKey: "a44dd7fd3dde24724c41f4c8c654cb78ec80f0b6c761c4520570c2aadf8bf4e5",
        },
        meta: Pact.lang.mkMeta(
          kadenaAPI.meta.sender,
          kadenaAPI.meta.chainId,
          kadenaAPI.meta.gasPrice,
          kadenaAPI.meta.gasLimit,
          kadenaAPI.meta.creationTime(),
          kadenaAPI.meta.ttl
        ),
        networkId: kadenaAPI.meta.networkId
      }

      const { requestKeys } = await Pact.fetch.send(cmd, kadenaAPI.meta.localhost)
      setRequestkey(requestKeys[0])

    } catch (error) {
      return setError(error.message)
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
    if(! params.id) return
    let allow = true
    if(allow) fetchItem(params.id)
    
    // cleanup effect
    return () => allow = false
  }, [params.id])

  useEffect(() => {
    if(! requestKey) return
    let allow = true
    if(allow) handleListen(requestKey)
    
    // cleanup effect
    return () => allow = false
  }, [requestKey])

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {item && (
        <main className='md:w-3/4 mx-auto p-5'>
        <h1 className='text-2xl font-semibold my-10 text-center'>Item Details</h1>

        <Link to={`/items/${item.keys}/transfer`} 
          className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 sm:float-right mb-10 mx-auto sm:ml-auto'>Transfer</Link>

        <div className='flex flex-col gap-5 my-10 md:flex-row clear-both'>
          <div className='w-full h-56 bg-gray-100 rounded shadow md:flex-none md:w-1/2'></div>
          <div className='md:w-1/2'>
            <h2 className='font-bold text-xl text-gray-700 mb-2'>{item.name}</h2>
            <div className='w-20 h-20 bg-gray-100 rounded'></div>

            <div>
              <p className='font-semibold text-gray-500 text-sm mt-5'>Owned by</p>
              <p className='text-sm overflow-auto mt-1'>{item.guard.keys}</p>
            </div>

            <div>
              <p className='font-semibold text-gray-500 text-sm mt-5'>Description</p>
              <p className='text-sm overflow-auto mt-1 ='>{item.description}</p>
            </div>
            
          </div>
        </div>

        <div className="flex justify-center flex-col">
            <div>
                <label className="block">Account Address</label>
                <input name="receiver-address" className="w-full border p-2 rounded"
                  value={receiverAddress}
                  onChange={handleInputChange}/>
            </div>
            <div>
                <button className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 mt-5'
                  onClick={handleTransfer}>Submit</button>
            </div>
        </div>
      </main> 
      )}
    </>
  )
  
        
}

export default ItemTransfer