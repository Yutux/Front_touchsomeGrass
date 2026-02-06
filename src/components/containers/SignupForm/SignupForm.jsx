import { useState } from "react";
import { useNavigate } from "react-router-dom";
import request from "../../utils/request";
import '../../styles/auth.css'

export default function SignupForm() {
	const [emailInput, setEmailInput] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [signupMessage, setSignupMessage] = useState("");
	const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
	const [pseudoInput, setPseudoInput] = useState("");
	const [nameInput, setNameInput] = useState("");
	const navigate = useNavigate();

	function signup(e) {
		e.preventDefault();
		if (passwordInput !== confirmPasswordInput) {
			setSignupMessage("Les mots de passe ne correspondent pas");
		} else {
			request(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, 'POST', {
				email: emailInput,
				password: passwordInput,
				firstname: pseudoInput,
				lastname: nameInput
			}, false).then((res) => {
				if (res.status === 200) {
					navigate('/profile');
					setSignupMessage(res.data.message);
				} else {
					setSignupMessage(res.data.message);
				}});
		}
	}
	return (
		<div className="form-container sign-up-container">
			<form>
			<h1>Create Account</h1>
        	<div className="social-container">
          		<a href="/login" className="social">
            		<i className="fab fa-facebook-f black" />
          		</a>
				<a href="/login" className="social">
					<i className="fab fa-google-plus-g" />
				</a>
				<a href="/login" className="social">
					<i className="fab fa-linkedin-in" />
				</a>
				</div>
				<span>or use your email for registration</span>
				<input
					autoComplete="firstname"
					placeholder="firstname"
					value={pseudoInput} onChange={(e) => setPseudoInput(e.target.value)}
				/>
				<input
					autoComplete="lastname"
					placeholder="lastname"
					value={nameInput} onChange={(e) => setNameInput(e.target.value)}
				/>
				<input
					autoComplete="email"
					placeholder="Email"
					value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
				/>
				
				<input
					autoComplete="new-password"
					placeholder="Mot de passe"
					type="password"
					value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
				/>
				<input
					autoComplete="new-password"
					placeholder="Confirmez le mot de passe"
					type="password"
					value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)}
				/>
				<button onClick={signup}>Sign up</button>
				<p>{signupMessage}</p>
			</form>
		</div>
	);
}