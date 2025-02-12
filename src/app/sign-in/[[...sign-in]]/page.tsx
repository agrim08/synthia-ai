import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      {/* Branding Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-white">
          <span className="text-indigo-500">Synthia</span>
        </h1>
        <p className="text-lg text-gray-400">
          Bringing Intelligence to Your Workflow
        </p>
      </div>

      {/* Customized SignIn Component */}
      <div className="h-full w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-8">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#6366f1", // Indigo-500
              colorText: "#ffffff", // White
              colorTextSecondary: "#9ca3af", // Gray-400
              colorBackground: "#111827", // Gray-900
              colorInputBackground: "#1f2937", // Gray-800
              colorInputText: "#f3f4f6", // Gray-100
            },
            elements: {
              rootBox: "w-full",
              card: "w-full bg-transparent shadow-none",
              headerTitle: "text-2xl font-bold text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-800 text-white border-gray-700 hover:bg-gray-700",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold",
              footerActionText: "text-gray-400",
              footerActionLink: "text-indigo-500 hover:text-indigo-400",
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Secure access to your intelligent workflow partner
      </p>
    </div>
  );
}
