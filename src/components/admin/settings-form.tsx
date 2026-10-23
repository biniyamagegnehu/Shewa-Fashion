'use client'

import React, { useState, useRef, useTransition, useEffect } from 'react'
import Image from 'next/image'
import type { AuthenticatedAdmin } from '@/lib/auth'
import {
  updateStoreInfoAction,
  updateContactInfoAction,
  updateSocialLinksAction,
  changeAdminPasswordAction,
  type SettingsActionState,
  type PasswordActionState,
} from '@/app/actions/settings'

export interface InitialStoreSettings {
  storeName: string
  description?: string | null
  logoUrl?: string | null
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  address?: string | null
  openingHours?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  telegram?: string | null
  googleMapsUrl?: string | null
}

interface SettingsFormProps {
  initialSettings?: InitialStoreSettings | null
  admin?: AuthenticatedAdmin | null
}

type SettingsSection = 'store' | 'contact' | 'social' | 'security' | 'all'

export function SettingsForm({ initialSettings, admin }: SettingsFormProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<SettingsSection>('store')

  // ============================================================
  // Section A: Store Information State
  // ============================================================
  const [storeName, setStoreName] = useState(initialSettings?.storeName || 'Shewa Fashion')
  const [description, setDescription] = useState(initialSettings?.description || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>(initialSettings?.logoUrl || '')
  const [removeLogo, setRemoveLogo] = useState(false)
  const [clientLogoError, setClientLogoError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const currentObjectUrlRef = useRef<string | null>(null)

  const [isStorePending, startStoreTransition] = useTransition()
  const [storeState, setStoreState] = useState<SettingsActionState>({})
  const [storeSuccess, setStoreSuccess] = useState(false)

  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current)
      }
    }
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setClientLogoError('Logo image file exceeds the 5 MB limit.')
        if (logoInputRef.current) logoInputRef.current.value = ''
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        setClientLogoError('Unsupported logo format. Please select PNG, JPEG, WebP, AVIF, or SVG.')
        if (logoInputRef.current) logoInputRef.current.value = ''
        return
      }

      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current)
      }

      const objUrl = URL.createObjectURL(file)
      currentObjectUrlRef.current = objUrl
      setLogoFile(file)
      setRemoveLogo(false)
      setLogoPreview(objUrl)
      setClientLogoError(null)
    }
  }

  function handleRemoveLogo() {
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current)
      currentObjectUrlRef.current = null
    }
    setLogoFile(null)
    setLogoPreview('')
    setRemoveLogo(true)
    setClientLogoError(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  function handleStoreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStoreState({})
    setStoreSuccess(false)

    const formData = new FormData()
    formData.set('storeName', storeName)
    formData.set('description', description)

    if (removeLogo) {
      formData.set('removeLogo', 'true')
    } else if (logoFile) {
      formData.set('logo', logoFile)
    } else if (initialSettings?.logoUrl) {
      formData.set('logoUrl', initialSettings.logoUrl)
    }

    startStoreTransition(async () => {
      const res = await updateStoreInfoAction(undefined, formData)
      if (res.success) {
        setStoreSuccess(true)
        setStoreState({})
      } else {
        setStoreState(res)
        setStoreSuccess(false)
      }
    })
  }

  // ============================================================
  // Section B: Contact Information State
  // ============================================================
  const [phone, setPhone] = useState(initialSettings?.phone || '')
  const [email, setEmail] = useState(initialSettings?.email || '')
  const [whatsapp, setWhatsapp] = useState(initialSettings?.whatsapp || '')
  const [address, setAddress] = useState(initialSettings?.address || '')
  const [openingHours, setOpeningHours] = useState(initialSettings?.openingHours || '')
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialSettings?.googleMapsUrl || '')

  const [isContactPending, startContactTransition] = useTransition()
  const [contactState, setContactState] = useState<SettingsActionState>({})
  const [contactSuccess, setContactSuccess] = useState(false)

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactState({})
    setContactSuccess(false)

    const formData = new FormData()
    formData.set('phone', phone)
    formData.set('email', email)
    formData.set('whatsapp', whatsapp)
    formData.set('address', address)
    formData.set('openingHours', openingHours)
    formData.set('googleMapsUrl', googleMapsUrl)

    startContactTransition(async () => {
      const res = await updateContactInfoAction(undefined, formData)
      if (res.success) {
        setContactSuccess(true)
        setContactState({})
      } else {
        setContactState(res)
        setContactSuccess(false)
      }
    })
  }

  // ============================================================
  // Section C: Social Links State
  // ============================================================
  const [instagram, setInstagram] = useState(initialSettings?.instagram || '')
  const [facebook, setFacebook] = useState(initialSettings?.facebook || '')
  const [tiktok, setTiktok] = useState(initialSettings?.tiktok || '')
  const [telegram, setTelegram] = useState(initialSettings?.telegram || '')

  const [isSocialPending, startSocialTransition] = useTransition()
  const [socialState, setSocialState] = useState<SettingsActionState>({})
  const [socialSuccess, setSocialSuccess] = useState(false)

  function handleSocialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSocialState({})
    setSocialSuccess(false)

    const formData = new FormData()
    formData.set('instagram', instagram)
    formData.set('facebook', facebook)
    formData.set('tiktok', tiktok)
    formData.set('telegram', telegram)

    startSocialTransition(async () => {
      const res = await updateSocialLinksAction(undefined, formData)
      if (res.success) {
        setSocialSuccess(true)
        setSocialState({})
      } else {
        setSocialState(res)
        setSocialSuccess(false)
      }
    })
  }

  // ============================================================
  // Section D: Account Security (Change Password) State
  // ============================================================
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isPasswordPending, startPasswordTransition] = useTransition()
  const [passwordState, setPasswordState] = useState<PasswordActionState>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordState({})
    setPasswordSuccess(false)

    const formData = new FormData()
    formData.set('currentPassword', currentPassword)
    formData.set('newPassword', newPassword)
    formData.set('confirmPassword', confirmPassword)

    startPasswordTransition(async () => {
      const res = await changeAdminPasswordAction(undefined, formData)
      if (res.success) {
        setPasswordSuccess(true)
        setPasswordState({})
        // Clear all 3 password fields upon success for security
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
      } else {
        setPasswordState(res)
        setPasswordSuccess(false)
      }
    })
  }

  // Field error helpers
  function getStoreError(field: string): string | undefined {
    return storeState.errors?.find((e) => e.field === field)?.message
  }

  function getContactError(field: string): string | undefined {
    return contactState.errors?.find((e) => e.field === field)?.message
  }

  function getSocialError(field: string): string | undefined {
    return socialState.errors?.find((e) => e.field === field)?.message
  }

  function getPasswordError(field: string): string | undefined {
    return passwordState.errors?.find((e) => e.field === field)?.message
  }

  const isVisible = (sec: SettingsSection) => activeTab === 'all' || activeTab === sec

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ============================================================
          SECTION NAVIGATION TABS (Mobile-first responsive)
         ============================================================ */}
      <nav
        aria-label="Settings sections"
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[#F0EFEB] border border-border overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'store'
              ? 'bg-primary text-white shadow-xs'
              : 'text-secondary hover:text-main hover:bg-white/50'
          }`}
          aria-selected={activeTab === 'store'}
          role="tab"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.614A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.98-1.98a4.5 4.5 0 0 1 6.364 0l.427.427a.75.75 0 0 0 1.06 0l.427-.427a4.5 4.5 0 0 1 6.364 0l1.98 1.98a3.004 3.004 0 0 1-.621 4.72" />
          </svg>
          <span>Store Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-primary text-white shadow-xs'
              : 'text-secondary hover:text-main hover:bg-white/50'
          }`}
          aria-selected={activeTab === 'contact'}
          role="tab"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          <span>Contact Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'social'
              ? 'bg-primary text-white shadow-xs'
              : 'text-secondary hover:text-main hover:bg-white/50'
          }`}
          aria-selected={activeTab === 'social'}
          role="tab"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
          <span>Social Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-primary text-white shadow-xs'
              : 'text-secondary hover:text-main hover:bg-white/50'
          }`}
          aria-selected={activeTab === 'security'}
          role="tab"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <span>Account Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ml-auto cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-main font-bold shadow-2xs'
              : 'text-secondary hover:text-main'
          }`}
          aria-selected={activeTab === 'all'}
          role="tab"
        >
          View All
        </button>
      </nav>

      {/* ============================================================
          SECTION A: STORE INFORMATION
         ============================================================ */}
      {isVisible('store') && (
        <form
          onSubmit={handleStoreSubmit}
          className="rounded-2xl bg-surface border border-border p-5 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-main">
                  Store Information
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Configure your store&apos;s brand display name, description bio, and logo mark.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {storeSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in"
            >
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="flex-1 font-medium">
                Store information saved successfully. Changes are live across the website.
              </span>
              <button
                type="button"
                onClick={() => setStoreSuccess(false)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Global Store Error Alert */}
          {storeState.error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
              {storeState.error}
            </div>
          )}

          {/* Field: Store Name */}
          <div>
            <label htmlFor="storeName" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
              Store Display Name <span className="text-red-500">*</span>
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              required
              disabled={isStorePending}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              aria-invalid={Boolean(getStoreError('storeName'))}
              aria-describedby={getStoreError('storeName') ? 'store-name-error' : undefined}
              placeholder="Shewa Fashion"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getStoreError('storeName')
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-border focus:border-primary'
              }`}
            />
            {getStoreError('storeName') && (
              <p id="store-name-error" className="text-xs text-red-600 mt-1 font-medium">
                {getStoreError('storeName')}
              </p>
            )}
          </div>

          {/* Field: Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-main">
                Brand Bio / Tagline <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-secondary">{description.length}/500</span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={3}
              disabled={isStorePending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={Boolean(getStoreError('description'))}
              aria-describedby={getStoreError('description') ? 'store-desc-error' : undefined}
              placeholder="Contemporary Ethiopian fashion celebrating authentic textile craftsmanship and modern silhouettes."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y ${
                getStoreError('description')
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-border focus:border-primary'
              }`}
            />
            {getStoreError('description') && (
              <p id="store-desc-error" className="text-xs text-red-600 mt-1 font-medium">
                {getStoreError('description')}
              </p>
            )}
            <p className="text-[11px] text-secondary mt-1">
              Appears on footer, about, and meta tags across the website.
            </p>
          </div>

          {/* Field: Store Logo with persistent "X" button */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
              Store Logo / Brandmark <span className="text-secondary font-normal lowercase">(optional)</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-background border border-border flex items-center justify-center shrink-0 shadow-2xs group">
                  <Image
                    src={logoPreview}
                    alt="Store Logo"
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-contain p-2.5"
                  />
                  {/* Persistent "X" button to remove logo */}
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isStorePending}
                    aria-label="Remove logo"
                    title="Remove logo"
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-background border border-dashed border-border flex flex-col items-center justify-center text-secondary shrink-0">
                  <svg className="w-7 h-7 opacity-40 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span className="text-[10px] font-medium">No Logo</span>
                </div>
              )}

              <div className="space-y-2 flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="store-logo-file"
                  disabled={isStorePending}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isStorePending}
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-main hover:bg-black/[0.04] transition-colors cursor-pointer"
                  >
                    {logoPreview ? 'Replace Logo' : 'Upload Brand Logo'}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      disabled={isStorePending}
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Recommended: PNG, SVG, or WebP with transparent background (Max 5 MB).
                </p>
              </div>
            </div>
            {(clientLogoError || getStoreError('logo') || getStoreError('logoUrl')) && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                {clientLogoError || getStoreError('logo') || getStoreError('logoUrl')}
              </p>
            )}
          </div>

          {/* Section A Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isStorePending}
              id="save-store-info-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isStorePending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving Store Info…</span>
                </>
              ) : (
                'Save Store Information'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          SECTION B: CONTACT INFORMATION
         ============================================================ */}
      {isVisible('contact') && (
        <form
          onSubmit={handleContactSubmit}
          className="rounded-2xl bg-surface border border-border p-5 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-main">
                  Contact Information
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Customer inquiries, phone orders, and physical studio visit details.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {contactSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in"
            >
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="flex-1 font-medium">
                Contact information saved successfully.
              </span>
              <button
                type="button"
                onClick={() => setContactSuccess(false)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Global Contact Error Alert */}
          {contactState.error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
              {contactState.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Primary Phone <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                disabled={isContactPending}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={Boolean(getContactError('phone'))}
                aria-describedby={getContactError('phone') ? 'contact-phone-error' : undefined}
                placeholder="+251 91 123 4567"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getContactError('phone')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getContactError('phone') && (
                <p id="contact-phone-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getContactError('phone')}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Contact Email <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                disabled={isContactPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(getContactError('email'))}
                aria-describedby={getContactError('email') ? 'contact-email-error' : undefined}
                placeholder="hello@shewafashion.com"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getContactError('email')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getContactError('email') && (
                <p id="contact-email-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getContactError('email')}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="contact-whatsapp" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                WhatsApp Order Line <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="contact-whatsapp"
                name="whatsapp"
                type="tel"
                disabled={isContactPending}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                aria-invalid={Boolean(getContactError('whatsapp'))}
                aria-describedby={getContactError('whatsapp') ? 'contact-whatsapp-error' : undefined}
                placeholder="+251 91 123 4567"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getContactError('whatsapp')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getContactError('whatsapp') && (
                <p id="contact-whatsapp-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getContactError('whatsapp')}
                </p>
              )}
            </div>

            {/* Opening Hours */}
            <div>
              <label htmlFor="contact-hours" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Opening Hours <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="contact-hours"
                name="openingHours"
                type="text"
                disabled={isContactPending}
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label htmlFor="contact-address" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
              Physical Atelier / Studio Address <span className="text-secondary font-normal lowercase">(optional)</span>
            </label>
            <input
              id="contact-address"
              name="address"
              type="text"
              disabled={isContactPending}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Bole Sub-City, Next to Edna Mall, Addis Ababa, Ethiopia"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Google Maps Location */}
          <div>
            <label htmlFor="contact-maps" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
              Google Maps Location Link <span className="text-secondary font-normal lowercase">(optional HTTPS link)</span>
            </label>
            <input
              id="contact-maps"
              name="googleMapsUrl"
              type="url"
              disabled={isContactPending}
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              aria-invalid={Boolean(getContactError('googleMapsUrl'))}
              aria-describedby={getContactError('googleMapsUrl') ? 'contact-maps-error' : undefined}
              placeholder="https://maps.google.com/?q=..."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getContactError('googleMapsUrl')
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-border focus:border-primary'
              }`}
            />
            {getContactError('googleMapsUrl') && (
              <p id="contact-maps-error" className="text-xs text-red-600 mt-1 font-medium">
                {getContactError('googleMapsUrl')}
              </p>
            )}
          </div>

          {/* Section B Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isContactPending}
              id="save-contact-info-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isContactPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving Contact Info…</span>
                </>
              ) : (
                'Save Contact Information'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          SECTION C: SOCIAL LINKS
         ============================================================ */}
      {isVisible('social') && (
        <form
          onSubmit={handleSocialSubmit}
          className="rounded-2xl bg-surface border border-border p-5 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-main">
                  Social Links
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Link your official social media channels. Enter either handles (@shewafashion) or full profile URLs.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {socialSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in"
            >
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="flex-1 font-medium">
                Social links saved successfully.
              </span>
              <button
                type="button"
                onClick={() => setSocialSuccess(false)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Global Social Error Alert */}
          {socialState.error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
              {socialState.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instagram */}
            <div>
              <label htmlFor="social-instagram" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Instagram <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="social-instagram"
                name="instagram"
                type="text"
                disabled={isSocialPending}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                aria-invalid={Boolean(getSocialError('instagram'))}
                aria-describedby={getSocialError('instagram') ? 'social-instagram-error' : undefined}
                placeholder="@shewafashion or https://instagram.com/shewafashion"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getSocialError('instagram')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getSocialError('instagram') && (
                <p id="social-instagram-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getSocialError('instagram')}
                </p>
              )}
            </div>

            {/* Telegram */}
            <div>
              <label htmlFor="social-telegram" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Telegram Channel <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="social-telegram"
                name="telegram"
                type="text"
                disabled={isSocialPending}
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                aria-invalid={Boolean(getSocialError('telegram'))}
                aria-describedby={getSocialError('telegram') ? 'social-telegram-error' : undefined}
                placeholder="@shewafashion or https://t.me/shewafashion"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getSocialError('telegram')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getSocialError('telegram') && (
                <p id="social-telegram-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getSocialError('telegram')}
                </p>
              )}
            </div>

            {/* TikTok */}
            <div>
              <label htmlFor="social-tiktok" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                TikTok <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="social-tiktok"
                name="tiktok"
                type="text"
                disabled={isSocialPending}
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                aria-invalid={Boolean(getSocialError('tiktok'))}
                aria-describedby={getSocialError('tiktok') ? 'social-tiktok-error' : undefined}
                placeholder="@shewafashion or https://tiktok.com/@shewafashion"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getSocialError('tiktok')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getSocialError('tiktok') && (
                <p id="social-tiktok-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getSocialError('tiktok')}
                </p>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label htmlFor="social-facebook" className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5">
                Facebook Page <span className="text-secondary font-normal lowercase">(optional)</span>
              </label>
              <input
                id="social-facebook"
                name="facebook"
                type="text"
                disabled={isSocialPending}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                aria-invalid={Boolean(getSocialError('facebook'))}
                aria-describedby={getSocialError('facebook') ? 'social-facebook-error' : undefined}
                placeholder="shewafashion.et or https://facebook.com/shewafashion"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getSocialError('facebook')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              {getSocialError('facebook') && (
                <p id="social-facebook-error" className="text-xs text-red-600 mt-1 font-medium">
                  {getSocialError('facebook')}
                </p>
              )}
            </div>
          </div>

          {/* Section C Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSocialPending}
              id="save-social-links-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSocialPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving Social Links…</span>
                </>
              ) : (
                'Save Social Links'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          SECTION D: ACCOUNT SECURITY (Change Password)
         ============================================================ */}
      {isVisible('security') && (
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-2xl bg-surface border border-border p-5 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-main">
                  Account Security
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Change your administrator password. Your current password is required for verification.
              </p>
            </div>
          </div>

          {/* Logged in Admin Identity Banner */}
          {admin && (
            <div className="p-3.5 rounded-xl bg-primary-light/40 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-main font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Signed in as <strong className="font-semibold text-main">{admin.email}</strong></span>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded-md bg-white border border-primary/30 text-primary font-bold uppercase tracking-wider text-[10px]">
                {admin.role}
              </span>
            </div>
          )}

          {/* Success Banner */}
          {passwordSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start sm:items-center gap-3 animate-in fade-in"
            >
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="flex-1 font-medium leading-relaxed">
                Password changed successfully! Your account is secured, and all other active sessions have been signed out.
              </span>
              <button
                type="button"
                onClick={() => setPasswordSuccess(false)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Global Password Error Alert */}
          {passwordState.error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium leading-relaxed">
              {passwordState.error}
            </div>
          )}

          {/* Password Input 1: Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5"
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={isPasswordPending}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={Boolean(getPasswordError('currentPassword'))}
                aria-describedby={getPasswordError('currentPassword') ? 'current-password-error' : undefined}
                placeholder="Enter your existing administrator password"
                className={`w-full pl-3.5 pr-11 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getPasswordError('currentPassword')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                disabled={isPasswordPending}
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-secondary hover:text-main transition-colors cursor-pointer"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                title={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {getPasswordError('currentPassword') && (
              <p id="current-password-error" className="text-xs text-red-600 mt-1.5 font-medium">
                {getPasswordError('currentPassword')}
              </p>
            )}
          </div>

          {/* Password Input 2: New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                disabled={isPasswordPending}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={Boolean(getPasswordError('newPassword'))}
                aria-describedby={getPasswordError('newPassword') ? 'new-password-error' : undefined}
                placeholder="At least 8 characters"
                className={`w-full pl-3.5 pr-11 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getPasswordError('newPassword')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                disabled={isPasswordPending}
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-secondary hover:text-main transition-colors cursor-pointer"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                title={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {getPasswordError('newPassword') && (
              <p id="new-password-error" className="text-xs text-red-600 mt-1.5 font-medium">
                {getPasswordError('newPassword')}
              </p>
            )}
            {/* Live Length Indicator */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  newPassword.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-secondary'
                }`}
              >
                {newPassword.length >= 8 ? '✓ Minimum 8 characters met' : '• Requires at least 8 characters'}
              </span>
              {newPassword.length > 0 && (
                <span className="text-secondary">({newPassword.length} chars)</span>
              )}
            </div>
          </div>

          {/* Password Input 3: Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-main mb-1.5"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                disabled={isPasswordPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(getPasswordError('confirmPassword'))}
                aria-describedby={getPasswordError('confirmPassword') ? 'confirm-password-error' : undefined}
                placeholder="Re-type your new password"
                className={`w-full pl-3.5 pr-11 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  getPasswordError('confirmPassword')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                disabled={isPasswordPending}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-secondary hover:text-main transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {getPasswordError('confirmPassword') && (
              <p id="confirm-password-error" className="text-xs text-red-600 mt-1.5 font-medium">
                {getPasswordError('confirmPassword')}
              </p>
            )}
            {confirmPassword.length > 0 && newPassword.length > 0 && (
              <p
                className={`text-[11px] mt-1 font-medium ${
                  confirmPassword === newPassword ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {confirmPassword === newPassword ? '✓ Passwords match' : '• Passwords do not match yet'}
              </p>
            )}
          </div>

          {/* Section D Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={
                isPasswordPending ||
                !currentPassword ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              id="change-password-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPasswordPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Updating Password…</span>
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
