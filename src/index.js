import React from "react";
import ReactDOM  from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App"
import Documents from "./routes/documents";
import Login from "./routes/login";

import "./index.css"

const rootElement = document.getElementById('root')

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<App />}>
                <Route path="/document" element={<Documents />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    rootElement
)