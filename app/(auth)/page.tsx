"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: status } = useSession() as any;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-alita-black">
        <div className="w-10 h-10 border-4 border-alita-orange/10 border-l-alita-orange rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-alita-black relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-right-[20%] before:w-[700px] before:h-[700px] before:bg-[radial-gradient(circle,rgba(255,122,0,0.12)_0%,transparent_70%)] before:rounded-full before:pointer-events-none after:content-[''] after:absolute after:-bottom-[30%] after:left-[-10%] after:w-[500px] after:h-[500px] after:bg-[radial-gradient(circle,rgba(255,122,0,0.06)_0%,transparent_70%)] after:rounded-full after:pointer-events-none">
      <div className="bg-alita-white p-10 md:p-11 rounded-xl w-full max-w-[420px] shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
        <div className="flex justify-center mb-6">
          <Image 
            src="/images/logo.png" 
            alt="Alita Logo" 
            width={64} 
            height={64} 
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-alita-black text-center tracking-tight mb-1">Welcome Back</h1>
        <p className="text-alita-gray-500 text-center mb-8 text-sm">Sign in to Alita Partner Onboarding</p>

        {error && (
          <div className="bg-red-500/10 text-red-600 p-3 rounded-md mb-5 text-[0.825rem] text-center border border-red-600/15 font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-[0.8rem] font-semibold mb-1.5 text-alita-gray-600 tracking-wide">Email Address</label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 border border-alita-gray-200 rounded-md text-sm transition-all duration-150 bg-alita-gray-50 text-alita-black hover:border-alita-gray-300 focus:outline-none focus:border-alita-orange focus:bg-alita-white focus:ring-4 focus:ring-alita-orange-glow placeholder-alita-gray-400"
              placeholder="you@alita.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-5">
            <label className="block text-[0.8rem] font-semibold mb-1.5 text-alita-gray-600 tracking-wide">Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-alita-gray-200 rounded-md text-sm transition-all duration-150 bg-alita-gray-50 text-alita-black hover:border-alita-gray-300 focus:outline-none focus:border-alita-orange focus:bg-alita-white focus:ring-4 focus:ring-alita-orange-glow placeholder-alita-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="text-right -mt-2 mb-6">
            <Link href="/forgot-password" className="text-alita-orange hover:text-alita-orange-dark text-[0.85rem] font-medium transition-colors">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-alita-orange to-alita-orange-dark text-alita-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-150 shadow-[0_2px_4px_rgba(255,122,0,0.2)] hover:shadow-orange hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 text-[0.75rem] text-alita-gray-400">
          PT. Alita Praya Mitra &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
