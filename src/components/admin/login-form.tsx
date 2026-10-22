'use client'

import React, { useActionState, useState } from 'react'
import { loginAction, LoginActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<LoginActionState | undefined, FormData>(
    loginAction,
    undefined
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 shadow-xs">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-2">
            Management Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-main tracking-tight">
            Shewa Fashion<span className="text-accent-gold">.</span>
          </h1>
          <p className="text-xs text-secondary mt-2">
            Sign in to access the administrator dashboard
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div
            id="login-error-alert"
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
          >
            <svg
              className="w-5 h-5 shrink-0 mt-0.5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span className="leading-snug">{state.error}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} noValidate className="space-y-5">
          {redirectTo && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold uppercase tracking-wider text-main mb-2"
            >
              Email Address
            </label>
            <div className="relative">
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
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-main mb-2"
            >
              Password
            </label>
            <div className="relative">
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
                className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-border bg-background text-main text-sm transition-colors placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center text-secondary hover:text-main rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In to Admin'
              )}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[11px] text-secondary tracking-wide">
            Restricted access. Only authorized administrators may log in. All access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  )
}
