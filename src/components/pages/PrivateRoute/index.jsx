import { useState } from "react";
import request from "../../utils/request";
import { Navigate, Outlet } from "react-router-dom";


export default function PrivateRoute(props){
    
    const jwt = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    if(jwt){
        request(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/validate`, 'GET')
        .then((response) => {
			if (response.status === 200) {
                setIsValid(response.data);
                setIsLoading(false);
            }else{
                return <Navigate to={"/login"}/>;
            }
        })
    }else{
        return <Navigate to={"/login"}/>;
    }
    return isLoading ? <div>Loading...</div> : isValid === true ? <Outlet/> : <Navigate to={"/login"}/>
}