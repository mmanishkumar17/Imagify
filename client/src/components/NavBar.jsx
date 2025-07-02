import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { Appcontext } from "../context/Appcontext";

const NavBar = () => {
  const { user, setShowLogin, logout, credit } = useContext(Appcontext);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4">
      {/* Logo Section */}
      <Link to="/">
        <img src={assets.logo} alt="logo" className="w-28 sm:w-32 lg:w-40" />
      </Link>

      {/* User Section */}
      <div>
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/buy")}
              className="flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700 cursor-pointer"
            >
              <img src={assets.credit_star} alt="credit_star" className="w-5" />
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Credits Left : {credit}
              </p>
            </button>

            <p className="text-gray-600 pl-4 max-sm:hidden">Hi, {user.name}!</p>

            <div className="relative group cursor-pointer">
              <img
                src={assets.profile_icon}
                alt="profile_icon"
                className="w-10 drop-shadow"
              />
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 rounded text-black pt-12">
                <ul className="list-none p-2 bg-white rounded-md border text-sm">
                  <li onClick={logout} className="py-1 px-2 cursor-pointer pr-10">Logout</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-5">
            <p onClick={() => navigate("/buy")} className="cursor-pointer">
              Pricing
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="cursor-pointer bg-zinc-800 text-white px-7 sm:px-10 py-2 text-sm rounded-full"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
