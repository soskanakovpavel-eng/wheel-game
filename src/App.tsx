import { useEffect, useState } from 'react'
import './App.css'

type Lobby = {
  id: number
  title: string
  min: number
  max: number
  bank: number
  players: number
  color: string
}

const lobbies: Lobby[] = [
  {
    id: 1,
    title: 'ЛОББИ I',
    min: 100,
    max: 1000,
    bank: 125450,
    players: 47,
    color: 'green',
  },
  {
    id: 2,
    title: 'ЛОББИ II',
    min: 1000,
    max: 10000,
    bank: 845000,
    players: 31,
    color: 'blue',
  },
  {
    id: 3,
    title: 'ЛОББИ III',
    min: 10000,
    max: 100000,
    bank: 4250000,
    players: 18,
    color: 'red',
  },
]

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function App() {
  const [telegramUser, setTelegramUser] =
    useState<TelegramUser | null>(null)

  const [balance] = useState(100000)

  const [selectedLobby, setSelectedLobby] =
    useState<Lobby | null>(null)

  const [bet, setBet] = useState('')

  useEffect(() => {
  const authenticateTelegramUser = async () => {
    const webApp = window.Telegram?.WebApp

    if (!webApp) {
      console.log(
        'Wheel Game открыт не внутри Telegram',
      )
      return
    }

    webApp.ready()
    webApp.expand()

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: webApp.initData,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        console.error(
          'Telegram authentication failed:',
          data,
        )

        return
      }

      console.log(
        'Telegram authentication successful:',
        data.user,
      )

      setTelegramUser(data.user)
    } catch (error) {
      console.error(
        'Authentication request failed:',
        error,
      )
    }
  }

  authenticateTelegramUser()
}, [])

  const numericBet = Number(bet)

  const chance =
    selectedLobby && numericBet >= selectedLobby.min
      ? (numericBet /
          (selectedLobby.bank + numericBet)) *
        100
      : 0

  const handleJoin = () => {
    if (!selectedLobby) return

    if (
      numericBet < selectedLobby.min ||
      numericBet > selectedLobby.max
    ) {
      alert(
        `Ставка должна быть от ${formatMoney(
          selectedLobby.min,
        )} до ${formatMoney(selectedLobby.max)}`,
      )

      return
    }

    if (numericBet > balance) {
      alert('Недостаточно средств')
      return
    }

    alert(
      `Тестовая ставка ${formatMoney(
        numericBet,
      )} принята!`,
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-wheel">
            🎡
          </span>

          <div>
            <div className="logo-title">
              WHEEL GAME
            </div>

            <div className="logo-subtitle">
              БОЛЬШОЕ КОЛЕСО
            </div>
          </div>
        </div>

        <div className="header-right">
          {telegramUser && (
            <div className="telegram-user">
              <span>👤</span>

              <div>
                <small>
                  ИГРОК
                </small>

                <strong>
                  {telegramUser.first_name}

                  {telegramUser.last_name
                    ? ` ${telegramUser.last_name}`
                    : ''}
                </strong>
              </div>
            </div>
          )}

          <div className="balance">
            <span>💰</span>

            <div>
              <small>
                БАЛАНС
              </small>

              <strong>
                {formatMoney(balance)}
              </strong>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-wheel">
            🎡
          </div>

          <h1>
            БОЛЬШОЕ КОЛЕСО
          </h1>

          <p>
            Выбери лобби и определи свою ставку
          </p>
        </section>

        <section className="lobbies">
          {lobbies.map((lobby) => (
            <button
              key={lobby.id}
              className={`lobby-card ${lobby.color}`}
              onClick={() => {
                setSelectedLobby(lobby)
                setBet('')
              }}
            >
              <div className="lobby-top">
                <div>
                  <span className="lobby-title">
                    {lobby.id === 1 && '🟢 '}
                    {lobby.id === 2 && '🔵 '}
                    {lobby.id === 3 && '🔴 '}

                    {lobby.title}
                  </span>

                  <span className="lobby-range">
                    {formatMoney(lobby.min)}
                    {' — '}
                    {formatMoney(lobby.max)}
                  </span>
                </div>

                <span className="arrow">
                  ›
                </span>
              </div>

              <div className="lobby-info">
                <span>
                  💰 {formatMoney(lobby.bank)}
                </span>

                <span>
                  👥 {lobby.players}
                </span>
              </div>
            </button>
          ))}
        </section>

        <section className="menu">
          <button>
            🎰
            <span>
              Джекпоты
            </span>
          </button>

          <button>
            🎟
            <span>
              Билеты
            </span>
          </button>

          <button>
            👤
            <span>
              Профиль
            </span>
          </button>

          <button>
            📜
            <span>
              История
            </span>
          </button>
        </section>
      </main>

      {selectedLobby && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="close"
              onClick={() =>
                setSelectedLobby(null)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              {selectedLobby.id === 1 && '🟢'}
              {selectedLobby.id === 2 && '🔵'}
              {selectedLobby.id === 3 && '🔴'}
            </div>

            <h2>
              {selectedLobby.title}
            </h2>

            <p className="modal-range">
              {formatMoney(selectedLobby.min)}
              {' — '}
              {formatMoney(selectedLobby.max)}
            </p>

            <div className="modal-stats">
              <div>
                <small>
                  БАНК
                </small>

                <strong>
                  {formatMoney(
                    selectedLobby.bank,
                  )}
                </strong>
              </div>

              <div>
                <small>
                  ИГРОКОВ
                </small>

                <strong>
                  {selectedLobby.players}
                </strong>
              </div>
            </div>

            <label>
              ТВОЯ СТАВКА
            </label>

            <input
              type="number"
              value={bet}
              min={selectedLobby.min}
              max={selectedLobby.max}
              placeholder={`${selectedLobby.min}`}
              onChange={(e) =>
                setBet(e.target.value)
              }
            />

            <div className="limits">
              <span>
                Мин:{' '}
                {formatMoney(
                  selectedLobby.min,
                )}
              </span>

              <span>
                Макс:{' '}
                {formatMoney(
                  selectedLobby.max,
                )}
              </span>
            </div>

            <div className="chance">
              <span>
                Твой шанс
              </span>

              <strong>
                {chance > 0
                  ? `${chance.toFixed(2)}%`
                  : '—'}
              </strong>
            </div>

            <button
              className="play-button"
              onClick={handleJoin}
            >
              🎡 УЧАСТВОВАТЬ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App