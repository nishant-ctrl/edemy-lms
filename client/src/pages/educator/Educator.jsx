import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/educator/Navbar";

function Educator() {
    return (
      <div>
        <Navbar />
        <div>
          <Outlet />
        </div>
      </div>
    );
}

export default Educator;
