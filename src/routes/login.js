import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import { connectWallet, fetchAccount } from "../wallet";

const Login = () => {
    const [address, setAddress] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleInputChange = e => setAddress(e.target.value)

   
    const handleConnectButton = async () => {
        try {
            await fetchAccount(address)
            await connectWallet(address)
    
            localStorage.setItem("accountAddress", JSON.stringify([address]))
            navigate("/items")
        } catch (error) {
            console.log(error.message)
        }
    }
   
    return (
       <main className="w-full flex justify-center">
           <div className="md:w-1/2 md:mt-56 mt-10 py-10 px-5">
                <h1 className="text-2xl font-semibold">Product Identification  | <span className="text-neutral-400">Powered by Kadena</span></h1>

                <div className="flex flex-col mt-10">
                    <label className="text-gray-500 font-bold">Wallety Address</label>
                    <input className="p-2 border rounded" value={address} onChange={handleInputChange}/>
                </div>
                
                <button className="px-5 py-2 bg-indigo-500 rounded shadow text-white mt-10"
                    onClick={handleConnectButton}>Connect</button>
           </div>
       </main>
    )
}

export default Login
