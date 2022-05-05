import React from "react";
import ReactDOM  from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App"
import Login from "./routes/login";
import ItemList from "./routes/item-list";
import ItemDetails from "./routes/item-details";
import ItemMint from "./routes/item-mint";
import ItemTransfer from "./routes/item-transfer";
import Dashboard from "./routes/dashboard";

import "./index.css"
import styles from './styles/globals.css'

const rootElement = document.getElementById('root')

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<App />}>
                <Route path="/items" element={<ItemList />} />
                <Route path="/items/:id" element={<ItemDetails />}/>
                <Route path="/items/:id/transfer" element={<ItemTransfer />} />
                <Route path="/items/mint" element={<ItemMint />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    rootElement
)