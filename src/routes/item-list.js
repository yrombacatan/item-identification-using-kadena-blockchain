import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Pact from 'pact-lang-api'
import kadenaAPI from '../kadena-config'

const ItemRow = ({ itemList }) => {
  return itemList.map((item, _i) => {
    return (
      <tr className="whitespace-nowrap" key={_i}>
          <td className="px-6 py-4 text-sm text-gray-500">
            <Link to={`/items/${item.keys}`} className="px-4 py-1 text-sm text-white bg-blue-400 rounded">{item.name}</Link>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {item.description}
              </div>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-500">{item.date}</div>
          </td>
      </tr>
    )
  })
}

const TableMessage = ({ msg }) => {
  return (
    <tr className="whitespace-nowrap">
      <td colSpan={3} className="text-sm text-gray-500 p-5">{msg}</td>
    </tr>
  )
}

const ItemList = () => {
  const [items, setItems] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

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
      if(result.status === 'failure') {
        setItems('')
        setLoading(false)
        return setError(result.error.message)
      }
      
      const itemList = result.data.map(v => ({...v.body, keys: v.keys}))
      console.log(itemList)

      setLoading(false)
      setError(false)
      setItems(itemList)

    } catch (error) {
      setItems('')
      setLoading(false)
      return setError(error.message)
    }
    
  }

  useEffect(() => {
    let allow = true
    if(allow) fetchItems()
    
    // cleanup effect
    return () => allow = false
  }, [])

  return (
    <main className='h-100 text-center p-4 sm:p-10'>
      <h1 className='text-2xl font-semibold text-center'>Dashboard</h1>

      <div className='w-100 h-80 p-10 my-10 mx-auto bg-white rounded'>
        <button className='bg-indigo-500 hover:bg-indigo-400 rounded shadow text-white font-semibold px-16 py-2 block mx-auto sm:ml-auto sm:mr-20 mb-5' onClick={() => navigate('/items/mint')}><i class="fa-solid fa-plus"></i>Create</button>
        <div className='w-40 h-28 bg-indigo-300 mx-auto rounded'>
          <p className='font-bold bg-indigo-500 text-white rounded-t'>User</p>
        </div>

        <p className='font-bold text-gray-700 my-10 overflow-auto'>k:40629476d403abc78584e5aec835683eaf2ba46441a7a4a89fa30982e87d18ea</p>
      </div>
      
      <div className="bg-white mt-10 p-10 rounded">
      <p className='font-semibold text-left'>ITEM LIST</p>
          <table className='w-full border-collapse my-10'>
              <thead className="bg-gray-400">
                  <tr>
                      <th className="px-6 py-2 text-xs text-white">
                          Item Name
                      </th>
                      <th className="px-6 py-2 text-xs text-white">
                          Description
                      </th>
                      <th className="px-6 py-2 text-xs text-white">
                          Received Date
                      </th>
                  </tr>
              </thead>
              <tbody className="bg-white">
                  {loading && <TableMessage msg="Loading"/>}
                  {error && <TableMessage msg={error}/>}
                  {items.length > 0 ? <ItemRow itemList={items} /> : <TableMessage msg="No items found, Mint now!" />}
              </tbody>
          </table>
      </div>

    </main>  
  )
}

export default ItemList