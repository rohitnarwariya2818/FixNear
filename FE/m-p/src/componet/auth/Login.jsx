// import React from 'react'
import { useState } from "react";
import API from "../api.js";


function Login({ onSwitch, onAuthenticated, role }) {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handelsubmit = async (e) => {
    e.preventDefault();
    try {

      setLoading(true);
      setMessage("");

      const data = {
        Email: email,
        Password: password,
        role,
      };
      // console.log(data);
      const response = await API.post("/auth/login", data);

      setMessage(response.data.message || "successful")

      onAuthenticated?.(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
      alert(error.response?.data?.message || "login failed,Please try again");
    }
    finally {
      setLoading(false);
    }

  }



  return (
    <div className=" flex items-center justify-center mt-25 ">


      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">


        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome to <span className="text-orange-500">FixNear</span>
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Log in to your {role} account.
        </p>

        <form onSubmit={(e) => handelsubmit(e)} className="space-y-5">

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
              required
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
          {message && (<p className="text-center text-sm text-gray-700"> {message} </p>)}

        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-orange-500 font-semibold hover:underline border-none cursor-pointer"
            onClick={onSwitch}
          >
            Sign Up
          </button>

        </p>

      </div>
    </div>

  );
}


export default Login;
