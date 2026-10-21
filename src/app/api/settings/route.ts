import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/products'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return apiSuccess(settings)
  } catch (error) {
    console.error('Failed to retrieve public store settings:', error)
    return apiInternalError('Failed to load store settings.')
  }
}
