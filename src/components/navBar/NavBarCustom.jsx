import React, { useContext, useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext/UserContext";
import request from "../utils/request";

export default function NavBarCustom() {
    const { token, setToken } = useContext(UserContext);
    const [isValid, setIsValid] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setIsValid(false);
                return;
            }

            const { status } = await request("http://localhost:8088/AUTH-SERVICE/api/auth/user", "GET", {}, true);

            if (status === 200) {
                setIsValid(true);
            } else {
                localStorage.removeItem("token");
                setToken(null);
                setIsValid(false);
                navigate("/login");
            }
        };

        checkToken();
    }, [token, setToken, navigate]);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                        Mon App
                    </Link>
                </Typography>

                {isValid ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Link to="/profile">
                            <Avatar sx={{ bgcolor: "secondary.main", marginRight: 2 }}>U</Avatar>
                        </Link>
                        <Button color="inherit" onClick={() => {
                            localStorage.removeItem("token");
                            setToken(null);
                            navigate("/login");
                        }}>
                            Déconnexion
                        </Button>
                    </Box>
                ) : (
                    <Button color="inherit" component={Link} to="/login">
                        Connexion
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}
