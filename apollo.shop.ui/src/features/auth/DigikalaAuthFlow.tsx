"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ApolloShopLogo } from "@/features/auth/ApolloShopLogo";
import { OtpInput } from "@/features/auth/OtpInput";
import {
  formatIdentifierInput,
  formatOtpDisplay,
  formatPhoneDisplay,
  formatTimer,
  isCompleteIranianMobileInput,
  normalizeOtpInput,
  normalizePhoneInput,
} from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import type { AuthResponse, SendOtpResponse, UserInfo } from "@/types/api";

type Step = "phone" | "otp" | "password";

const DEFAULT_OTP_TTL = 120;
const FIELD_H = 48;

function resolvePostLoginPath(user: UserInfo, next: string | null) {
  const isAdmin = user.roles?.includes("Admin");
  if (isAdmin) {
    return next || "/admin";
  }
  if (next && !next.startsWith("/admin")) {
    return next;
  }
  return "/account";
}

export function DigikalaAuthFlow() {
  const router = useRouter();
  const search = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<Step>("phone");
  const [identifierDisplay, setIdentifierDisplay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [authMode, setAuthMode] = useState<"phone" | "username">("phone");
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendSeconds]);

  async function completeLogin(data: AuthResponse) {
    setSession(data);
    toast.success("ورود موفق");
    router.replace(resolvePostLoginPath(data.user, search.get("next")));
  }

  async function sendOtp(normalizedPhone: string) {
    const { data } = await api.post<SendOtpResponse>("/api/auth/otp/send", {
      phoneNumber: normalizedPhone,
    });
    setDevCode(data.devCode ?? null);
    setResendSeconds(data.expiresInSeconds > 0 ? data.expiresInSeconds : DEFAULT_OTP_TTL);
    if (data.devCode) {
      setCode(formatOtpDisplay(data.devCode));
    } else {
      setCode("");
    }
  }

  async function handleIdentifierSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = identifierDisplay.trim();
    if (!raw) {
      toast.error("شماره موبایل یا نام کاربری را وارد کنید");
      return;
    }

    if (isCompleteIranianMobileInput(raw)) {
      const normalized = normalizePhoneInput(raw);
      setLoading(true);
      try {
        setAuthMode("phone");
        setPhoneNumber(normalized);
        setUsername("");
        await sendOtp(normalized);
        setStep("otp");
      } catch (err) {
        toast.error(getApiErrorMessage(err, "ارسال کد ناموفق بود"));
      } finally {
        setLoading(false);
      }
      return;
    }

    setAuthMode("username");
    setUsername(raw);
    setPhoneNumber("");
    setPassword("");
    setStep("password");
  }

  async function handleResend() {
    if (resendSeconds > 0 || loading || authMode !== "phone") return;
    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      toast.success("کد جدید ارسال شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "ارسال مجدد ناموفق بود"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(otpCode: string) {
    const normalizedCode = normalizeOtpInput(otpCode);
    if (normalizedCode.length !== 5) {
      toast.error("کد تأیید باید ۵ رقم باشد");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/otp/verify", {
        phoneNumber,
        code: normalizedCode,
      });
      await completeLogin(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "کد تأیید نامعتبر است"));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    await verifyOtp(code);
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error("رمز عبور را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      if (authMode === "phone") {
        const { data } = await api.post<AuthResponse>("/api/auth/phone-login", {
          phoneNumber,
          password,
        });
        await completeLogin(data);
      } else {
        const { data } = await api.post<AuthResponse>("/api/auth/login", {
          email: username,
          password,
        });
        await completeLogin(data);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "ورود با رمز عبور ناموفق بود"));
    } finally {
      setLoading(false);
    }
  }

  function goBackStep() {
    if (step === "otp" || step === "password") {
      setStep("phone");
      setCode("");
      setPassword("");
      setDevCode(null);
      setResendSeconds(0);
    }
  }

  const identifierFloating = identifierFocused || identifierDisplay.length > 0;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
      <div className="absolute start-4 top-4 z-20 sm:start-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] rounded-xl border border-border bg-card px-6 py-8 text-card-foreground sm:px-8">
        <div className="relative mb-8 flex min-h-10 items-center justify-center">
          {step === "phone" ? (
            <Link
              href="/"
              className="absolute start-0 top-1/2 -translate-y-1/2 text-foreground opacity-80 hover:opacity-100"
              aria-label="بازگشت به صفحه اصلی"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBackStep}
              className="absolute start-0 top-1/2 -translate-y-1/2 text-foreground opacity-80 hover:opacity-100"
              aria-label="بازگشت"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          )}
          <ApolloShopLogo />
        </div>

        {step === "phone" && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-6">
            <div className="space-y-3 text-right">
              <div className="space-y-2">
                <h1 className="text-[18px] font-bold leading-8 text-foreground">
                  ورود یا ثبت نام
                </h1>
                <p className="text-[12px] leading-6 text-muted-foreground">
                  لطفا شماره موبایل یا نام کاربری خود را وارد کنید
                </p>
              </div>

              <div className="pt-1.5">
                <div className="relative" style={{ height: FIELD_H }}>
                  <input
                    id="auth-identifier"
                    dir="ltr"
                    inputMode="text"
                    autoComplete="username"
                    value={identifierDisplay}
                    onChange={(e) => setIdentifierDisplay(formatIdentifierInput(e.target.value))}
                    onFocus={() => setIdentifierFocused(true)}
                    onBlur={() => setIdentifierFocused(false)}
                    className="absolute inset-0 w-full rounded-lg bg-card px-3 text-start text-[15px] text-foreground outline-none"
                    style={{
                      height: FIELD_H,
                      minHeight: FIELD_H,
                      maxHeight: FIELD_H,
                      boxSizing: "border-box",
                      lineHeight: `${FIELD_H - 2}px`,
                      paddingTop: 0,
                      paddingBottom: 0,
                      border: `1px solid ${
                        identifierFocused || identifierFloating
                          ? "var(--foreground)"
                          : "var(--border)"
                      }`,
                    }}
                  />
                  <label
                    htmlFor="auth-identifier"
                    className={cn(
                      "pointer-events-none absolute start-3 z-10 bg-card px-1 leading-none transition-[font-size,top,color] duration-150",
                      identifierFloating
                        ? "top-0 -translate-y-1/2 text-[11px] text-foreground"
                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                    )}
                  >
                    شماره موبایل یا نام کاربری
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              style={{ height: FIELD_H, minHeight: FIELD_H, maxHeight: FIELD_H, boxSizing: "border-box" }}
            >
              {loading ? "لطفا صبر کنید..." : "ورود به فروشگاه آپولو"}
            </button>

            <p className="text-center text-[11px] leading-6 text-muted-foreground">
              ورود شما به معنای پذیرش{" "}
              <a href="#" className="text-primary hover:opacity-80" onClick={(e) => e.preventDefault()}>
                شرایط فروشگاه آپولو
              </a>{" "}
              و{" "}
              <a href="#" className="text-primary hover:opacity-80" onClick={(e) => e.preventDefault()}>
                قوانین حریم‌خصوصی
              </a>{" "}
              است
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <h1 className="text-[18px] font-bold leading-8 text-foreground">کد تایید را وارد کنید</h1>
              <p className="text-[12px] leading-6 text-muted-foreground">
                کد تایید برای شماره{" "}
                <span dir="ltr" className="inline-block font-medium text-foreground">
                  {formatPhoneDisplay(phoneNumber)}
                </span>{" "}
                پیامک شد
              </p>
            </div>

            <OtpInput
              value={code}
              autoFocus
              disabled={loading}
              onChange={setCode}
              onComplete={(otp) => {
                void verifyOtp(otp);
              }}
            />

            {devCode && <p className="text-center text-xs text-muted-foreground">کد توسعه: {devCode}</p>}

            <div className="flex flex-col items-start gap-3">
              <button
                type="button"
                className="text-sm text-primary hover:opacity-80"
                onClick={() => {
                  setStep("password");
                  setPassword("");
                }}
              >
                ورود با رمز عبور &gt;
              </button>

              {resendSeconds > 0 ? (
                <p className="w-full text-center text-sm text-muted-foreground">
                  {formatTimer(resendSeconds)} مانده تا دریافت مجدد کد
                </p>
              ) : (
                <button
                  type="button"
                  className="text-sm text-primary hover:opacity-80"
                  disabled={loading}
                  onClick={() => void handleResend()}
                >
                  دریافت مجدد کد
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 5}
              className="flex w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              style={{ height: FIELD_H, minHeight: FIELD_H, maxHeight: FIELD_H }}
            >
              {loading ? "در حال تایید..." : "تایید"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <h1 className="text-[18px] font-bold leading-8 text-foreground">رمز عبور را وارد کنید</h1>
              <p className="text-[12px] leading-6 text-muted-foreground" dir="ltr">
                {authMode === "phone" ? formatPhoneDisplay(phoneNumber) : username}
              </p>
            </div>

            <div className="relative" style={{ height: FIELD_H }}>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-full w-full rounded-lg border border-border bg-card px-3 pe-11 text-sm text-foreground outline-none focus:border-foreground"
                style={{ height: FIELD_H, boxSizing: "border-box" }}
              />
              <button
                type="button"
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-col items-start gap-3">
              {authMode === "phone" && (
                <button
                  type="button"
                  className="text-sm text-primary hover:opacity-80"
                  onClick={() => {
                    setStep("otp");
                    setPassword("");
                  }}
                >
                  ورود با رمز یک‌بارمصرف &gt;
                </button>
              )}
              <button
                type="button"
                className="text-sm text-primary hover:opacity-80"
                onClick={() => toast.message("به‌زودی")}
              >
                فراموشی رمز عبور &gt;
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="flex w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              style={{ height: FIELD_H, minHeight: FIELD_H, maxHeight: FIELD_H }}
            >
              {loading ? "در حال تایید..." : "تایید"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
