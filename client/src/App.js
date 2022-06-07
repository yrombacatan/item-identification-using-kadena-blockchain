import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Header from "./components/Header";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accountAddress")) {
      navigate("/");
    }
  }, []);

  return (
    <div className="w-full">
      <div className="sm:w-4/5 sm:mx-auto min-h-screen shadow p-5 sm:p-10 ">
        <Header />
        {<Outlet />}
      </div>
    </div>
  );
}

export default App;
