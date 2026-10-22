'use client'

import React, { useState, useRef, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { updateStoreSettingsAction, type SettingsActionState } from '@/app/actions/settings'

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
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<SettingsActionState>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Fields
  const [storeName, setStoreName] = useState(initialSettings?.storeName || 'Shewa Fashion')
  const [description, setDescription] = useState(initialSettings?.description || '')
  const [phone, setPhone] = useState(initialSettings?.phone || '')
  const [email, setEmail] = useState(initialSettings?.email || '')
  const [whatsapp, setWhatsapp] = useState(initialSettings?.whatsapp || '')
  const [address, setAddress] = useState(initialSettings?.address || '')
  const [openingHours, setOpeningHours] = useState(initialSettings?.openingHours || '')
  const [instagram, setInstagram] = useState(initialSettings?.instagram || '')
  const [facebook, setFacebook] = useState(initialSettings?.facebook || '')
  const [tiktok, setTiktok] = useState(initialSettings?.tiktok || '')
  const [telegram, setTelegram] = useState(initialSettings?.telegram || '')
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialSettings?.googleMapsUrl || '')

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>(initialSettings?.logoUrl || '')
  const [clientLogoError, setClientLogoError] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const currentObjectUrlRef = useRef<string | null>(null)

  // Revoke object URL on unmount to prevent browser memory leaks
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
      // 5 MB client guard
      if (file.size > 5 * 1024 * 1024) {
        setClientLogoError('Logo image file exceeds the 5 MB limit.')
        if (logoInputRef.current) logoInputRef.current.value = ''
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        setClientLogoError('Unsupported logo format. Please select a PNG, JPEG, WebP, AVIF, or SVG image.')
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

  function getFieldError(fieldName: string): string | undefined {
    return state.errors?.find((e) => e.field === fieldName)?.message
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState({})
    setShowSuccess(false)

    const formData = new FormData()
    formData.set('storeName', storeName)
    formData.set('description', description)
    formData.set('phone', phone)
    formData.set('email', email)
    formData.set('whatsapp', whatsapp)
    formData.set('address', address)
    formData.set('openingHours', openingHours)
    formData.set('instagram', instagram)
    formData.set('facebook', facebook)
    formData.set('tiktok', tiktok)
    formData.set('telegram', telegram)
    formData.set('googleMapsUrl', googleMapsUrl)

    if (removeLogo) {
      formData.set('removeLogo', 'true')
    } else if (logoFile) {
      formData.set('logo', logoFile)
    } else if (initialSettings?.logoUrl) {
      formData.set('logoUrl', initialSettings.logoUrl)
    }

    startTransition(async () => {
      const res = await updateStoreSettingsAction(undefined, formData)
      if (res.success) {
        setShowSuccess(true)
        setState({})
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setState(res)
        setShowSuccess(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Success Notification */}
      {showSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in"
        >
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <div className="flex-1 font-medium">
            Store settings saved successfully. Changes are now reflected across the public website.
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* General Error Alert */}
      {state.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Section 1: Brand & Identity */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-serif text-lg font-bold text-main">Brand & Store Identity</h2>
          <p className="text-xs text-secondary mt-0.5">
            Configure the public display name, brand bio, and optional store logo.
          </p>
        </div>

        {/* Store Name */}
        <div>
          <label htmlFor="storeName" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Store Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="storeName"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Shewa Fashion"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              getFieldError('storeName') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {getFieldError('storeName') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError('storeName')}</p>
          )}
        </div>

        {/* Store Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Brand Bio / Tagline
          </label>
          <textarea
            id="description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contemporary Ethiopian fashion celebrating authentic textile craftsmanship and modern silhouettes."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
          <p className="text-[11px] text-secondary mt-1">
            Displayed on footer, about, and meta tags across the website.
          </p>
        </div>

        {/* Logo / Brandmark */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Store Logo / Brandmark (Optional)
          </label>
          <div className="flex items-center gap-4 pt-1">
            {logoPreview ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                <Image
                  src={logoPreview}
                  alt="Store Logo"
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-background border border-dashed border-border flex flex-col items-center justify-center text-secondary shrink-0">
                <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-[10px] mt-1">No Logo</span>
              </div>
            )}

            <div className="space-y-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
                id="store-logo-file"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-main hover:bg-black/[0.04] transition-colors"
                >
                  {logoPreview ? 'Replace Logo' : 'Upload Logo'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-secondary">
                PNG, SVG, or WebP with transparent background recommended.
              </p>
            </div>
          </div>
          {(clientLogoError || getFieldError('logo') || getFieldError('logoUrl')) && (
            <p className="text-xs text-red-600 mt-1">
              {clientLogoError || getFieldError('logo') || getFieldError('logoUrl')}
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Contact & Location */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-main">Contact & Location</h2>
          <p className="text-xs text-secondary mt-0.5">
            Customer inquiries and studio visit details. Optional fields remain hidden on the website when left blank.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Contact Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@shewafashion.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('email') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('email') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('email')}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Primary Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 91 123 4567"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('phone') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('phone') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('phone')}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              WhatsApp Direct Order Number
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+251 91 123 4567"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('whatsapp') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('whatsapp') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('whatsapp')}</p>
            )}
          </div>

          {/* Opening Hours */}
          <div>
            <label htmlFor="openingHours" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Business / Studio Hours
            </label>
            <input
              id="openingHours"
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div>
          <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Physical Studio / Atelier Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Bole Sub-City, Next to Edna Mall, Addis Ababa, Ethiopia"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Section 3: Social Media & Direct Channels */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-main">Social Channels & Maps</h2>
          <p className="text-xs text-secondary mt-0.5">
            Social handles and profile links. Enter either @handles or full HTTPS URLs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Instagram
            </label>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@shewafashion or https://instagram.com/shewafashion"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('instagram') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('instagram') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('instagram')}</p>
            )}
          </div>

          {/* Telegram */}
          <div>
            <label htmlFor="telegram" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Telegram Channel / Handle
            </label>
            <input
              id="telegram"
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@shewafashion or https://t.me/shewafashion"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('telegram') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('telegram') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('telegram')}</p>
            )}
          </div>

          {/* TikTok */}
          <div>
            <label htmlFor="tiktok" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              TikTok
            </label>
            <input
              id="tiktok"
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@shewafashion or https://tiktok.com/@shewafashion"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('tiktok') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('tiktok') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('tiktok')}</p>
            )}
          </div>

          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
              Facebook
            </label>
            <input
              id="facebook"
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="shewafashion.et or https://facebook.com/shewafashion"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                getFieldError('facebook') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
              }`}
            />
            {getFieldError('facebook') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('facebook')}</p>
            )}
          </div>
        </div>

        {/* Google Maps link */}
        <div>
          <label htmlFor="googleMapsUrl" className="block text-xs font-bold uppercase tracking-wider text-main mb-1">
            Google Maps Studio Location Link (HTTPS)
          </label>
          <input
            id="googleMapsUrl"
            type="url"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background text-main focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              getFieldError('googleMapsUrl') ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {getFieldError('googleMapsUrl') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError('googleMapsUrl')}</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          id="save-settings-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving Settings...
            </>
          ) : (
            'Save Store Settings'
          )}
        </button>
      </div>
    </form>
  )
}
