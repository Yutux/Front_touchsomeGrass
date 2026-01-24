import { createContext, useState, useEffect } from "react";
export const UserContext = createContext();
export default function UserProvider({ children }) {
  // ✅ Initialise directement avec localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoading] = useState(false);
  // 🔄 Synchronise quand le token change
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);
  return (
    <UserContext.Provider value={{ token, setToken }}>
      {isLoading ? <h2>Loading...</h2> : children}
    </UserContext.Provider>
  );
}