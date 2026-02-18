"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const loginWithGoogle = async () => {
        const redirectUrl =
            process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback";

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUrl,
            },
        });
    };



  const router = useRouter();

    useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
        router.replace("/dashboard");
        }
    };

    checkSession();
    }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
    bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">

      {/* Branding */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Smart<span className="text-indigo-400">Bookmark</span>
        </h1>
        <p className="mt-3 text-lg text-gray-300">
          Save. Organize. Access your favorite links anywhere.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white text-gray-800 shadow-2xl rounded-2xl p-10 w-[380px] text-center">
        <h2 className="text-xl font-semibold mb-6">Welcome 👋</h2>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 border rounded-lg px-4 py-3 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          <span className="font-medium">Login with Google</span>
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Secure authentication powered by Google OAuth
        </p>
      </div>
    </div>
  );
}
