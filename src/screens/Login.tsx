import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { PxIcon } from '../components/PxIcon'
import { LicenceBuyLink, type GameAccountKind } from '../components/AccountChoice'
import { KindPanel } from '../modals/AccountAdd'
import { LangPicker } from '../components/LangPicker'
import { useT } from '../i18n'
import { cancelWebLogin, copyUserCode, copyVerifyLink, quickStart, startWebLogin, useLogin } from '../state/login'
import { millidaEver } from '../state/onboarding'
import { finishFirstRun, useFirstRun } from '../state/firstRun'
import { isGameAccountKind, useAccounts } from '../state/accounts'
import { refreshGameNick } from '../state/gameNick'
import { openExt } from '../lib/api'
import { PixelField } from '../components/lobby/PixelField'
import '../styles/pixel/login.css'

const SAFETY_URL = 'https://millida.net/launcher/bezopasnost'

/// Три способа входа на одном экране. `millida` — аккаунт Millida (друзья, ник,
/// баланс; пароль вводится только на сайте). `microsoft` — лицензия Minecraft.
/// `offline` — ник без лицензии: нет Realms и нет лицензионных серверов.
type LoginKind = 'millida' | 'microsoft' | 'offline'

/// Шаг «игровой аккаунт» после входа в Millida: лицензия или офлайн-ник.
/// Сам Millida здесь не предлагается — он уже выполнен.
function GameAccountStep() {
  const t = useT()
  const [kind, setKind] = useState<GameAccountKind | null>(null)
  const added = useAccounts((s) => s.list.some((a) => isGameAccountKind(a.kind)))

  useEffect(() => {
    void refreshGameNick()
  }, [])

  useEffect(() => {
    if (added) finishFirstRun()
  }, [added])

  return (
    <div className="login-form lg2-card">
      <LangPicker className="lg2-lang" />
      <div className="login-logo">
        <img src="/millida-logo.svg" alt="" width={56} height={56} />
      </div>
      <h1>{t('Игровой аккаунт')}</h1>
      <p className="sub">{t('Как будешь играть?')}</p>
      {kind ? (
        <KindPanel kind={kind} onBack={() => setKind(null)} onDone={() => undefined} onSafety={() => openExt(SAFETY_URL)} />
      ) : (
        <>
          <button className="btn lg primary lg2-main" data-track="first_run_licence" onClick={() => setKind('microsoft')}>
            <PxIcon name="mc-grass" size={24} />
            {t('Лицензия')}
          </button>
          <button className="btn md secondary lg2-guest lg2-offline" data-track="first_run_offline" onClick={() => setKind('offline')}>
            <b>{t('Офлайн')}</b>
            <span>{t('нет Realms и нет лицензионных серверов')}</span>
          </button>
          <LicenceBuyLink className="lg2-buy" track="first_run" />
        </>
      )}
    </div>
  )
}

/// Вход по коду Millida: лаунчер открывает страницу, игрок подтверждает, ядро
/// забирает токен. Пароль в лаунчер не попадает.
function MillidaStep({ onBack }: { onBack: () => void }) {
  const t = useT()
  const login = useLogin()

  return (
    <div className="login-form lg2-card">
      <LangPicker className="lg2-lang" />
      <button className="btn sm ghost" style={{ alignSelf: 'flex-start', marginBottom: '10px' }} onClick={onBack}>
        <Icon id="i-chev-l" />
        {t('Назад')}
      </button>
      <div className="login-logo">
        <img src="/millida-logo.svg" alt="" width={56} height={56} />
      </div>
      <h1>{t('Вход в Millida')}</h1>
      <p className="sub">{t('Нет аккаунта — создастся при входе')}</p>

      <button className="btn lg primary lg2-main" id="webLogin" disabled={login.webBusy} onClick={() => void startWebLogin()}>
        <Icon id="i-shield" />
        {login.webLabel}
      </button>
      {login.webBusy ? (
        <div className="login-code-box">
          <button
            className="login-code"
            aria-label={t('Скопировать код')}
            aria-busy={!login.userCode}
            data-notip
            disabled={!login.userCode}
            onClick={() => void copyUserCode()}
          >
            {login.userCode ? (
              <>
                <span>{login.userCode}</span>
                <Icon id="i-copy" />
              </>
            ) : (
              <i className="login-code-wait" aria-hidden="true" />
            )}
          </button>
          <div className="login-code-actions">
            <button className="btn sm secondary" onClick={() => void startWebLogin(true)}>
              {t('Открыть страницу')}
            </button>
            <button className="btn sm ghost" onClick={copyVerifyLink}>
              {t('Копировать ссылку')}
            </button>
            <button className="btn sm ghost" onClick={cancelWebLogin}>
              {t('Отмена')}
            </button>
          </div>
          {/* Браузер открывается не всегда: адрес для ручного ввода кода обязан быть виден. */}
          <div className="login-reg">{t('Не открылось — {url}', { url: 'millida.net/auth/launcher' })}</div>
        </div>
      ) : (
        <div className="login-reg" id="tgHint" style={{ display: login.hintShown ? 'block' : 'none' }}>
          {login.hintText}
        </div>
      )}

      <div className="trust">
        <Icon id="i-shield" />
        <span>{t('Пароль — только на сайте Millida')}</span>
      </div>
    </div>
  )
}

