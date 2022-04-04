import React from "react"
import { Link } from "react-router-dom"

const Nav = () => {
    return (
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
    )
}

export default Nav
