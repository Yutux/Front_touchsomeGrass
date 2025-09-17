import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export default function UserProvider(props) {
	const [token, setToken] = useState();

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const tokenUser = localStorage.getItem("token");
		if (tokenUser) {
			setToken(tokenUser);
		}else{
			setToken(null);
        }

		setIsLoading(false);
	}, []);

	return (
		<UserContext.Provider value={{token, setToken}}>
			{isLoading ? <h2>Loading...</h2> : props.children}
		</UserContext.Provider>
	);
}