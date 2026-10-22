/**
 * Shewa Fashion — Database and Operational Error Handling
 *
 * Provides centralized error mapping for Prisma known request errors
 * and other database/operational failure modes.
 */

import { Prisma } from '@prisma/client'

export interface ErrorResolution {
  field?: string
  message: string
  statusCode: number
}

/**
 * Checks whether an error is any Prisma client error instance.
 */
export function isPrismaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  )
}

/**
 * Maps known Prisma errors and generic runtime errors to safe, user-friendly
 * error messages while logging the underlying error details server-side.
 */
export function handlePrismaError(
  error: unknown,
  fallbackMessage = 'A database error occurred. Please try again.'
): ErrorResolution {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation (e.g. duplicate slug or unique name)
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : typeof error.meta?.target === 'string'
            ? error.meta.target
            : 'value'

        const primaryField =
          Array.isArray(error.meta?.target) && typeof error.meta.target[0] === 'string'
            ? error.meta.target[0]
            : undefined

        return {
          field: primaryField,
          message: `A record with this ${target} already exists. Please choose a different value.`,
          statusCode: 409,
        }
      }

      case 'P2025': {
        // Record not found
        return {
          message: 'The requested record was not found or has already been deleted.',
          statusCode: 404,
        }
      }

      case 'P2003': {
        // Foreign key constraint failed
        return {
          message: 'This operation cannot be completed because related records depend on it.',
          statusCode: 409,
        }
      }

      case 'P1001':
      case 'P1002': {
        // Database unreachable / connection timed out
        return {
          message: 'Unable to reach the database server. Please try again shortly.',
          statusCode: 503,
        }
      }

      case 'P1008': {
        // Operation timed out
        return {
          message: 'The database operation timed out. Please try again.',
          statusCode: 504,
        }
      }

      default: {
        return {
          message: fallbackMessage,
          statusCode: 500,
        }
      }
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Invalid data format submitted to the database.',
      statusCode: 400,
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: 'Database connection could not be established. Please check service status.',
      statusCode: 503,
    }
  }

  return {
    message: fallbackMessage,
    statusCode: 500,
  }
}
