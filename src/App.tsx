import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DemoSession, PortalPage } from './data';
import { activity, announcements, navigation, roles, rules, searchItems } from './data';

const SESSION_KEY = 'staff_portal_demo_session_v2';
const DISCORD_LOGO = 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d74e9607e61eeec9c91b_Logo.svg';
const DISCORD_SYMBOL = 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d7f4ef6498ac018f2c55_Symbol.svg';

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

type IconName =
  | 'overview' | 'users' | 'book' | 'shield' | 'search' | 'bell' | 'chevron' | 'arrow'
  | 'logout' | 'check' | 'clock' | 'message' | 'chart' | 'spark' | 'external' | 'close'
  | 'menu' | 'file' | 'lock' | 'help' | 'calendar' | 'info' | 'more' | 'activity'
  | 'ticket' | 'settings' | 'command' | 'plus' | 'dot';

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.7"/><rect x="13.5" y="3.5" width="7" height="4" rx="1.7"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.7"/></>,
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
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    ticket: <><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z"/><path d="M13 6v2M13 11v2M13 16v2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z"/></>,
    command: <><path d="M9 8V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V8Z"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    dot: <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>,
  };

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function DiscordBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`discord-brand${compact ? ' discord-brand--compact' : ''}`}>
      <img src={DISCORD_LOGO} alt="Discord" />
      {!compact && <span className="discord-brand__divider" />}
      {!compact && <span className="discord-brand__descriptor">STAFF PORTAL</span>}
    </span>
  );
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
      await pause(320);
      for (let index = 1; index <= generatedLogin.length; index += 1) {
        if (cancelled) return;
        setLogin(generatedLogin.slice(0, index));
        await pause(48);
      }
      await pause(160);
      for (let index = 1; index <= 14; index += 1) {
        if (cancelled) return;
        setPasswordLength(index);
        await pause(32);
      }
      if (cancelled) return;
      setStatus('Демонстрационный доступ подтверждён');
      setIsReady(true);
      await pause(650);
      if (!cancelled) finish();
    };
    void run();
    return () => { cancelled = true; };
  }, [generatedLogin]);

  const progress = Math.min(100, Math.round((login.length / generatedLogin.length * 55) + (passwordLength / 14 * 45)));

  return (
    <main className="login-screen">
      <div className="login-noise" aria-hidden="true" />
      <div className="login-grid-glow login-grid-glow--one" aria-hidden="true" />
      <div className="login-grid-glow login-grid-glow--two" aria-hidden="true" />
      <header className="login-header">
        <DiscordBrand />
        <div className="login-header__right"><span className="environment-indicator"><i /> DEMO ENVIRONMENT</span><span className="login-header__version">INDEPENDENT CONCEPT / 01</span></div>
      </header>

      <div className="login-content">
        <section className="login-story">
          <p className="micro-label"><span className="micro-label__line" /> COMMUNITY OPERATIONS / 2026</p>
          <h1>Good people.<br /><em>Better</em> communities.</h1>
          <p className="login-story__copy">Рабочее пространство команды Discord-сервера. Материалы, внутренняя документация и инструменты — в одном месте.</p>
          <div className="login-story__bottom">
            <div className="login-orbit" aria-hidden="true">
              <div className="login-orbit__ring login-orbit__ring--outer" />
              <div className="login-orbit__ring login-orbit__ring--middle" />
              <div className="login-orbit__ring login-orbit__ring--inner" />
              <img src={DISCORD_SYMBOL} alt="" />
              <span className="login-orbit__node login-orbit__node--one" />
              <span className="login-orbit__node login-orbit__node--two" />
            </div>
            <div className="login-feature-note"><span>01 / 03</span><b>One space for the people<br />behind the community.</b><small>TEAM · KNOWLEDGE · STANDARDS</small></div>
          </div>
        </section>

        <section className="login-panel" aria-label="Демонстрационный вход">
          <div className="login-panel__top"><span className="login-panel__mark"><Icon name="lock" size={18} /></span><span className="login-panel__status"><i /> LOCAL PREVIEW</span></div>
          <p className="micro-label">STAFF ACCESS / 001</p>
          <h2>Вход в<br />рабочее пространство.</h2>
          <p className="login-panel__copy">Показываем пример входа. Тестовые данные вводятся автоматически — реальная учётная запись не требуется.</p>

          <div className="login-fields">
            <label className="login-field"><span>USERNAME</span><span className="login-input"><span>{login || ' '}</span><i className={!login ? 'is-caret' : ''} /></span></label>
            <label className="login-field"><span>PASSWORD</span><span className="login-input login-input--password"><span>{'•'.repeat(passwordLength)}</span><i className={passwordLength === 0 ? 'is-caret' : ''} /></span></label>
          </div>
          <div className="login-progress-label"><span>{status}</span><b>{progress}%</b></div>
          <div className="login-progress"><span style={{ width: `${isReady ? 100 : progress}%` }} /></div>
          <button className="button button--primary login-submit" type="button" onClick={finish} disabled={!isReady}>Открыть портал <Icon name="arrow" size={16} /></button>
          <p className="login-panel__fineprint"><Icon name="info" size={14} /> Локальная демонстрация. Данные не отправляются и не проверяются на сервере.</p>
        </section>
      </div>

      <footer className="login-footer"><span>DISCORD STAFF PORTAL <i>—</i> CONCEPT TEMPLATE</span><span>НЕОФИЦИАЛЬНЫЙ ПРОЕКТ <i>·</i> НЕ АФФИЛИРОВАН С DISCORD INC.</span></footer>
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
  const icons: Record<PortalPage, IconName> = { overview: 'overview', team: 'users', guide: 'book', rules: 'shield' };

  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Закрыть меню" onClick={onClose} />}
      <aside className={`portal-sidebar${mobileOpen ? ' portal-sidebar--open' : ''}`}>
        <div className="sidebar-top">
          <a className="sidebar-brand" href="#/overview" onClick={(event) => { event.preventDefault(); onNavigate('overview'); }} aria-label="На главную">
            <img src={DISCORD_SYMBOL} alt="Discord" />
            <span><b>STAFF</b><small>PORTAL / CONCEPT</small></span>
          </a>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Закрыть меню"><Icon name="close" /></button>
        </div>

        <div className="server-context">
          <span className="server-context__icon"><img src={DISCORD_SYMBOL} alt="" /></span>
          <span className="server-context__text"><b>Discord</b><small>Community workspace</small></span>
          <Icon name="chevron" size={15} />
        </div>

        <nav className="side-navigation" aria-label="Основная навигация">
          {groups.map((group, index) => (
            <div className="nav-group" key={group}>
              <p className="nav-group__label">{index === 0 ? 'WORKSPACE' : 'RESOURCES'}</p>
              {navigation.filter((item) => item.section === group).map((item) => (
                <button key={item.id} className={`nav-link${active === item.id ? ' nav-link--active' : ''}`} onClick={() => onNavigate(item.id)}>
                  <Icon name={icons[item.id]} size={17} />
                  <span>{item.label}</span>
                  {item.id === 'rules' && <span className="nav-link__count">06</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="sidebar-note__symbol"><Icon name="help" size={17} /></span>
          <div><b>Нужна помощь?</b><p>Начните со справочника и базовых инструкций.</p><button onClick={() => onNavigate('guide')}>Открыть справочник <Icon name="arrow" size={13} /></button></div>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="profile-avatar">{displayName.slice(-2, -1) || 'S'}</span>
            <span className="sidebar-profile__copy"><b>{displayName}</b><small>Модератор / DEMO</small></span>
            <button className="icon-button sidebar-logout" aria-label="Выйти из портала" onClick={onLogout}><Icon name="logout" size={17} /></button>
          </div>
          <div className="sidebar-build"><span><i /> PREVIEW MODE</span><span>v2.1</span></div>
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
        document.getElementById('portal-search')?.focus();
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const chooseResult = (page: PortalPage) => {
    onNavigate(page);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="portal-header">
      <div className="portal-header__left">
        <button className="icon-button mobile-menu-button" aria-label="Открыть меню" onClick={onMenu}><Icon name="menu" /></button>
        <div className="breadcrumbs"><span>Discord</span><Icon name="chevron" size={14} /><strong>{title}</strong></div>
      </div>
      <div className="portal-header__right">
        <div className={`global-search${searchOpen ? ' global-search--open' : ''}`}>
          <Icon name="search" size={16} />
          <input id="portal-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); if (event.key === 'Enter' && results[0]) chooseResult(results[0].page); }} placeholder="Поиск по порталу" aria-label="Поиск по порталу" />
          <kbd>⌘ K</kbd>
          {searchOpen && query.trim() && <div className="search-results"><p className="dropdown-label">РЕЗУЛЬТАТЫ ПОИСКА</p>{results.length ? results.map((item) => <button key={item.title} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseResult(item.page)}><span className="search-result-icon"><Icon name="file" size={15} /></span><span><b>{item.title}</b><small>{item.description}</small></span><Icon name="arrow" size={14} /></button>) : <p className="search-empty">Ничего не найдено</p>}</div>}
        </div>
        <div className="header-action-wrap">
          <button className={`icon-button notification-button${notificationsOpen ? ' icon-button--active' : ''}`} onClick={() => setNotificationsOpen((value) => !value)} aria-label="Уведомления"><Icon name="bell" size={18} /><i /></button>
          {notificationsOpen && <div className="notification-popover"><div className="popover-heading"><b>Уведомления</b><span>02 новых</span></div><div className="notification-item"><span className="notification-marker notification-marker--blue" /><span><b>Справочник обновлён</b><small>В материалы добавлены новые разделы.</small><time>Сегодня, 10:30</time></span></div><div className="notification-item"><span className="notification-marker notification-marker--violet" /><span><b>Добро пожаловать</b><small>Вы вошли в демонстрационный портал.</small><time>Только что</time></span></div></div>}
        </div>
        <span className="header-divider" />
        <div className="header-user"><span className="profile-avatar profile-avatar--small">{displayName.slice(-2, -1) || 'S'}</span><span><b>{displayName}</b><small>Модератор</small></span><Icon name="chevron" size={14} /></div>
      </div>
      {searchOpen && <button className="popover-dismiss" aria-label="Закрыть поиск" onClick={() => setSearchOpen(false)} />}
      {notificationsOpen && <button className="notification-dismiss" aria-label="Закрыть уведомления" onClick={() => setNotificationsOpen(false)} />}
    </header>
  );
}

function PageHeading({ eyebrow, title, description, aside }: { eyebrow: string; title: ReactNode; description: string; aside?: ReactNode }) {
  return <div className="page-heading"><div><p className="micro-label"><span className="micro-label__line" /> {eyebrow}</p><h1>{title}</h1><p className="page-heading__description">{description}</p></div>{aside && <div className="page-heading__aside">{aside}</div>}</div>;
}

function Stat({ value, label, note, accent }: { value: string; label: string; note: string; accent: string }) {
  return <div className={`stat stat--${accent}`}><div className="stat__value">{value}</div><div className="stat__label">{label}</div><div className="stat__note">{note}</div></div>;
}

function OverviewPage({ session, onNavigate }: { session: DemoSession; onNavigate: (page: PortalPage) => void }) {
  const today = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="page page--overview">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <p className="micro-label"><span className="micro-label__line" /> STAFF OPERATIONS / OVERVIEW</p>
          <p className="dashboard-hero__date">{today}</p>
          <h1>Всё для команды.<br /><span>В одном пространстве.</span></h1>
          <p className="dashboard-hero__description">Привет, {session.displayName}. Здесь собраны материалы и инструменты для повседневной работы сообщества.</p>
          <div className="dashboard-hero__actions"><button className="button button--primary" onClick={() => onNavigate('guide')}>Начать с инструкций <Icon name="arrow" size={16} /></button><button className="button button--quiet" onClick={() => onNavigate('team')}>Структура команды</button></div>
          <div className="dashboard-hero__meta"><span><i /> DEMO WORKSPACE</span><span>ROLE / {session.role.toUpperCase()}</span></div>
        </div>
        <div className="dashboard-hero__art" aria-hidden="true">
          <div className="hero-art__caption hero-art__caption--top">COMMUNITY / OPERATIONS</div>
          <div className="hero-art__orbit hero-art__orbit--one" />
          <div className="hero-art__orbit hero-art__orbit--two" />
          <div className="hero-art__orbit hero-art__orbit--three" />
          <div className="hero-art__core"><img src={DISCORD_SYMBOL} alt="" /></div>
          <span className="hero-art__node hero-art__node--one" />
          <span className="hero-art__node hero-art__node--two" />
          <span className="hero-art__node hero-art__node--three" />
          <div className="hero-art__caption hero-art__caption--bottom"><span>01</span><span>PEOPLE MAKE THE COMMUNITY</span></div>
        </div>
        <span className="dashboard-hero__index">01 <i>—</i> 04</span>
      </section>

      <div className="section-intro"><div><p className="micro-label">AT A GLANCE</p><h2>Состояние команды</h2></div><span className="sample-label">ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ</span></div>
      <section className="stats-row" aria-label="Демонстрационная статистика">
        <Stat value="18" label="Сотрудников" note="пример состава" accent="violet" />
        <Stat value="07" label="На связи" note="демо-статус" accent="blue" />
        <Stat value="04" label="Обращения" note="пример очереди" accent="coral" />
        <Stat value="12m" label="Время ответа" note="условный показатель" accent="mint" />
      </section>

      <div className="overview-grid">
        <section className="content-block announcements-block">
          <div className="block-heading"><div><p className="micro-label">LATEST UPDATES / 01</p><h2>Объявления</h2></div><button className="inline-link" onClick={() => onNavigate('guide')}>Все материалы <Icon name="arrow" size={14} /></button></div>
          <div className="announcement-list">{announcements.map((item, index) => <article className="announcement-row" key={item.title}><span className="announcement-row__index">0{index + 1}</span><div className="announcement-row__main"><div className="announcement-row__meta"><span className={`announcement-category announcement-category--${item.tone}`}>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.body}</p></div><button className="row-arrow" aria-label={`Открыть: ${item.title}`} onClick={() => onNavigate('guide')}><Icon name="arrow" size={16} /></button></article>)}</div>
        </section>

        <aside className="overview-side">
          <section className="team-pulse">
            <div className="block-heading block-heading--compact"><div><p className="micro-label">TEAM PULSE / 02</p><h2>Команда</h2></div><span className="pulse-live"><i /> LIVE DEMO</span></div>
            <div className="team-pulse__numbers"><strong>07<span>/18</span></strong><p>сотрудников<br />отмечены онлайн</p></div>
            <div className="avatar-stack"><span className="mini-avatar mini-avatar--one">MK</span><span className="mini-avatar mini-avatar--two">AN</span><span className="mini-avatar mini-avatar--three">ST</span><span className="mini-avatar mini-avatar--four">+4</span><span className="avatar-stack__caption">7 на связи</span></div>
            <div className="pulse-bar"><span /></div>
            <button className="inline-link" onClick={() => onNavigate('team')}>Состав команды <Icon name="arrow" size={14} /></button>
          </section>

          <section className="quick-access">
            <div className="block-heading block-heading--compact"><div><p className="micro-label">QUICK ACCESS / 03</p><h2>Быстрый доступ</h2></div></div>
            <button className="quick-link" onClick={() => onNavigate('team')}><span className="quick-link__icon quick-link__icon--blue"><Icon name="users" size={17} /></span><span><b>Команда</b><small>Роли и обязанности</small></span><Icon name="chevron" size={16} /></button>
            <button className="quick-link" onClick={() => onNavigate('guide')}><span className="quick-link__icon quick-link__icon--violet"><Icon name="book" size={17} /></span><span><b>Справочник</b><small>Инструкции и FAQ</small></span><Icon name="chevron" size={16} /></button>
            <button className="quick-link" onClick={() => onNavigate('rules')}><span className="quick-link__icon quick-link__icon--coral"><Icon name="shield" size={17} /></span><span><b>Правила</b><small>Стандарты команды</small></span><Icon name="chevron" size={16} /></button>
          </section>
        </aside>

        <section className="content-block activity-block">
          <div className="block-heading"><div><p className="micro-label">RECENT ACTIVITY / 04</p><h2>Последние события</h2></div><span className="sample-label">SAMPLE FEED</span></div>
          <div className="activity-feed">{activity.map((item) => <div className="activity-row" key={`${item.initials}-${item.time}`}><span className={`activity-avatar activity-avatar--${item.color}`}>{item.initials}</span><div className="activity-row__body"><b>{item.name}</b><span>{item.action}</span></div><time>{item.time}</time></div>)}</div>
          <p className="activity-disclaimer"><Icon name="info" size={13} /> События и профили приведены исключительно для демонстрации интерфейса.</p>
        </section>

        <section className="portal-state">
          <div className="portal-state__top"><span className="portal-state__icon"><Icon name="activity" size={18} /></span><span className="pulse-live"><i /> LOCAL</span></div>
          <p className="micro-label">SYSTEM STATUS</p>
          <h2>Портал<br /><span>активен.</span></h2>
          <p className="portal-state__copy">Интерфейс работает локально. Серверная часть пока не подключена.</p>
          <div className="portal-state__rows"><div><span>API</span><b>Не настроено</b></div><div><span>Хранение</span><b>Локально</b></div><div><span>Авторизация</span><b>Имитация</b></div></div>
          <span className="portal-state__watermark">D</span>
        </section>
      </div>
    </div>
  );
}

function TeamPage() {
  return (
    <div className="page">
      <PageHeading eyebrow="PEOPLE / TEAM DIRECTORY" title={<>Команда, которая<br />держит всё вместе.</>} description="Пример структуры сотрудников, ролей и зон ответственности условного Discord-сервера." aside={<span className="heading-index">02 <i>/</i> 04</span>} />
      <div className="page-callout"><span className="page-callout__symbol"><Icon name="info" size={17} /></span><p>Названия ролей, уровни доступа и обязанности — демонстрационный шаблон. Измените их под процессы конкретного сообщества.</p><span className="sample-label">SAMPLE DATA</span></div>
      <div className="team-summary"><div><p className="micro-label">ORGANISATION / 01</p><h2>Роли и направления</h2></div><span>06 POSITION TYPES <i>·</i> TEMPLATE</span></div>
      <div className="role-list">{roles.map((role) => <article className="role-row" key={role.level}><span className="role-row__number">{role.level}</span><div className="role-row__title"><h3>{role.name}</h3><span>{role.english}</span></div><div className="role-row__description"><p>{role.description}</p><ul>{role.responsibilities.map((item) => <li key={item}><Icon name="check" size={13} />{item}</li>)}</ul></div><span className={`role-tag role-tag--${role.tone}`}>{role.label}</span></article>)}</div>
      <div className="team-bottom-note"><span className="team-bottom-note__line" /><p>Хорошая структура не усложняет работу. Она помогает каждому понимать свою роль.</p></div>
    </div>
  );
}

function GuidePage({ onNavigate }: { onNavigate: (page: PortalPage) => void }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const guideSteps = [
    { title: 'Изучите правила команды', text: 'Прочитайте стандарты общения, правила конфиденциальности и порядок работы с обращениями.', page: 'rules' as PortalPage, action: 'Перейти к правилам' },
    { title: 'Разберитесь в структуре ролей', text: 'Посмотрите, кто отвечает за разные направления и к кому обращаться по конкретным вопросам.', page: 'team' as PortalPage, action: 'Посмотреть роли' },
    { title: 'Уточните свои обязанности', text: 'Согласуйте задачи, границы полномочий и формат отчётности с ответственным сотрудником.', page: 'team' as PortalPage, action: 'Открыть структуру' },
    { title: 'Познакомьтесь с процессами', text: 'Используйте рабочие каналы по назначению и передавайте сложные случаи по установленному порядку.', page: 'rules' as PortalPage, action: 'Открыть материалы' },
  ];

  return (
    <div className="page">
      <PageHeading eyebrow="KNOWLEDGE / HANDBOOK" title={<>Сначала — разобраться.<br />Затем — действовать.</>} description="Короткий маршрут для новых сотрудников и справочная информация по основным процессам команды." aside={<span className="heading-index">03 <i>/</i> 04</span>} />
      <div className="handbook-layout">
        <section className="handbook-main">
          <div className="handbook-main__top"><div><p className="micro-label">ONBOARDING / CHECKLIST</p><h2>Первые шаги</h2></div><div className="checklist-count"><strong>{String(completed.length).padStart(2, '0')}</strong><span>/ 04<br />DONE</span></div></div>
          <div className="checklist-progress"><span style={{ width: `${completed.length / guideSteps.length * 100}%` }} /></div>
          <div className="guide-steps">{guideSteps.map((step, index) => { const isDone = completed.includes(index); return <article className={`guide-step${isDone ? ' guide-step--done' : ''}`} key={step.title}><button className="guide-step__check" aria-label={isDone ? 'Отметить как невыполненное' : 'Отметить как выполненное'} onClick={() => setCompleted((current) => isDone ? current.filter((item) => item !== index) : [...current, index])}>{isDone && <Icon name="check" size={15} />}</button><div className="guide-step__body"><div className="guide-step__meta"><span>STEP / {String(index + 1).padStart(2, '0')}</span>{isDone && <span className="completed-label">COMPLETED</span>}</div><h3>{step.title}</h3><p>{step.text}</p><button className="inline-link" onClick={() => onNavigate(step.page)}>{step.action} <Icon name="arrow" size={14} /></button></div></article>; })}</div>
        </section>

        <aside className="handbook-side">
          <div className="handbook-feature"><span className="handbook-feature__top">FIELD NOTES <i>01—04</i></span><div className="handbook-feature__symbol"><img src={DISCORD_SYMBOL} alt="" /></div><p className="micro-label">KNOWLEDGE BASE</p><h2>Всё важное.<br /><em>По полочкам.</em></h2><p>Демонстрационный набор документов для организации работы команды.</p><span className="handbook-feature__bottom">STAFF / HANDBOOK</span></div>
          <div className="faq-panel"><div className="block-heading block-heading--compact"><div><p className="micro-label">COMMON QUESTIONS</p><h2>Частые вопросы</h2></div></div><details><summary>К кому обращаться с вопросом?</summary><p>Начните с руководителя направления или старшего сотрудника, отвечающего за нужную тему.</p></details><details><summary>Что делать, если задача непонятна?</summary><p>Запросите уточнение, ожидаемый результат и срок выполнения до начала работы.</p></details><details><summary>Можно ли менять правила?</summary><p>Предложения можно передавать ответственным за документацию. Изменения должны быть согласованы.</p></details></div>
        </aside>
      </div>
    </div>
  );
}

function RulesPage() {
  return (
    <div className="page">
      <PageHeading eyebrow="POLICY / INTERNAL STANDARDS" title={<>Общие правила.<br />Понятные принципы.</>} description="Пример внутренних стандартов поведения, коммуникации и работы с информацией." aside={<span className="heading-index">04 <i>/</i> 04</span>} />
      <div className="rules-banner"><div className="rules-banner__icon"><Icon name="shield" size={24} /></div><div><p className="micro-label">THE BASELINE</p><h2>Уважение. Последовательность. Ответственность.</h2><p>Этот документ — редактируемый пример для шаблона портала, а не официальные правила Discord или какого-либо сервера.</p></div><span className="sample-label">TEMPLATE</span></div>
      <div className="rules-list">{rules.map((rule) => <article className="rule-row" key={rule.number}><span className="rule-row__number">{rule.number}</span><div className="rule-row__main"><h2>{rule.title}</h2><p>{rule.description}</p></div><ul>{rule.points.map((point) => <li key={point}><span />{point}</li>)}</ul></article>)}</div>
      <div className="rules-note"><Icon name="info" size={16} /><p>Перед использованием замените примерные положения на собственные правила сообщества и согласуйте их с ответственными лицами.</p></div>
    </div>
  );
}

function PortalFooter() {
  return <footer className="portal-footer"><div><span className="portal-footer__brand">DISCORD STAFF PORTAL <i>—</i> CONCEPT TEMPLATE</span><p>Независимый концепт веб-портала для условной команды Discord-сервера. Не аффилирован с Discord Inc., не поддерживается и не одобряется ею. Discord является товарным знаком Discord Inc.</p></div><a href="https://discord.com/branding" target="_blank" rel="noreferrer">Brand resources <Icon name="external" size={13} /></a></footer>;
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
      <div className="portal-main">
        <Header title={title} onNavigate={navigate} onMenu={() => setMobileOpen(true)} displayName={session.displayName} />
        <main className="content-area">{page === 'overview' && <OverviewPage session={session} onNavigate={navigate} />}{page === 'team' && <TeamPage />}{page === 'guide' && <GuidePage onNavigate={navigate} />}{page === 'rules' && <RulesPage />}<PortalFooter /></main>
      </div>
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

  return session ? <PortalLayout session={session} page={page} onNavigate={setPage} onLogout={logout} /> : <LoginScreen onComplete={completeLogin} />;
}
