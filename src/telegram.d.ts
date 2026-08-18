interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramWebApp {
  initData: string

  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
  }

  ready: () => void
  expand: () => void

  colorScheme: 'light' | 'dark'
  version: string
  platform: string
}

interface Telegram {
  WebApp: TelegramWebApp
}

interface Window {
  Telegram?: Telegram
}