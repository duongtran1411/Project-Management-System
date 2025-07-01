// app/providers.tsx
'use client';

import { AuthProvider } from "@/lib/auth/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <Toaster position="bottom-right" />
          {children}
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
