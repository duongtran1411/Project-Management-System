import { lazy } from "react";

// Lazy load heavy components
export const LazyOTPInput = lazy(() => import("./OTPInput"));

export const LazyImage = lazy(() =>
  import("next/image").then((module) => ({ default: module.default }))
);

// Lazy load pages
export const LazyVerifyOTP = lazy(
  () => import("@/app/authentication/verify-otp/page")
);

export const LazySetupAccount = lazy(
  () => import("@/app/authentication/setup-account/page")
);
