import { SignIn } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 px-4 py-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          <span className="bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
            Synthia
          </span>
        </h1>
        <p className="text-lg font-medium text-gray-400">
          Bringing Intelligence to Your Workflow
        </p>
      </div>

      <div className="flex w-full max-w-md transform flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl backdrop-blur-lg transition duration-300 hover:border-gray-700">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#6366f1",
              colorText: "#ffffff",
              colorTextSecondary: "#9ca3af",
              colorBackground: "#111827",
              colorInputBackground: "#1f2937",
              colorInputText: "#f3f4f6",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full",
              card: "w-full bg-transparent shadow-none",
              headerTitle: "text-2xl font-bold text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all duration-200",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-400",
              formFieldLabel: "text-gray-300 font-medium",
              formFieldInput:
                "bg-gray-800 border-gray-700 focus:border-indigo-500 transition-all duration-200",
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200",
              footer: {
                display: "none",
              },
              footerActionText: {
                display: "none",
              },
              footerActionLink: {
                display: "none",
              },
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
        <Link href="/sign-up" className="mt-1 flex items-center justify-center">
          <span className="font-medium text-blue-600 transition-colors hover:underline">
            Don't have an account? Sign Up
          </span>
          <ArrowRight size={16} className="ml-1 text-blue-600" />
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-gray-500">
          Secure access to your intelligent workflow partner
        </p>
      </div>
    </div>
  );
}
