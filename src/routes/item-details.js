import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import Pact from 'pact-lang-api'
import kadenaAPI from '../kadena-config'

const ItemDetails = () => {
  const [items, setItems] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const params = useParams()

  console.log('Item Id:', params.id)
  const fetchItems = async () => {
    try {
      const cmd = {
        pactCode: "(jbsi.product_identification.item-all)",
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
      console.log(result)

      if(result.status === 'failure') {
        setItems('')
        setLoading(false)
        return setError(result.error.message)
      }

      setLoading(false)
      setError(false)
      setItems(result.data)

    } catch (error) {
      setItems('')
      setLoading(false)
      return setError(error.message)
    }
    
  }

  useEffect(() => {
    let allow = true
    //if(allow) fetchItems()
    
    // cleanup effect
    return () => allow = false
  }, [])

  return (
    <div className='md:w-3/4 mx-auto text-center p-10'>
      <h1 className='text-2xl font-semibold my-10'>Dashboard</h1>

      <button className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 block mx-auto sm:ml-auto sm:mr-20'>Create</button>

    </div>  
  )
}

export default ItemDetails