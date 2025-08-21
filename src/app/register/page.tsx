import LoginForm from "@/components/ui/Auth/login";
import RegisterForm from "@/components/ui/Auth/register";

export default function RegisterPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
}
