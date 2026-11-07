import { Icon } from '../Icon'
import { BuildIcon } from '../playhub/BuildIcon'
import { LOADER_NAME } from '../../lib/format'
import { useLobby } from '../../state/lobbyMode'
import { useProfiles } from '../../state/profiles'
import { openModal } from '../../state/ui'
import { useT } from '../../i18n'
import '../../styles/pixel/quick-builds.css'

/// Быстрый выбор сборки прямо в лобби: список своих сборок вместо карточки
/// «Сегодня играем · <сервер>». Нажатие выбирает сборку, «Играть» запускает её.
/// Раньше за сменой сборки нужно было уходить в каталог — здесь это один клик.
export function QuickBuilds() {
  const t = useT()
  const profiles = useProfiles((s) => s.profiles)
  const picked = useLobby((s) => s.picked)
  const pick = useLobby((s) => s.pick)
  const current = picked && picked.kind === 'build' ? picked.name : null

  return (
    <div className="qb" data-notip>
      <div className="qb-head">
        <span className="qb-lab">{t('Сборка')}</span>
        <button className="qb-all" onClick={() => openModal('nbModal')}>
          <Icon id="i-plus" />
          {t('Новая')}
        </button>
      </div>

      {profiles.length ? (
        <div className="qb-row" role="listbox" aria-label={t('Мои сборки')}>
          {profiles.map((p) => {
            const on = p.name === current
            return (
              <button
                key={p.name}
                role="option"
                aria-selected={on}
                className={'qb-item' + (on ? ' on' : '')}
                data-track="lobby_quick_build"
                onClick={() => pick({ kind: 'build', name: p.name })}
              >
                <span className="qb-cover">
                  <BuildIcon icon={p.icon} name={p.name} size={40} />
                </span>
                <span className="qb-meta">
                  <b>{p.name}</b>
                  <span>{LOADER_NAME(p) + ' · ' + p.version}</span>
                </span>
                {on ? (
                  <span className="qb-tick">
                    <Icon id="i-check" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : (
        <button className="qb-empty" onClick={() => openModal('nbModal')}>
          <Icon id="i-box2" />
          <span>
            <b>{t('Сборок пока нет')}</b>
            <span>{t('Создай первую — она появится здесь')}</span>
          </span>
        </button>
      )}
    </div>
  )
}
