  "use client";
  import React, { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import ThemeToggle from "./ThemeToggle";
  import Link from "next/link";
  import { useAuthStore } from "@/store/useAuth";

  export function AppBar() {
    const router = useRouter();
  const { token, setToken } = useAuthStore();


    useEffect(()=>{
      if(!token){
        router.push("/")
      }
    },[token])

    const handleLogout = () => {
      localStorage.removeItem("token");
      setToken(null)
      router.push("/");
    };

  

    return (
      <div className="sticky top-0 z-50 w-full flex justify-center bg-white dark:bg-gray-950 shadow-md">
        <div className="w-full sm:w-[90%] md:w-[50%] flex justify-between items-center px-6 py-3 rounded-3xl">
          <div className="flex items-center space-x-2">
            <Link href={"/home"}><span className="text-lg font-bold text-primary glow-text animate-pulse">
              Chatx
            </span></Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {!token ? (
            <h1>hello</h1>
            ) : (
            <button
                className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <style jsx>{`
          .glow-text {
            color: #60a5fa; /* Tailwind blue-400 */
            text-shadow: 0 0 8px #3b82f6, 0 0 15px #3b82f6;
          }
        `}</style>
      </div>
    );
  }
