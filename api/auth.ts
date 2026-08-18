import crypto from 'node:crypto'

function createTelegramSecretKey(botToken: string): Buffer {
  return crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()
}

function validateTelegramInitData(
  initData: string,
  botToken: string,
) {
  const params = new URLSearchParams(initData)

  const receivedHash = params.get('hash')

  if (!receivedHash) {
    return {
      valid: false,
      error: 'Missing hash',
    }
  }

  if (!/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return {
      valid: false,
      error: 'Invalid hash format',
    }
  }

  const authDateRaw = params.get('auth_date')

  if (!authDateRaw) {
    return {
      valid: false,
      error: 'Missing auth_date',
    }
  }

  const authDate = Number(authDateRaw)

  if (!Number.isFinite(authDate)) {
    return {
      valid: false,
      error: 'Invalid auth_date',
    }
  }

  const now = Math.floor(Date.now() / 1000)

  const maxAge = 24 * 60 * 60

  if (Math.abs(now - authDate) > maxAge) {
    return {
      valid: false,
      error: 'Telegram data is too old',
    }
  }

  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey =
    createTelegramSecretKey(botToken)

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  const calculatedBuffer =
    Buffer.from(calculatedHash, 'hex')

  const receivedBuffer =
    Buffer.from(receivedHash, 'hex')

  if (
    calculatedBuffer.length !==
    receivedBuffer.length
  ) {
    return {
      valid: false,
      error: 'Invalid Telegram signature',
    }
  }

  const hashesMatch =
    crypto.timingSafeEqual(
      calculatedBuffer,
      receivedBuffer,
    )

  if (!hashesMatch) {
    return {
      valid: false,
      error: 'Invalid Telegram signature',
    }
  }

  const userRaw = params.get('user')

  if (!userRaw) {
    return {
      valid: false,
      error: 'Missing Telegram user',
    }
  }

  let user: unknown

  try {
    user = JSON.parse(userRaw)
  } catch {
    return {
      valid: false,
      error: 'Invalid user data',
    }
  }

  return {
    valid: true,
    user,
  }
}

export default async function handler(
  req: {
    method?: string
    body?: {
      initData?: string
    }
  },
  res: {
    status: (code: number) => {
      json: (data: unknown) => void
    }
  },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  const botToken =
    process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    return res.status(500).json({
      ok: false,
      error: 'TELEGRAM_BOT_TOKEN is not configured',
    })
  }

  const initData = req.body?.initData

  if (
    typeof initData !== 'string' ||
    initData.length === 0
  ) {
    return res.status(400).json({
      ok: false,
      error: 'initData is required',
    })
  }

  const result =
    validateTelegramInitData(
      initData,
      botToken,
    )

  if (!result.valid) {
    return res.status(401).json({
      ok: false,
      error: result.error,
    })
  }

  return res.status(200).json({
    ok: true,
    user: result.user,
  })
}