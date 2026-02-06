import React, { useContext } from "react";
import '../../styles/auth.css'
import request from "../../utils/request";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext/UserContext";

export default function LoginForm() {
  const [emailInput, setEmailInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const [loginMessage, setLoginMessage] = React.useState("");
  const navigate = useNavigate();
  const { setToken } = useContext(UserContext);

  function handleSubmit(e) {
    e.preventDefault();

    request(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/authenticate`, 'POST', { 
      email: emailInput, 
      password: passwordInput 
    }, false).then((response) => {
      if (response.status === 200) {
		localStorage.setItem("token", response.data.token);
        setToken(response.data.token); // ✅ met à jour le contexte
		console.log("Token reçu lors du login:", response.data.token);
        navigate('/profile');
        setLoginMessage("Connexion réussie");
      } else {
        setLoginMessage("Email ou mot de passe incorrect");
      }
    });
  }

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <input
          autoComplete="email"
          placeholder="Email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <input
          autoComplete="current-password"
          placeholder="Mot de passe"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>{loginMessage}</p>
      </form>
    </div>
  );
}
