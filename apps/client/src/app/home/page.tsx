"use client"
import { CreateRoom } from "@/components/CreateRoom";
import { useAuthStore } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Page(){
    const router=useRouter()
    const {token}=useAuthStore()
    useEffect(()=>{
        if(!token){
            router.push("/")
        }
    },[])
    return (
        <div>
            <CreateRoom/>
        </div>
    )
}