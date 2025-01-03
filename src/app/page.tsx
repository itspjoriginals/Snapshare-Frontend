"use client"
import styles from "./page.module.css";
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";

export default function Home() {
  const auth = useAppSelector((state) => state.authReducer)
  const router = useRouter()

  return (
    <div className={styles.home}>
      {
        !auth.isAuth ? (
          <div className={styles.center}>
            <h1>Welcome to the app</h1>
            <button
              onClick={() => {
                router.push('/login')
              }}
            >Login</button>
          </div>
        ) : (


          <div className={styles.center}>
            <h1>Welcome {auth.user?.name}</h1>
            <button onClick={() => {
              router.push('/myfiles')
            }}>My Files</button>
          </div>
        )
      }
    </div>
  );
}