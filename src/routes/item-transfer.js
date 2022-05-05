import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Pact from "pact-lang-api"
import kadenaAPI from "../kadena-config"
import { checkWallet, signTransaction } from "../wallet"
import { getDate } from '../utils'

import { v4 as uuidv4 } from 'uuid';

const ItemTransfer = () => {
  const [item, setItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [requestKey, setRequestkey] = useState('')
  const [result, setResult] = useState('')
  const params = useParams()
  const navigate = useNavigate()

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
      const account = checkWallet()
      const activityId = uuidv4()
      const date = getDate()
      const cmd = {
        pactCode: `(jbsi.product_identification.transfer-item "${item.keys}" "${activityId}" "${date}" (read-keyset "receiver-keyset"))`,
        caps: [],
        envData: {
          "receiver-keyset": [receiverAddress],
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
        <main className='p-4 sm:p-10'>
        <h1 className='text-2xl font-semibold my-10 text-center'>Item Transfer</h1>

        <div className='w-100 p-10 my-10 mx-auto bg-white rounded'>
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

          <div>
              <label className="block font-semibold text-gray-500">Account Address</label>
              <input name="receiver-address" className="w-full border p-2 rounded"
                value={receiverAddress}
                onChange={handleInputChange}/>
          </div>

          <div className="flex gap-5">
              <div>
                  <button className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 mt-5'
                    onClick={handleTransfer}>Submit</button>
              </div>
              <div>
                  <button className='bg-gray-200 rounded shadow text-black font-semibold px-5 py-2 mt-5'
                    onClick={() => navigate(`/items/${params.id}`)}>Cancel</button>
              </div>
          </div>
        </div>
      </main> 
      )}
    </>
  )
  
        
}

export default ItemTransfer