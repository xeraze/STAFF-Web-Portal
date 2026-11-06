import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DemoSession, PortalPage } from './data';
import { activity, announcements, navigation, roles, rules, searchItems } from './data';

const SESSION_KEY = 'staff_portal_demo_session_v2';

function readSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as DemoSession;
    return value.login && value.displayName && value.role ? value : null;
  } catch {
    return null;
  }
}

function makeSession(login: string): DemoSession {
  const suffix = login.split('_').at(-1) ?? '0000';
  return { login, displayName: `Staff ${suffix}`, role: 'Модератор' };
}

function pageFromHash(): PortalPage {
  const value = window.location.hash.replace('#/', '') as PortalPage;
  return navigation.some((item) => item.id === value) ? value : 'overview';
}

function navigateTo(page: PortalPage, setPage: (page: PortalPage) => void) {
  window.location.hash = `/${page}`;
  setPage(page);
}

type IconName = 'overview' | 'users' | 'book' | 'shield' | 'search' | 'bell' | 'chevron' | 'arrow' | 'logout' | 'check' | 'clock' | 'message' | 'chart' | 'spark' | 'external' | 'close' | 'menu' | 'file' | 'lock' | 'help' | 'calendar' | 'info';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="4" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7.5" r="3.5"/><path d="M16 4.3a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h8M8 14h5"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-7"/></>,
    spark: <><path d="m12 3 1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 15h8M8 18h6"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.3-1.8 2.7M12 17h.01"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  };

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark${small ? ' brand-mark--small' : ''}`} aria-hidden="true"><span /><span /><span /></span>;
}

function LoginScreen({ onComplete }: { onComplete: (session: DemoSession) => void }) {
  const [login, setLogin] = useState('');
  const [passwordLength, setPasswordLength] = useState(0);
  const [status, setStatus] = useState('Подготовка демонстрационной сессии');
  const [isReady, setIsReady] = useState(false);
  const completed = useRef(false);
  const [generatedLogin] = useState(() => `staff_${Math.floor(1000 + Math.random() * 9000)}`);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete(makeSession(generatedLogin));
  };

  useEffect(() => {
    let cancelled = false;
    const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      await pause(350);
      for (let index = 1; index <= generatedLogin.length; index += 1) {
        if (cancelled) return;
        setLogin(generatedLogin.slice(0, index));
        await pause(54);
      }
      await pause(180);
      for (let index = 1; index <= 14; index += 1) {
        if (cancelled) return;
        setPasswordLength(index);
        await pause(37);
      }
      if (cancelled) return;
      setStatus('Демонстрационный доступ подтверждён');
      setIsReady(true);
      await pause(800);
      if (!cancelled) finish();
    };

    void run();
    return () => { cancelled = true; };
  }, [generatedLogin]);

  return (
    <main className="auth-screen">
      <div className="auth-orbit auth-orbit--one" />
      <div className="auth-orbit auth-orbit--two" />
      <div className="auth-topline">
        <a className="brand brand--auth" href="#/overview" onClick={(event) => event.preventDefault()}>
          <BrandMark />
          <span><strong>STAFF</strong><small>WORKSPACE</small></span>
        </a>
        <span className="auth-topline__label"><span className="status-dot" /> DEMO ENVIRONMENT</span>
      </div>

      <div className="auth-layout">
        <section className="auth-intro">
          <div className="eyebrow"><span className="eyebrow__line" /> DISCORD COMMUNITY / STAFF</div>
          <h1>Рабочее пространство<br /><span>команды сервера.</span></h1>
          <p className="auth-intro__copy">Единая точка доступа к внутренним материалам, правилам и справочной информации команды.</p>
          <div className="auth-feature-list">
            <div><span className="auth-feature-icon"><Icon name="book" size={17} /></span><span><b>Документация</b><small>Роли, инструкции и база знаний</small></span></div>
            <div><span className="auth-feature-icon"><Icon name="users" size={17} /></span><span><b>Командная структура</b><small>Направления и зоны ответственности</small></span></div>
            <div><span className="auth-feature-icon"><Icon name="shield" size={17} /></span><span><b>Рабочие стандарты</b><small>Общие принципы и регламенты</small></span></div>
          </div>
        </section>

        <section className="auth-card" aria-label="Демонстрационный вход">
          <div className="auth-card__top">
            <div className="auth-card__icon"><Icon name="lock" size={21} /></div>
            <span className="auth-card__badge">DEMO ACCESS</span>
          </div>
          <p className="auth-card__kicker">АВТОРИЗАЦИЯ</p>
          <h2>Вход в портал</h2>
          <p className="auth-card__description">Система автоматически заполнит тестовые данные и откроет демонстрационный профиль.</p>

          <div className="auth-fields">
            <label className="auth-field">
              <span>Логин</span>
              <span className="auth-input"><span className="auth-input__text">{login || ' '}</span><i className={!login ? 'is-caret' : ''} /></span>
            </label>
            <label className="auth-field">
              <span>Пароль</span>
              <span className="auth-input auth-input--password"><span>{'•'.repeat(passwordLength)}</span><i className={passwordLength === 0 ? 'is-caret' : ''} /></span>
            </label>
          </div>

          <div className="auth-progress-row"><span>{status}</span><span>{isReady ? '100%' : `${Math.min(99, Math.round((login.length / generatedLogin.length * 55) + (passwordLength / 14 * 45)))}%`}</span></div>
          <div className="progress-track"><span style={{ width: isReady ? '100%' : `${Math.min(99, (login.length / generatedLogin.length * 55) + (passwordLength / 14 * 45))}%` }} /></div>
          <button className="button button--primary auth-submit" type="button" onClick={finish} disabled={!isReady}>
            {isReady ? 'Открыть демо-портал' : 'Выполняется вход'} <Icon name="arrow" size={16} />
          </button>
          <p className="auth-card__note"><Icon name="info" size={14} /> Это локальная демонстрация. Реальная проверка учётных данных не выполняется.</p>
        </section>
      </div>

      <div className="auth-bottom"><span>STAFF PORTAL CONCEPT <span className="muted-dot">·</span> UI PREVIEW</span><span>НЕ АФФИЛИРОВАН С DISCORD INC. <span className="muted-dot">·</span> НЕОФИЦИАЛЬНЫЙ КОНЦЕПТ</span></div>
    </main>
  );
}

function Sidebar({ active, onNavigate, onLogout, mobileOpen, onClose, displayName }: {
  active: PortalPage;
  onNavigate: (page: PortalPage) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onClose: () => void;
  displayName: string;
}) {
  const groups = [...new Set(navigation.map((item) => item.section))];
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Закрыть меню" onClick={onClose} />}
      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-brand-row">
          <a className="brand" href="#/overview" onClick={(event) => { event.preventDefault(); onNavigate('overview'); }}>
            <BrandMark />
            <span><strong>STAFF</strong><small>WORKSPACE</small></span>
          </a>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Закрыть меню"><Icon name="close" /></button>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-avatar">D</span>
          <span className="workspace-switcher__copy"><b>Discord</b><small>Staff workspace</small></span>
          <span className="workspace-switcher__dots">•••</span>
        </div>

        <nav className="side-navigation" aria-label="Основная навигация">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-group__label">{group}</p>
              {navigation.filter((item) => item.section === group).map((item) => {
                const iconName: Record<PortalPage, IconName> = { overview: 'overview', team: 'users', guide: 'book', rules: 'shield' };
                return (
                  <button key={item.id} className={`nav-link${active === item.id ? ' nav-link--active' : ''}`} onClick={() => onNavigate(item.id)}>
                    <Icon name={iconName[item.id]} size={17} />
                    <span>{item.label}</span>
                    {active === item.id && <span className="nav-link__indicator" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-support-card">
          <div className="support-card__icon"><Icon name="help" size={17} /></div>
          <b>Нужна помощь?</b>
          <p>Откройте справочник или обратитесь к ответственному сотруднику.</p>
          <button onClick={() => onNavigate('guide')}>Открыть справочник <Icon name="arrow" size={14} /></button>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="profile-avatar">S</span>
            <span className="sidebar-profile__copy"><b>{displayName}</b><small>Модератор</small></span>
            <button className="icon-button" aria-label="Выйти из портала" onClick={onLogout}><Icon name="logout" size={17} /></button>
          </div>
          <div className="sidebar-build">CONCEPT BUILD <span>v2.0</span></div>
        </div>
      </aside>
    </>
  );
}

function Header({ title, onNavigate, onMenu, displayName }: { title: string; onNavigate: (page: PortalPage) => void; onMenu: () => void; displayName: string }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const results = useMemo(() => {
    const normalised = query.trim().toLocaleLowerCase('ru');
    if (!normalised) return [];
    return searchItems.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('ru').includes(normalised));
  }, [query]);

  const chooseResult = (page: PortalPage) => {
    onNavigate(page);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-button mobile-menu-button" aria-label="Открыть меню" onClick={onMenu}><Icon name="menu" /></button>
        <div className="breadcrumbs"><span>Discord</span><Icon name="chevron" size={14} /><strong>{title}</strong></div>
      </div>
      <div className="topbar__right">
        <div className={`global-search${searchOpen ? ' global-search--open' : ''}`}>
          <Icon name="search" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); if (event.key === 'Enter' && results[0]) chooseResult(results[0].page); }} placeholder="Поиск по порталу" aria-label="Поиск по порталу" />
          <kbd>⌘ K</kbd>
          {searchOpen && query.trim() && (
            <div className="search-results">
              <p className="dropdown-label">РЕЗУЛЬТАТЫ ПОИСКА</p>
              {results.length ? results.map((item) => <button key={item.title} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseResult(item.page)}><span className="search-result-icon"><Icon name="file" size={15} /></span><span><b>{item.title}</b><small>{item.description}</small></span><Icon name="arrow" size={14} /></button>) : <p className="search-empty">Ничего не найдено</p>}
            </div>
          )}
        </div>
        <div className="topbar-action-wrap">
          <button className={`icon-button notification-button${notificationsOpen ? ' icon-button--active' : ''}`} onClick={() => setNotificationsOpen((value) => !value)} aria-label="Уведомления"><Icon name="bell" size={18} /><i /></button>
          {notificationsOpen && <div className="notification-popover"><div className="popover-heading"><b>Уведомления</b><span>2 новых</span></div><div className="notification-item"><span className="notification-marker notification-marker--blue" /><span><b>Справочник обновлён</b><small>В демонстрационные материалы добавлены новые разделы.</small><time>Сегодня, 10:30</time></span></div><div className="notification-item"><span className="notification-marker notification-marker--violet" /><span><b>Добро пожаловать</b><small>Вы вошли в демонстрационный портал.</small><time>Только что</time></span></div></div>}
        </div>
        <div className="topbar-divider" />
        <div className="topbar-user"><span className="profile-avatar profile-avatar--small">S</span><span><b>{displayName}</b><small>Модератор</small></span></div>
      </div>
      {searchOpen && <button className="popover-dismiss" aria-label="Закрыть поиск" onClick={() => setSearchOpen(false)} />}
      {notificationsOpen && <button className="notification-dismiss" aria-label="Закрыть уведомления" onClick={() => setNotificationsOpen(false)} />}
    </header>
  );
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-title__description">{description}</p></div>{action && <div className="page-title__action">{action}</div>}</div>;
}

function MetricCard({ icon, label, value, note, trend, tone }: { icon: IconName; label: string; value: string; note: string; trend: string; tone: string }) {
  return <article className="metric-card"><div className="metric-card__top"><span>{label}</span><span className={`metric-icon metric-icon--${tone}`}><Icon name={icon} size={17} /></span></div><div className="metric-card__value">{value}</div><div className="metric-card__bottom"><span className="metric-trend">{trend}</span><span>{note}</span></div></article>;
}

function OverviewPage({ session, onNavigate }: { session: DemoSession; onNavigate: (page: PortalPage) => void }) {
  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-banner__content">
          <span className="welcome-tag"><Icon name="spark" size={14} /> STAFF WORKSPACE</span>
          <h1>Добро пожаловать,<br /><span>{session.displayName}.</span></h1>
          <p>Здесь собраны основные материалы и инструменты для повседневной работы команды. Все данные на странице демонстрационные.</p>
          <button className="button button--light" onClick={() => onNavigate('guide')}>Ознакомиться с порталом <Icon name="arrow" size={16} /></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-art__ring welcome-art__ring--outer" />
          <div className="welcome-art__ring welcome-art__ring--inner" />
          <div className="welcome-art__core"><BrandMark /></div>
          <span className="welcome-art__spark welcome-art__spark--one">✳</span>
          <span className="welcome-art__spark welcome-art__spark--two">✦</span>
          <span className="welcome-art__orbit-dot" />
        </div>
        <div className="welcome-banner__foot"><span><i className="status-dot" /> DEMO PROFILE</span><span>РОЛЬ: {session.role.toUpperCase()}</span></div>
      </div>

      <div className="section-heading"><div><p className="eyebrow">WORKSPACE OVERVIEW</p><h2>Сводка</h2></div><span className="demo-data-caption">ПРИМЕР ДАННЫХ</span></div>
      <div className="metrics-grid">
        <MetricCard icon="users" label="Состав команды" value="18" note="пример записей" trend="+2" tone="blue" />
        <MetricCard icon="check" label="Активные сотрудники" value="07" note="демо-статус" trend="В сети" tone="green" />
        <MetricCard icon="message" label="Открытые обращения" value="04" note="пример очереди" trend="−2" tone="violet" />
        <MetricCard icon="clock" label="Среднее время ответа" value="12 мин" note="условный показатель" trend="−8%" tone="amber" />
      </div>

      <div className="dashboard-grid">
        <section className="panel announcements-panel">
          <div className="panel-heading"><div><p className="eyebrow">ОБНОВЛЕНИЯ</p><h2>Объявления</h2></div><button className="text-link" onClick={() => onNavigate('guide')}>Все материалы <Icon name="arrow" size={14} /></button></div>
          <div className="announcement-list">{announcements.map((item) => <article className="announcement" key={item.title}><div className={`announcement-marker announcement-marker--${item.tone}`} /><div className="announcement__content"><div className="announcement__meta"><span className={`pill pill--${item.tone}`}>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.body}</p></div><Icon name="chevron" size={17} /></article>)}</div>
        </section>

        <section className="panel status-panel">
          <div className="panel-heading"><div><p className="eyebrow">СОСТОЯНИЕ</p><h2>Среда портала</h2></div><span className="status-label"><i className="status-dot status-dot--muted" /> DEMO</span></div>
          <div className="system-status"><span className="system-status__icon"><Icon name="check" size={19} /></span><span><b>Интерфейс активен</b><small>Локальная демонстрация работает</small></span><span className="system-status__state">OK</span></div>
          <div className="status-rows"><div><span>Подключение к API</span><b className="state-off">Не настроено</b></div><div><span>Хранение данных</span><b>Локально</b></div><div><span>Авторизация</span><b>Имитация</b></div></div>
          <p className="status-note"><Icon name="info" size={14} /> Серверная часть пока не подключена. Статусы приведены для примера.</p>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading"><div><p className="eyebrow">ПОСЛЕДНИЕ СОБЫТИЯ</p><h2>Активность команды</h2></div><span className="subtle-meta">Недавнее</span></div>
          <div className="activity-list">{activity.map((item) => <div className="activity-item" key={`${item.initials}-${item.time}`}><span className={`activity-avatar activity-avatar--${item.color}`}>{item.initials}</span><span className="activity-item__text"><b>{item.name}</b><span>{item.action}</span></span><time>{item.time}</time></div>)}</div>
          <p className="activity-footnote">События сгенерированы для демонстрации интерфейса.</p>
        </section>

        <section className="panel shortcuts-panel">
          <div className="panel-heading"><div><p className="eyebrow">БЫСТРЫЙ ДОСТУП</p><h2>Материалы</h2></div></div>
          <button className="shortcut-row" onClick={() => onNavigate('team')}><span className="shortcut-icon shortcut-icon--blue"><Icon name="users" size={17} /></span><span><b>Структура команды</b><small>Роли и ответственность</small></span><Icon name="arrow" size={15} /></button>
          <button className="shortcut-row" onClick={() => onNavigate('guide')}><span className="shortcut-icon shortcut-icon--violet"><Icon name="book" size={17} /></span><span><b>Справочник</b><small>Инструкции и материалы</small></span><Icon name="arrow" size={15} /></button>
          <button className="shortcut-row" onClick={() => onNavigate('rules')}><span className="shortcut-icon shortcut-icon--green"><Icon name="shield" size={17} /></span><span><b>Правила команды</b><small>Стандарты работы</small></span><Icon name="arrow" size={15} /></button>
        </section>
      </div>
    </>
  );
}

function TeamPage() {
  return (
    <>
      <PageTitle eyebrow="WORKSPACE / TEAM" title="Структура команды" description="Пример иерархии и распределения обязанностей для условного Discord-сервера." />
      <div className="info-strip"><span className="info-strip__icon"><Icon name="info" size={17} /></span><p>Названия ролей, уровни доступа и обязанности ниже — демонстрационный шаблон. Их можно адаптировать под структуру конкретного сообщества.</p></div>
      <div className="team-toolbar"><div><b>Роли и направления</b><span>6 позиций в примере</span></div><span className="demo-data-caption">SAMPLE STRUCTURE</span></div>
      <div className="roles-grid">{roles.map((role) => <article className="role-card" key={role.level}><div className="role-card__head"><span className="role-level">{role.level}</span><span className={`role-label role-label--${role.tone}`}>{role.label}</span></div><h2>{role.name}</h2><p className="role-card__english">{role.english}</p><p className="role-card__description">{role.description}</p><div className="role-card__divider" /><p className="role-card__list-title">ОСНОВНЫЕ ЗАДАЧИ</p><ul>{role.responsibilities.map((item) => <li key={item}><Icon name="check" size={14} />{item}</li>)}</ul></article>)}</div>
    </>
  );
}

function GuidePage() {
  const [completed, setCompleted] = useState<number[]>([]);
  const guideSteps = [
    { title: 'Изучите правила команды', text: 'Ознакомьтесь с рабочими стандартами, принципами общения и правилами конфиденциальности.', page: 'rules' as PortalPage, action: 'Перейти к правилам' },
    { title: 'Разберитесь в структуре ролей', text: 'Проверьте, кто отвечает за разные направления и к кому обращаться по конкретным вопросам.', page: 'team' as PortalPage, action: 'Посмотреть роли' },
    { title: 'Уточните свои обязанности', text: 'Согласуйте с ответственным сотрудником задачи, границы полномочий и формат отчётности.', page: 'team' as PortalPage, action: 'Открыть структуру' },
    { title: 'Познакомьтесь с процессами', text: 'Используйте рабочие каналы по назначению и передавайте сложные случаи по установленному порядку.', page: 'rules' as PortalPage, action: 'Открыть материалы' },
  ];
  return (
    <>
      <PageTitle eyebrow="KNOWLEDGE BASE / GUIDE" title="Справочник сотрудника" description="Базовые материалы, которые помогут сориентироваться в работе команды и внутренних процессах." />
      <div className="guide-layout">
        <section className="panel guide-main-panel"><div className="panel-heading"><div><p className="eyebrow">БЫСТРЫЙ СТАРТ</p><h2>Первые шаги</h2></div><span className="guide-count">{completed.length} / {guideSteps.length}</span></div><div className="guide-progress"><span style={{ width: `${completed.length / guideSteps.length * 100}%` }} /></div><div className="guide-steps">{guideSteps.map((step, index) => { const isDone = completed.includes(index); return <article className={`guide-step${isDone ? ' guide-step--done' : ''}`} key={step.title}><button className="guide-step__check" aria-label={isDone ? 'Отметить как невыполненное' : 'Отметить как выполненное'} onClick={() => setCompleted((current) => isDone ? current.filter((item) => item !== index) : [...current, index])}>{isDone && <Icon name="check" size={15} />}</button><div className="guide-step__body"><div className="guide-step__meta"><span>ШАГ {String(index + 1).padStart(2, '0')}</span>{isDone && <span className="completed-label">ВЫПОЛНЕНО</span>}</div><h3>{step.title}</h3><p>{step.text}</p><button className="text-link" onClick={() => { window.location.hash = `/${step.page}`; }}>{step.action} <Icon name="arrow" size={14} /></button></div></article>; })}</div></section>
        <aside className="guide-aside"><div className="guide-aside__hero"><span className="guide-aside__icon"><Icon name="book" size={22} /></span><p className="eyebrow">KNOWLEDGE BASE</p><h2>Всё важное<br />в одном месте.</h2><p>Демонстрационный набор документов для организации работы команды.</p><span className="guide-aside__decor">S</span></div><div className="panel guide-faq"><div className="panel-heading"><div><p className="eyebrow">FAQ</p><h2>Частые вопросы</h2></div></div><details><summary>К кому обращаться с вопросом?</summary><p>Начните с руководителя направления или старшего сотрудника, отвечающего за нужную тему.</p></details><details><summary>Что делать, если задача непонятна?</summary><p>Запросите уточнение, ожидаемый результат и срок выполнения до начала работы.</p></details><details><summary>Можно ли менять правила?</summary><p>Предложения можно передавать ответственным за документацию. Изменения должны быть согласованы.</p></details></div></aside>
      </div>
    </>
  );
}

function RulesPage() {
  return (
    <>
      <PageTitle eyebrow="KNOWLEDGE BASE / POLICY" title="Правила команды" description="Пример внутренних стандартов поведения, коммуникации и работы с информацией." />
      <div className="rules-intro"><div className="rules-intro__icon"><Icon name="shield" size={24} /></div><div><b>Общие принципы</b><p>Этот документ — редактируемый пример для шаблона портала, а не официальные правила Discord или какого-либо сервера.</p></div><span className="demo-data-caption">TEMPLATE</span></div>
      <div className="rules-list">{rules.map((rule) => <article className="rule-card" key={rule.number}><span className="rule-card__number">{rule.number}</span><div className="rule-card__body"><h2>{rule.title}</h2><p>{rule.description}</p><ul>{rule.points.map((point) => <li key={point}><span className="rule-bullet" />{point}</li>)}</ul></div></article>)}</div>
      <div className="rules-note"><Icon name="info" size={16} /><p>Перед использованием шаблона замените примерные положения на собственные правила сообщества и согласуйте их с ответственными лицами.</p></div>
    </>
  );
}

function PortalFooter() {
  return <footer className="portal-footer"><span>STAFF PORTAL <span className="muted-dot">·</span> CONCEPT TEMPLATE</span><p>Не аффилирован с Discord Inc., не поддерживается и не одобряется ею. Независимый концепт веб-портала для условной команды Discord-сервера. Discord является товарным знаком Discord Inc.</p></footer>;
}

function PortalLayout({ session, page, onNavigate, onLogout }: { session: DemoSession; page: PortalPage; onNavigate: (page: PortalPage) => void; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = navigation.find((item) => item.id === page)?.label ?? 'Обзор';
  const navigate = (nextPage: PortalPage) => {
    navigateTo(nextPage, onNavigate);
    setMobileOpen(false);
  };

  return (
    <div className="portal-shell">
      <Sidebar active={page} onNavigate={navigate} onLogout={onLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} displayName={session.displayName} />
      <div className="portal-main"><Header title={title} onNavigate={navigate} onMenu={() => setMobileOpen(true)} displayName={session.displayName} /><main className="content-area">{page === 'overview' && <OverviewPage session={session} onNavigate={navigate} />}{page === 'team' && <TeamPage />}{page === 'guide' && <GuidePage />}{page === 'rules' && <RulesPage />}<PortalFooter /></main></div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<DemoSession | null>(readSession);
  const [page, setPage] = useState<PortalPage>(pageFromHash);

  useEffect(() => {
    const syncPage = () => setPage(pageFromHash());
    window.addEventListener('hashchange', syncPage);
    if (!window.location.hash) window.location.hash = '/overview';
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const completeLogin = (nextSession: DemoSession) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession)); } catch { /* Storage is optional in demo mode. */ }
    setSession(nextSession);
    navigateTo('overview', setPage);
  };

  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is optional in demo mode. */ }
    setSession(null);
    setPage('overview');
  };

  return session
    ? <PortalLayout session={session} page={page} onNavigate={setPage} onLogout={logout} />
    : <LoginScreen onComplete={completeLogin} />;
}
