"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logIn, logOut } from "@/redux/features/auth-slice";
import Snaploader from "./Snaploader";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/checkLogin`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data.ok) {
                    dispatch(logIn(data.user));
                } else {
                    dispatch(logOut());
                }
            } catch (err) {
                console.log(err);
                dispatch(logOut());
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "100px" }}>
            <Snaploader />
        </div>;
    }

    return <>{children}</>;
}