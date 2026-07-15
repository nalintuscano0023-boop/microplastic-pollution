export const ADMIN_COOKIE = 'admin_session'

const encoder = new TextEncoder()

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return toHex(signature)
}

export async function createAdminToken(password: string) {
  return hmac(password, 'admin-session')
}

export async function verifyAdminToken(token: string) {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false
  const expected = await hmac(secret, 'admin-session')
  return token.length === expected.length && token === expected
}
