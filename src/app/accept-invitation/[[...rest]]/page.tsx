'use client';

import { useSearchParams } from 'next/navigation';
import { SignIn  } from '@clerk/nextjs';
import React from 'react';

export default function AcceptInvitePage() {
  const sp = useSearchParams();
  const ticket = sp.get("__clerk_ticket");
  const status = sp.get("__clerk_status");
  const redirectUrl = sp.get("redirect_url") || "/dashboard";

  if (!ticket || !status) {
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard");
    }
    return null;
  }

  return (
    <SignIn
      path="/accept-invitation"
      routing="path"
      signInUrl={`/accept-invitation?__clerk_ticket=${ticket}&__clerk_status=${status}&redirect_url=${encodeURIComponent(redirectUrl)}`}
      redirectUrl={redirectUrl}
      afterSignInUrl={redirectUrl}
      afterSignUpUrl={redirectUrl}
    />
  );
}
