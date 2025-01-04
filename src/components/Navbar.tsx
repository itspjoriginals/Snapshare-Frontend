"use client";
import React, { useEffect, useCallback, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Close the menu when navigating to a new route
  const handleNavigation = (route: string) => {
    router.push(route);
    setIsMenuOpen(false); // Close the menu
  };

  const handleLogout = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok) {
      dispatch(logOut());
      router.push("/login");
      setIsMenuOpen(false); // Close the menu
    }
  };

  return (
    <div className={styles.navbar}>
      <h1
        onClick={() => handleNavigation("/")}
        className={styles.logo}
      >
        SnapShare
      </h1>

      <div
        className={styles.toggle}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </div>

      <div className={`${styles.right} ${isMenuOpen ? styles.open : ""}`}>
        {auth.isAuth ? (
          <>
            <p
              onClick={() => handleNavigation("/myfiles")}
              className={pathname === "/myfiles" ? styles.active : ""}
            >
              My Files
            </p>
            <p
              onClick={() => handleNavigation("/share")}
              className={pathname === "/share" ? styles.active : ""}
            >
              Share
            </p>
            <p onClick={handleLogout}>Logout</p>
          </>
        ) : (
          <>
            <p
              onClick={() => handleNavigation("/login")}
              className={pathname === "/login" ? styles.active : ""}
            >
              Login
            </p>
            <p
              onClick={() => handleNavigation("/signup")}
              className={pathname === "/signup" ? styles.active : ""}
            >
              Signup
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
