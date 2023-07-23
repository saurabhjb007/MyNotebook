import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const Login = (props) => {
  const [credentials, setcredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    const json = await response.json();
    console.log(json);
    if (json.success) {
      // Save the authtoken and redirect
      localStorage.setItem("token", json.authtoken);
      props.showAlert(": Logged in successfully", "success");
      navigate("/");
    } else {
      props.showAlert(": Invalid Credentials", "danger");
    }
  };

  const onChange = (event) => {
    setcredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  return (
    <div className="my-4">
    <h2>Login to use MyNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="my-4">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            aria-describedby="emailHelp"
            onChange={onChange}
            value={credentials.email}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            minLength={4}
            name="password"
            autoComplete="on"
            onChange={onChange}
            value={credentials.password}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
