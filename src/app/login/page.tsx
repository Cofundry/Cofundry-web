'use client'
import LoginForm from "@/components/ui/Auth/login";
import { Provider } from "react-redux";
import { store } from "../store/store";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">

        <LoginForm />
      </div>
    </div>
  )
  
}
