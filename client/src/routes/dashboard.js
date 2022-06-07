import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Pact from "pact-lang-api"
import kadenaAPI from "../kadena-config"

const ActivityRow = ({ activityList }) => {
  return activityList.map((activity, _i) => {
    return (
      <tr className="whitespace-nowrap" key={_i}>
          <td className="px-6 py-4 text-sm text-gray-500">
            {/* <div className="text-sm text-gray-500">{activity.event}</div> */}
            <div className="text-sm text-gray-500">Item Name</div>
          </td>
          <td className="px-6 py-4">
            {/* <div className="text-sm text-gray-500">{activity.from.keys}</div> */}
            <div className="text-sm text-gray-500">Description</div>
          </td>
          <td className="px-6 py-4">
              {/* <div className="text-sm text-gray-500">{activity.to.keys}</div> */}
              <div className="text-sm text-gray-500">Item Activity</div>
          </td>
      </tr>
    )
  })
}

const Dashboard = () => {
  const [item, setItem] = useState('')
  const [activities, setActivities] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const params = useParams()
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
        setItem('')
        setLoading(false)
        return setError(result.error.message)
      }
      
      const itemList = result.data.map(v => ({...v.body, keys: v.keys}))
      console.log(itemList)

      setLoading(false)
      setError(false)
      setItem(itemList)

    } catch (error) {
      setItem('')
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
    <>
      {/* {loading && <p>Loading...</p>}
      {error && <p>{error}</p>} */}

        <main className='md:w-3/4 mx-0 p-5'>
        <h1 className='text-2xl font-semibold my-10 text-center'>Dashboard</h1>

        <div className='flex gap-5 sm:justify-end'>
          <button
            className='bg-blue-500 rounded shadow text-white font-semibold px-12 py-2'>Create</button>
        </div>

        <div className='flex flex-col gap-5 my-10 md:flex-row clear-both'>
          <div className='md:w-full'>
            {/* <h2 className='font-bold text-xl text-gray-700 mb-2'>{item.name}</h2> */}
            <div className='w-80 h-20 bg-gray-100 rounded'></div>

            <div>
              <p className='font-semibold text-gray-500 text-sm mt-5'>Owned by</p>
              {/* <p className='text-sm overflow-auto mt-1'>{item.guard.keys}</p> */}
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
                            Item Name
                        </th>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            Description
                        </th>
                        <th className="px-6 py-2 text-xs text-gray-500">
                            Received Date
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                  {/* { activities ? <ActivityRow activityList={activities}/> : null}  */}
                  {/* <ActivityRow/> */}
                </tbody>
            </table>
          </div>
        </div>
      </main> 
  
    </>
  )
}

export default Dashboard