/// Экран выбора: аккаунт Millida, лицензия или офлайн-ник.
function LoginChoice({ onPick, guestAllowed }: { onPick: (kind: LoginKind) => void; guestAllowed: boolean }) {
  const t = useT()

  return (
    <div className="login-form lg2-card">
      <LangPicker className="lg2-lang" />
      <div className="login-logo">
        <img src="/millida-logo.svg" alt="" width={56} height={56} />
      </div>
      <h1>{t('Как будешь играть?')}</h1>

      <button className="btn lg primary lg2-main" data-track="login_choice_millida" onClick={() => onPick('millida')}>
        <Icon id="i-mo-key" />
        {t('Войти через аккаунт Millida')}
      </button>

      <button className="btn md secondary lg2-guest" data-track="login_choice_licence" onClick={() => onPick('microsoft')}>
        <PxIcon name="mc-grass" size={22} />
        {t('Лицензия')}
      </button>

      <button className="btn md secondary lg2-guest lg2-offline" data-track="login_choice_offline" onClick={() => onPick('offline')}>
        <b>{t('Офлайн')}</b>
        <span>{t('нет Realms и нет лицензионных серверов')}</span>
      </button>

      {guestAllowed ? (
        <button className="btn md ghost lg2-guest" data-track="login_choice_guest" id="quickStart" onClick={quickStart}>
          {t('Играть гостем')}
        </button>
      ) : null}

      <LicenceBuyLink className="lg2-buy" track="login_choice" />
    </div>
  )
}

export function Login({ on }: { on: boolean }) {
  const t = useT()
  const artRef = useRef<HTMLImageElement>(null)
  const guestAllowed = millidaEver()
  const step = useFirstRun((s) => s.open)
  const [kind, setKind] = useState<LoginKind | null>(null)

  // Возврат к выбору после подстановки аккаунта: панель входа остаётся здесь же.
  const back = () => {
    cancelWebLogin()
    setKind(null)
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14,
      y = ((e.clientY - r.top) / r.height - 0.5) * 8
    if (artRef.current) artRef.current.style.transform = 'translate(' + x + 'px,' + y + 'px)'
  }

  return (
    <div id="scr-login" className={'lg2' + (on ? ' on' : '')} onMouseMove={onMove}>
      {/* Сцена лобби фоном (правка владельца 23.09.2026: экраны входа были
          в старом UI со старыми персонажами). */}
      <PixelField on={on} />
      <div className="login-wrap lg2-wrap">
        {step ? (
          <GameAccountStep />
        ) : kind === 'millida' ? (
          <MillidaStep onBack={back} />
        ) : kind === 'microsoft' || kind === 'offline' ? (
          <div className="login-form lg2-card">
            <LangPicker className="lg2-lang" />
            <button className="btn sm ghost" style={{ alignSelf: 'flex-start', marginBottom: '10px' }} onClick={back}>
              <Icon id="i-chev-l" />
              {t('Назад')}
            </button>
            <KindPanel
              kind={kind}
              onBack={back}
              onDone={() => setKind(null)}
              onSafety={() => openExt(SAFETY_URL)}
            />
          </div>
        ) : (
          <LoginChoice onPick={setKind} guestAllowed={guestAllowed} />
        )}
        <div className="login-art lg2-art">
          <img ref={artRef} src="/lobby/duo@2x.webp" alt="" />
          <span className="lg2-shadow" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
