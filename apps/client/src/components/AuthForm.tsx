"use client";
import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BACKENDURL } from "@/lib/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Importing Lucide icons
import { useAuthStore } from "@/store/useAuth";

export function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { setToken } = useAuthStore(); 
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility


    useEffect(()=>{
      const token=localStorage.getItem("token")
      if(token){
        router.push("/home")
      }
    },[])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); 
    try {
      if (isSignUp) {
        const res = await axios.post(`${BACKENDURL}/auth/signup`, {
          name: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (res.status === 201) {
          toast.success("Signup successful");

          const loginRes = await axios.post(`${BACKENDURL}/auth/signin`, {
            email: formData.email,
            password: formData.password,
          });

          if (loginRes.status === 200) {
            
           
             const token = loginRes.data.token
            setToken(token);
            router.push("/home"); 
            toast.success("signin successfull");
          }
          
        }
      } else {
        // Sign In
        const res = await axios.post(`${BACKENDURL}/auth/signin`, {
          email: formData.email,
          password: formData.password,
        });

        if (res.status === 200) {
         
          const token = res.data.token

          console.log(token)
          setToken(token);

          toast.success("Signed in");

          router.push("/home");
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center pt-24 px-4 bg-white dark:bg-black">
      <div className="shadow-input w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          {isSignUp
            ? "Create an account to get started"
            : "Sign in to your account"}
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          {isSignUp && (
            <LabelInputContainer className="mb-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your Username"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
            </LabelInputContainer>
          )}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="your@email.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"} // Toggle password visibility
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white"
            type="submit"
            disabled={isSubmitting} // Disable button while submitting
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" size={20} /> // Loading spinner
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex justify-center space-x-4">
            <button
              className="group/btn flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900"
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
