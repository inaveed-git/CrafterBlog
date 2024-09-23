import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label, TextInput, Button, Alert, Spinner } from "flowbite-react";
import axios from "axios";
import OAuth from "../components/OAuth";

function SignUp() {
  let [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  let [loading, setLoading] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

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
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage("Please fill out all fields.");
    }
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.post("/api/auth/signup", formData);

      if (response.data.success === false) {
        return setErrorMessage(response.data.message);
      }

      setLoading(false);

      navigate("/sign-in");
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }

    setFormData({
      username: "",
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
            This is a demo project. You can sign up with your email and password
            or with Google.
          </p>
        </div>
        {/* Right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your username" />
              <TextInput
                onChange={handleInput}
                type="text"
                placeholder="Username"
                id="username"
                name="username"
                value={formData.username}
                autoComplete="username"
              />
            </div>
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
                "Sign Up"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5 justify-center md:justify-start">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign In
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

export default SignUp;
