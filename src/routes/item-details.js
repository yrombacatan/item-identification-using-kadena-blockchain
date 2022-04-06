import React from 'react'
import { useParams, Link } from 'react-router-dom'

const ItemRow = ({ data }) => {
  return data.map((activity, _i) => {
    return (
      <tr className="whitespace-nowrap" key={_i}>
          <td className="px-6 py-4 text-sm text-gray-500">
            <div className="text-sm text-gray-500">{activity.event}</div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-500">{activity.from}</div>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-500">{activity.to}</div>
          </td>
          <td className="px-6 py-4">
              <div className="text-sm text-gray-500">{activity.date}</div>
          </td>
      </tr>
    )
  })
}

const itemActivityList = [
  {
    event: "Created",
    from: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    to: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    date: "10/10/22"
  },
  {
    event: "Transferred",
    from: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    to: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    date: "10/10/22"
  },
  {
    event: "Transferred",
    from: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    to: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    date: "10/10/22"
  },
  {
    event: "Transferred",
    from: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    to: "k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9",
    date: "10/10/22"
  }
]

const ItemDetails = () => {
  const params = useParams()
  console.log('Item Id:', params.id)

  return (
    <main className='md:w-3/4 mx-auto p-5'>
      <h1 className='text-2xl font-semibold my-10 text-center'>Item Details</h1>

      <Link to={`/items/${params.id}/transfer`} 
        className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 sm:float-right mb-10 mx-auto sm:ml-auto'>Transfer</Link>

      <div className='flex flex-col gap-5 my-10 md:flex-row clear-both'>
        <div className='w-full h-56 bg-gray-100 rounded shadow md:flex-none md:w-1/2'></div>
        <div className='md:w-1/2'>
          <h2 className='font-bold text-xl text-gray-700 mb-2'>Kitties</h2>
          <div className='w-20 h-20 bg-gray-100 rounded'></div>

          <div>
            <p className='font-semibold text-gray-500 text-sm mt-5'>Owned by</p>
            <p className='text-sm overflow-auto mt-1'>k:9fa7295ffe6cb6151a91682992c7652191f94c071260313f7b60657f75a9d8d9</p>
          </div>

          <div>
            <p className='font-semibold text-gray-500 text-sm mt-5'>Description</p>
            <p className='text-sm overflow-auto mt-1 ='>Great kitties muah, lovable, adorable unique items Great kitties muah, lovable, adorable unique items</p>
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
                  <ItemRow data={itemActivityList} />
              </tbody>
          </table>
        </div>
      </div>
    </main>  
  )
}

export default ItemDetails