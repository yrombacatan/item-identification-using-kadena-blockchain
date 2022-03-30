import React from 'react'
import { Outlet, Link } from 'react-router-dom'

function App() {
  return (
    <div>
        <header>
            Header
            <nav>
                <ul>
                    <li>
                        <Link to="/document">Documents</Link>
                    </li>
                </ul>
            </nav>
        </header>

        <Outlet />
        
        <footer>
            Footer
        </footer>
    </div>
  )
}

export default App