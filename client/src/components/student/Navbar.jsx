import React from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

import { useAppContext } from "../../context/AppContext";

function NavBar() {
  const isCourseListPage = location.pathname.includes("/course-list");
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { isEducator } = useAppContext();
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-r-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {user && (
            <>
              <button
                onClick={() => {
                  navigate("/educator");
                }}
                className="cursor-pointer"
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              |<Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-800 cursor-pointer"
            onClick={() => {
              openSignIn();
            }}
          >
            Create Account
          </button>
        )}
      </div>
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-2 sm:gap-2 max-sm:text-xs">
          {user && (
            <>
              <button
                onClick={() => {
                  navigate("/educator");
                }}
                className="cursor-pointer"
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              |<Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => {
              openSignIn();
            }}
          >
            <img src={assets.user_icon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
}

export default NavBar;
