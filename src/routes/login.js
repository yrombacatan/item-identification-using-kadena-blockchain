import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import { connectWallet, fetchAccount } from "../wallet";

import { ToastifyContainer, toastError } from "../components/Toastify";

const Login = () => {
    const [address, setAddress] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleInputChange = e => setAddress(e.target.value)
   
    const handleConnectButton = async () => {
        try {
            const { data } = await fetchAccount(address)
            await connectWallet(data.account)
    
            localStorage.setItem("accountAddress", JSON.stringify(data.account))
            navigate("/items")
        } catch (error) {
           toastError(error.message)
        }
    }
   
    return (
       <main className="w-full h-screen flex justify-center">
           <div className="md:w-1/2 md:mt-56 mt-10 py-10 px-5">
                <h1 className="text-2xl font-semibold">Product Identification  | <span className="text-neutral-400">Powered by Kadena</span></h1>

                <div className="flex flex-col mt-10">
                    <label className="text-gray-500 font-bold">Wallet Address</label>
                    <input className="p-2 border rounded" value={address} onChange={handleInputChange}/>
                </div>
                
                <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded shadow text-white mt-10"
                    onClick={handleConnectButton}>Connect</button>
           </div>

           <ToastifyContainer />
       </main>
    )
}

export default Login
