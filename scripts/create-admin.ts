/**
 * Shewa Fashion — Administrator Provisioning Script
 *
 * Securely provisions an administrator account in PostgreSQL.
 *
 * Usage:
 *   Interactive prompt (recommended locally):
 *     npm run create-admin
 *
 *   Non-interactive (via environment variables, e.g., CI or automated deployment):
 *     ADMIN_NAME="Biniyam" ADMIN_EMAIL="admin@shewafashion.com" ADMIN_PASSWORD="your-strong-password" npm run create-admin
 *
 * Security:
 *   - Passwords are encrypted with bcrypt (12 rounds) before storage.
 *   - Plaintext passwords and hashes are never printed or logged.
 *   - Idempotent: Exits safely without overwriting if an administrator already exists with the given email.
 *   - Enforces minimum 8-character password length.
 */

import readline from 'readline'
import bcrypt from 'bcryptjs'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function askQuestion(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('\n========================================')
  console.log(' Shewa Fashion — Provision Administrator')
  console.log('========================================\n')

  let name = process.env.ADMIN_NAME
  let email = process.env.ADMIN_EMAIL
  let password = process.env.ADMIN_PASSWORD

  // Interactive prompts if environment variables are not supplied
  if (!email || !password) {
    if (!name) {
      name = await askQuestion('Admin Name [Administrator]: ')
      if (!name) name = 'Administrator'
    }

    if (!email) {
      email = await askQuestion('Admin Email: ')
    }

    if (!password) {
      password = await askQuestion('Admin Password (min 8 characters): ')
    }
  }

  name = name || 'Administrator'
  email = (email || '').trim().toLowerCase()

  // 1. Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    console.error('❌ Error: A valid email address is required.')
    process.exit(1)
  }

  // 2. Validate Password Length
  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.')
    process.exit(1)
  }

  try {
    // 3. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      console.log(`ℹ️  A user with email "${email}" already exists with role "${existing.role}".`)
      console.log('   No changes were made. Existing accounts are not automatically overwritten.')
      process.exit(0)
    }

    // 4. Hash password with bcrypt cost 12
    console.log('🔒 Generating secure password hash (bcrypt 12 rounds)...')
    const passwordHash = await bcrypt.hash(password, 12)

    // 5. Create administrator
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    console.log('\n✅ Administrator account successfully provisioned!')
    console.log(`   ID:    ${user.id}`)
    console.log(`   Name:  ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role:  ${user.role}`)
    console.log('\nYou can now log in at /admin/login\n')
  } catch (err) {
    console.error('❌ Failed to provision administrator:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
