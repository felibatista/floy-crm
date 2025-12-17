"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import LoginFooter from "@/components/auth/LoginFooter";
import LoginForm from "@/components/auth/LoginForm";
import LoginHeader from "@/components/auth/LoginHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      document.cookie = `admin_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message === "Invalid credentials"
          ? "Credenciales incorrectas"
          : err.message
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <LoginHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardContent className="space-y-6 p-0">
            <h2 className="text-center text-lg font-semibold">
              Iniciar sesión
            </h2>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </main>

      <LoginFooter />
    </div>
  );
}
