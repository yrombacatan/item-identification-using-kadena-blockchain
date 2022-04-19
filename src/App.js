import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    if(! localStorage.getItem('accountAddress')) {
      navigate('/')
    }
  }, [])

  return (
    <>
        {<Outlet />}
    </>
  )
}

export default App