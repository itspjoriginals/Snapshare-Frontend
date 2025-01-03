"use client";
import React, { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "@/styles/navbar.module.css";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { logIn, logOut } from "@/redux/features/auth-slice";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAppSelector((state) => state.authReducer);
  const router = useRouter();
  const pathname = usePathname();

  const getUserData = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/getuser`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok) {
      dispatch(logIn(data.data));
      router.push("/myfiles");
    } else {
      dispatch(logOut());
    }
  }, [dispatch, router]);

  const checkLogin = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/checklogin`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!data.ok) {
      dispatch(logOut());
    } else {
      getUserData();
    }
  }, [dispatch, getUserData]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const handleLogout = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok) {
      dispatch(logOut());
      router.push("/login");
    }
  };

  return (
    <div className={styles.navbar}>
      <h1
        onClick={() => router.push("/")}
        className={styles.logo}
      >
        SnapShare
      </h1>

      {auth.isAuth ? (
        <div className={styles.right}>
          <p
            onClick={() => router.push("/myfiles")}
            className={pathname === "/myfiles" ? styles.active : ""}
          >
            My Files
          </p>
          <p
            onClick={() => router.push("/share")}
            className={pathname === "/share" ? styles.active : ""}
          >
            Share
          </p>
          <p onClick={handleLogout}>Logout</p>
        </div>
      ) : (
        <div className={styles.right}>
          <p
            onClick={() => router.push("/login")}
            className={pathname === "/login" ? styles.active : ""}
          >
            Login
          </p>
          <p
            onClick={() => router.push("/signup")}
            className={pathname === "/signup" ? styles.active : ""}
          >
            Signup
          </p>
        </div>
      )}
    </div>
  );
};

export default Navbar;
