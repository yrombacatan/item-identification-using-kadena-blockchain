import React from 'react'
import { useParams } from 'react-router-dom'

const ItemTransfer = () => {
    const params = useParams()
    console.log('Item Id:', params.id)

    return (
    <main className='md:w-3/4 mx-auto p-5'>
        <h1 className='text-2xl font-semibold my-10 text-center'>Item Details</h1>
  
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
  
        <div className="flex justify-center flex-col">
            <div>
                <label className="block">Account Address</label>
                <input name="receiver-address" className="w-full border p-2 rounded"/>
            </div>
            <div>
                <button className='bg-blue-500 rounded shadow text-white font-semibold px-5 py-2 mt-5'>Submit</button>
            </div>
        </div>
    </main>  
       
    )
}

export default ItemTransfer