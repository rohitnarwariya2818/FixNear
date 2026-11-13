// import React from "react";
// import { X } from "lucide-react";

import { useState } from "react";
import Login from "./Login";
import Singup from "./Singup";
// import { createPortal } from "react-dom";

function Auth({ initialMode = "login", onAuthenticated }) {
  const [showLogin, setIsLogin] = useState(initialMode === "login");
  const [role, setRole] = useState("customer");

  return (
    <div>
      {showLogin ? (
        <>
          <div className="px-8 pt-6">
            <label htmlFor="auth-role" className="mb-2 block font-medium text-gray-700">
              Log in as
            </label>
            <select
              id="auth-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            >
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          <Login
            role={role}
            onAuthenticated={onAuthenticated}
            onSwitch={() => setIsLogin(false)}
          />
        </>
      ) : (
        <Singup
          onAuthenticated={onAuthenticated}
          onSwitch={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}

export default Auth;
