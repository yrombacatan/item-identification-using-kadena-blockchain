import React from "react"

const Login = () => {
    return (
       <div className="w-full flex justify-center">
           <div className="mt-10 md:w-1/2 md:mt-56 py-10 px-5">
                <h1 className="text-2xl font-semibold">Product Identification  | <span className="text-neutral-400">Powered by Kadena</span></h1>
                <button className="px-5 py-2 bg-indigo-500 rounded shadow text-white mt-10">Login using Wallet</button>
           </div>
       </div>
    )
}

export default Login
