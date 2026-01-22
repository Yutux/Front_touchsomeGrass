import { useState, useEffect, useContext } from "react";
import request from "../../utils/request";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext/UserContext";

export default function PrivateRoute() {
  const { token } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (token) {
      request(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/validate`, 'GET', {}, true)
        .then((response) => {
          if (response.status === 200) {
            setIsValid(response.data === true);
          } else {
            setIsValid(false);
          }
        })
        .catch(() => setIsValid(false))
        .finally(() => setIsLoading(false));
    } else {
      setIsValid(false);
      setIsLoading(false);
    }
  }, [token]); // 🔹 on dépend maintenant du token du contexte

  if (isLoading) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/login" />;

  return <Outlet />;
}
