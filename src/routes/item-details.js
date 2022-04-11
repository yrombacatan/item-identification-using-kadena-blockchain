import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

import Pact from "pact-lang-api"
import kadenaAPI from "../kadena-config"

const ActivityRow = ({ activityList }) => {
  return activityList.map((activity, _i) => {
    return (
      <tr className="whitespace-nowrap" key={_i}>
          <td className="px-6 py-4 text-sm text-gray-500">
            <div className="text-sm text-gray-500">{activity.event}</div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-500">{activity.from.keys}</div>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-500">{activity.to.keys}</div>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-500">{activity.date}</div>
          </td>
      </tr>
    )
  })
}

const ItemDetails = () => {
  const [item, setItem] = useState('')
  const [activities, setActivities] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
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
        setActivities('')
        setLoading(false)
        return setError(result.error.message)
      }

      const item = {...result.data.body, keys: result.data.keys }
      const activityList = [...result.data.activities ]

      setLoading(false)
      setError(false)
      setItem(item)
      setActivities(activityList)

    } catch (error) {
      setItem('')
      setActivities('')
      setLoading(false)
      return setError(error.message)
    }
  }

  useEffect(() => {
    let allow = true
    if(allow) fetchItem(params.id)
    
    // cleanup effect
    return () => allow = false
  }, [params.id])


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

        <div>
          <h2 className='font-bold text-xl text-gray-700 mb-2'>Item Activity</h2>
          <div className="border-b border-gray-200 shadow overflow-auto">
            <table className='w-full'>
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            Event
                        </th>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            From
                        </th>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            To
                        </th>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                  { activities ? <ActivityRow activityList={activities}/> : null} 
                </tbody>
            </table>
          </div>
        </div>
      </main> 
      )}
    </>
  )
}

export default ItemDetails