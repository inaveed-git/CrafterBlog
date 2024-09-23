import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label, TextInput, Button, Alert, Spinner } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../../redux/user/userSlice";
import OAuth from "../components/OAuth";

function SignIn() {
  let [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  let dispatch = useDispatch();
  let { loading, error: errorMessage } = useSelector((state) => state.user);
  // const {
  //   currentUser,
  //   loading,
  //   error: errorMessage,
  // } = useSelector((state) => state.user);
  // console.log(currentUser);

  let navigate = useNavigate();

  let handleInput = (e) => {
    let { name, value } = e.target;

    setFormData((prevTask) => ({
      ...prevTask,
      [name]: value.trim(),
    }));
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure("Please fill out all fields."));
    }
    try {
      dispatch(signInStart());

      const response = await axios.post("/api/auth/signin", formData);

      if (response.data.success === false) {
        return dispatch(signInFailure(response.data.message));
      }

      dispatch(signInSuccess(response.data)); // Assuming response.data contains the user info
      navigate("/"); // Navigate to home page
    } catch (error) {
      dispatch(signInFailure(error.response?.data?.message || error.message));
    }

    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left */}
        <div className="flex-1 text-center md:text-left">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Crafter
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            Welcome back! Sign in to your account to access the blog.
          </p>
        </div>
        {/* Right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your email" />
              <TextInput
                onChange={handleInput}
                type="email"
                placeholder="name@company.com"
                id="email"
                name="email"
                value={formData.email}
                autoComplete="email"
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                onChange={handleInput}
                type="password"
                placeholder="Password"
                id="password"
                name="password"
                value={formData.password}
                autoComplete="current-password"
              />
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5 justify-center md:justify-start">
            <span>Don't have an account?</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignIn;
