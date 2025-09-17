import React from "react";
import '../../styles/auth.css'
import request from "../../utils/request";
import {useNavigate } from "react-router-dom";

export default function LoginForm(props) {
	const [emailInput, setEmailInput] = React.useState("");
	const [passwordInput, setPasswordInput] = React.useState("");
	const [loginMeassage, setLoginMessage] = React.useState("");
	const navigate = useNavigate();

	function handleSubmit(e) {
		e.preventDefault();
		request(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/authenticate`, 'POST',{ 
			email: emailInput, 
			password: passwordInput 
		}, false).then((response) => {
			if (response.status === 200) {
				localStorage.setItem("token", response.data.token);
				navigate('/profile');
				setLoginMessage("Connexion réussie");
			} else {
				setLoginMessage("email ou Mot de passe in correct");
			}
		});
	}
	return (
		<div className="form-container sign-in-container">
			<form>
			<h1>Sign in</h1>
        	<div className="social-container">
          		<a href="#" className="social">
            		<i className="fab fa-facebook-f" />
          		</a>
          		<a href="#" className="social">
            		<i className="fab fa-google-plus-g" />
          		</a>
          		<a href="#" className="social">
            		<i className="fab fa-linkedin-in" />
          		</a>
        	</div>
        	<span>or use your account</span>
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
				<button onClick={handleSubmit}>Login</button>
				<p>{loginMeassage}</p>
			</form>
		</div>
	);
}