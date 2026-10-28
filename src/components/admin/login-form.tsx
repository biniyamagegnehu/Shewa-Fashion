'use client'

import React, { useActionState, useState } from 'react'
import { loginAction, LoginActionState } from '@/app/actions/auth'

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<LoginActionState | undefined, FormData>(
    loginAction,
    undefined
  )
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  return (
    <div className="w-full">
      {/* Modern Card */}
      <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border/80 p-6 sm:p-10 shadow-xl shadow-black/[0.03]">
        {/* Brand Header */}
        <div className="text-center mb-7 sm:mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#4a89c4] flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary/25">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-[28px] font-bold text-main tracking-tight">
            Shewa Fashion<span className="text-accent-gold">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed">
            Admin Portal & Catalogue Management
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div
            id="login-error-alert"
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <svg
              className="w-5 h-5 shrink-0 mt-0.5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-red-900">Sign in failed</p>
              <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{state.error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form action={formAction} noValidate className="space-y-4 sm:space-y-5">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-main mb-1.5 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                disabled={isPending}
                aria-invalid={Boolean(state?.error)}
                aria-describedby={state?.error ? 'login-error-alert' : undefined}
                placeholder="admin@shewafashion.com"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-main text-sm transition-all placeholder:text-secondary/50 hover:border-border/80 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-main mb-1.5 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isPending}
                aria-invalid={Boolean(state?.error)}
                aria-describedby={state?.error ? 'login-error-alert' : undefined}
                placeholder="••••••••••••"
                className="w-full h-12 pl-10 pr-12 rounded-xl border border-border bg-background text-main text-sm transition-all placeholder:text-secondary/50 hover:border-border/80 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-secondary/70 hover:text-main rounded-lg hover:bg-black/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Assistance */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-secondary hover:text-main">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <span className="text-[11px] text-secondary/70">
              Session lasts 7 days
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center gap-2 text-white">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating…</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <svg className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Security / Help Notice */}
        <div className="mt-8 pt-5 border-t border-border/70 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border/70 text-[11px] text-secondary">
            <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Authorized access only • Activity is logged</span>
          </div>
        </div>
      </div>
    </div>
  )
}
