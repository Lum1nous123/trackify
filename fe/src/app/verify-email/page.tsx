import React, { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-zinc-50 p-6'>
          Loading verification form...
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
