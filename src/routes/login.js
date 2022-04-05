import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import Pact from "pact-lang-api"
import kadenaAPI from "../kadena-config"

const Login = () => {
    const [address, setAddress] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleInputChange = e => setAddress(e.target.value)

    const handleConnectButton = async () => {
        // check address if exist on the blockchain
        try {
            const cmd = {
                pactCode: `(coin.details "${address}")`,
                meta: Pact.lang.mkMeta(
                    address,
                    kadenaAPI.meta.chainId,
                    kadenaAPI.meta.gasPrice,
                    kadenaAPI.meta.gasLimit,
                    kadenaAPI.meta.creationTime(),
                    kadenaAPI.meta.ttl
                  ),
                networkId: kadenaAPI.meta.networkId,
            }

            const { result } = await Pact.fetch.local(cmd, kadenaAPI.meta.host)
            console.log(result)

            if(result.status === "failure") return setError(result.error.message)
            
            // save account address to localstorage
            localStorage.setItem("accountAddress", result.data.account)

            // redirect to homepage
            navigate("/items")

        } catch (error) {
            setError(error.message)
        }
    }
   
    return (
       <div className="w-full flex justify-center">
           <div className="md:w-1/2 md:mt-56 mt-10 py-10 px-5">
                <h1 className="text-2xl font-semibold">Product Identification  | <span className="text-neutral-400">Powered by Kadena</span></h1>

                <div className="flex flex-col mt-10">
                    <label className="text-gray-500 font-bold">Wallety Address</label>
                    <input className="p-2 border rounded" value={address} onChange={handleInputChange}/>
                </div>
                
                <button className="px-5 py-2 bg-indigo-500 rounded shadow text-white mt-10"
                    onClick={handleConnectButton}>Connect</button>
           </div>
       </div>
    )
}

export default Login
