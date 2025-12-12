'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          BeautyBook
        </h1>
      </Link>

      {/* Sign Up Component */}
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border-0 rounded-2xl",
            headerTitle: "text-2xl font-bold text-gray-800",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50 transition-colors",
            formButtonPrimary: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all",
            footerActionLink: "text-purple-600 hover:text-purple-700",
            formFieldInput: "border-gray-200 focus:border-purple-500 focus:ring-purple-500",
          },
        }}
        redirectUrl="/"
        signInUrl="/sign-in"
      />

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500">
        已有账户？{' '}
        <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium">
          立即登录
        </Link>
      </p>
    </div>
  );
}
