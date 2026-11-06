import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DemoSession, PortalPage } from './data';
import { activity, announcements, navigation, roles, rules, searchItems } from './data';

const SESSION_KEY = 'staff_portal_demo_session_v2';
const DISCORD_SYMBOL = 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d7f4ef6498ac018f2c55_Symbol.svg';

function readSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as DemoSession;
    if (!value.login) return null;
    const suffix = value.login.split('_').at(-1) ?? '0000';
    // Normalize sessions created by the previous English-language mockup.
    return { login: value.login, displayName: `Сотрудник ${suffix}`, role: 'Модератор' };
  } catch {
    return null;
  }
}

function makeSession(login: string): DemoSession {
  const suffix = login.split('_').at(-1) ?? '0000';
  return { login, displayName: `Сотрудник ${suffix}`, role: 'Модератор' };
}

function pageFromHash(): PortalPage {
  const value = window.location.hash.replace('#/', '') as PortalPage;
  return navigation.some((item) => item.id === value) ? value : 'overview';
}

function navigateTo(page: PortalPage, setPage: (page: PortalPage) => void) {
  window.location.hash = `/${page}`;
  setPage(page);
}

type IconName = 'overview' | 'users' | 'book' | 'shield' | 'search' | 'bell' | 'chevron' | 'arrow' | 'logout' | 'check' | 'clock' | 'message' | 'chart' | 'spark' | 'external' | 'close' | 'menu' | 'file' | 'lock' | 'help' | 'calendar' | 'info' | 'activity' | 'ticket' | 'plus' | 'dot' | 'pin' | 'command';

function Icon({ name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
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
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    ticket: <><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z"/><path d="M13 6v2M13 11v2M13 16v2"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    dot: <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    command: <><path d="M9 8V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V8Z"/></>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
    <span className="brand-lockup__mark"><img src={DISCORD_SYMBOL} alt="" /></span>
    {!compact && <span className="brand-lockup__words"><b>Discord</b><small>ПОРТАЛ КОМАНДЫ</small></span>}
  </span>;
}

function LoginScreen({ onComplete }: { onComplete: (session: DemoSession) => void }) {
  const [login, setLogin] = useState('');
  const [passwordLength, setPasswordLength] = useState(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Подготавливаем демонстрационный доступ');
  const [generatedLogin] = useState(() => `sotrudnik_${Math.floor(1000 + Math.random() * 9000)}`);
  const completed = useRef(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete(makeSession(generatedLogin));
  };

  useEffect(() => {
    let cancelled = false;
    const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    const run = async () => {
      await pause(250);
      for (let i = 1; i <= generatedLogin.length; i += 1) {
        if (cancelled) return;
        setLogin(generatedLogin.slice(0, i));
        await pause(54);
      }
      await pause(140);
      for (let i = 1; i <= 14; i += 1) {
        if (cancelled) return;
        setPasswordLength(i);
        await pause(31);
      }
      if (cancelled) return;
      setStatus('Доступ подготовлен');
      setReady(true);
      await pause(850);
      if (!cancelled) finish();
    };
    void run();
    return () => { cancelled = true; };
  }, [generatedLogin]);

  const progress = Math.min(100, Math.round((login.length / generatedLogin.length * 55) + (passwordLength / 14 * 45)));

  return <main className="login-screen">
    <div className="login-grain" aria-hidden="true" />
    <header className="login-topbar"><Brand /><span className="demo-pill"><i /> ДЕМОНСТРАЦИОННЫЙ РЕЖИМ</span></header>
    <div className="login-stage">
      <section className="login-intro">
        <p className="eyebrow"><span /> ВНУТРЕННЯЯ СРЕДА СООБЩЕСТВА</p>
        <h1>За каждым<br />сильным <em>сообществом</em><br />стоит команда.</h1>
        <p className="login-intro__text">Рабочее пространство для тех, кто помогает Discord-серверу оставаться местом, куда хочется возвращаться.</p>
        <div className="login-art" aria-hidden="true">
          <div className="login-art__halo login-art__halo--outer" />
          <div className="login-art__halo login-art__halo--middle" />
          <div className="login-art__halo login-art__halo--inner" />
          <div className="login-art__disc"><img src={DISCORD_SYMBOL} alt="" /></div>
          <span className="login-art__orbit-dot login-art__orbit-dot--one" />
          <span className="login-art__orbit-dot login-art__orbit-dot--two" />
          <span className="login-art__orbit-dot login-art__orbit-dot--three" />
          <span className="login-art__annotation login-art__annotation--one">ЛЮДИ</span>
          <span className="login-art__annotation login-art__annotation--two">ПРОЦЕССЫ</span>
          <span className="login-art__annotation login-art__annotation--three">СООБЩЕСТВО</span>
        </div>
        <div className="login-footnote"><span>01 / 04</span><span>КОМАНДА · ЗНАНИЯ · ПРАВИЛА · ПОРЯДОК</span></div>
      </section>
      <section className="login-card" aria-label="Вход в демонстрационный портал">
        <div className="login-card__head"><span className="login-card__icon"><Icon name="lock" size={21} /></span><span className="login-card__number">ДОСТУП / 001</span></div>
        <p className="login-card__overline">РАБОЧЕЕ МЕСТО СОТРУДНИКА</p>
        <h2>Войти<br /><span>в портал.</span></h2>
        <p className="login-card__description">Это интерактивный шаблон. Тестовые данные вводятся автоматически — регистрация и настоящий пароль не нужны.</p>
        <div className="login-fields">
          <label className="login-field"><span>ЛОГИН</span><span className="login-input"><span>{login || ' '}</span><i className={!login ? 'is-caret' : ''} /></span></label>
          <label className="login-field"><span>ПАРОЛЬ</span><span className="login-input"><span>{'•'.repeat(passwordLength)}</span><i className={passwordLength === 0 ? 'is-caret' : ''} /></span></label>
        </div>
        <div className="login-progress-copy"><span>{status}</span><b>{progress}%</b></div>
        <div className="login-progress"><span style={{ width: `${ready ? 100 : progress}%` }} /></div>
        <button className="button button--primary login-button" type="button" disabled={!ready} onClick={finish}>Открыть рабочее пространство <Icon name="arrow" size={19} /></button>
        <p className="login-card__disclaimer"><Icon name="info" size={16} /> Данные остаются в браузере и никуда не отправляются.</p>
      </section>
    </div>
    <footer className="login-footer"><span>НЕЗАВИСИМЫЙ КОНЦЕПТ ВЕБ-ПОРТАЛА</span><span>НЕ АФФИЛИРОВАН С DISCORD INC.</span></footer>
  </main>;
}

function Sidebar({ active, onNavigate, onLogout, mobileOpen, onClose, displayName }: {
  active: PortalPage; onNavigate: (page: PortalPage) => void; onLogout: () => void;
  mobileOpen: boolean; onClose: () => void; displayName: string;
}) {
  const groups = [...new Set(navigation.map((item) => item.section))];
  const icons: Record<PortalPage, IconName> = { overview: 'overview', team: 'users', guide: 'book', rules: 'shield' };
  return <>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Закрыть меню" onClick={onClose} />}
    <aside className={`portal-sidebar${mobileOpen ? ' portal-sidebar--open' : ''}`}>
      <div className="sidebar-brand-row"><Brand /><button className="icon-button sidebar-close" onClick={onClose} aria-label="Закрыть меню"><Icon name="close" /></button></div>
      <div className="server-switcher"><span className="server-switcher__symbol"><img src={DISCORD_SYMBOL} alt="" /></span><span><b>Discord</b><small>Пространство команды</small></span><Icon name="chevron" size={17} /></div>
      <nav className="side-navigation" aria-label="Основная навигация">
        {groups.map((group, index) => <div className="nav-group" key={group}>
          <p className="nav-group__label">{index === 0 ? 'РАБОЧЕЕ МЕСТО' : 'БАЗА ЗНАНИЙ'}</p>
          {navigation.filter((item) => item.section === group).map((item) => <button key={item.id} className={`nav-link${active === item.id ? ' nav-link--active' : ''}`} onClick={() => onNavigate(item.id)}>
            <Icon name={icons[item.id]} size={20} /><span>{item.label}</span>{active === item.id && <i className="nav-link__active-mark" />}
          </button>)}
        </div>)}
      </nav>
      <div className="sidebar-help"><span className="sidebar-help__icon"><Icon name="help" size={20} /></span><div><b>Нужна подсказка?</b><p>Все основные процессы собраны в справочнике.</p><button onClick={() => onNavigate('guide')}>Открыть справочник <Icon name="arrow" size={14} /></button></div></div>
      <div className="sidebar-bottom">
        <div className="sidebar-user"><span className="user-avatar">{displayName.slice(-2, -1) || 'С'}</span><span><b>{displayName}</b><small>{'Модератор · демо'}</small></span><button className="icon-button" onClick={onLogout} aria-label="Выйти"><Icon name="logout" size={18} /></button></div>
        <div className="sidebar-mode"><i /> ДЕМОНСТРАЦИОННАЯ ВЕРСИЯ <span>2.2</span></div>
      </div>
    </aside>
  </>;
}

function Header({ title, onNavigate, onMenu, displayName }: { title: string; onNavigate: (page: PortalPage) => void; onMenu: () => void; displayName: string }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ru');
    if (!normalized) return [];
    return searchItems.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('ru').includes(normalized));
  }, [query]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(true); document.getElementById('portal-search')?.focus();
      }
      if (event.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const chooseResult = (page: PortalPage) => { onNavigate(page); setQuery(''); setSearchOpen(false); };
  return <header className="portal-header">
    <div className="portal-header__start"><button className="icon-button mobile-menu-button" aria-label="Открыть меню" onClick={onMenu}><Icon name="menu" /></button><div className="breadcrumbs"><span>Discord</span><Icon name="chevron" size={15} /><strong>{title}</strong></div></div>
    <div className="portal-header__end">
      <div className={`global-search${searchOpen ? ' global-search--open' : ''}`}><Icon name="search" size={19} /><input id="portal-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); if (event.key === 'Enter' && results[0]) chooseResult(results[0].page); }} placeholder="Найти раздел или правило" aria-label="Поиск по порталу" /><kbd>⌘ K</kbd>
        {searchOpen && query.trim() && <div className="search-results"><p className="dropdown-label">РЕЗУЛЬТАТЫ</p>{results.length ? results.map((item) => <button key={item.title} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseResult(item.page)}><span className="search-result-icon"><Icon name="file" size={17} /></span><span><b>{item.title}</b><small>{item.description}</small></span><Icon name="arrow" size={16} /></button>) : <p className="search-empty">Ничего не найдено. Попробуйте другой запрос.</p>}</div>}
      </div>
      <div className="header-action-wrap"><button className={`icon-button notification-button${notificationsOpen ? ' icon-button--active' : ''}`} onClick={() => setNotificationsOpen((value) => !value)} aria-label="Уведомления"><Icon name="bell" size={20} /><i /></button>
        {notificationsOpen && <div className="notification-popover"><div className="popover-heading"><b>Уведомления</b><span>2 новых</span></div><div className="notification-item"><span className="notification-marker notification-marker--blue" /><span><b>Справочник обновлён</b><small>В материалы добавлены описания ролей и процессов.</small><time>Сегодня, 10:30</time></span></div><div className="notification-item"><span className="notification-marker notification-marker--violet" /><span><b>Добро пожаловать</b><small>Демонстрационная сессия успешно открыта.</small><time>Только что</time></span></div></div>}
      </div>
      <span className="header-separator" />
      <div className="header-profile"><span className="user-avatar user-avatar--small">{displayName.slice(-2, -1) || 'С'}</span><span><b>{displayName}</b><small>Модератор</small></span></div>
    </div>
    {searchOpen && <button className="popover-dismiss" aria-label="Закрыть поиск" onClick={() => setSearchOpen(false)} />}
    {notificationsOpen && <button className="notification-dismiss" aria-label="Закрыть уведомления" onClick={() => setNotificationsOpen(false)} />}
  </header>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <p className="eyebrow"><span />{children}</p>; }
function PageHeading({ number, label, title, description, aside }: { number: string; label: string; title: ReactNode; description: string; aside?: ReactNode }) {
  return <section className="page-heading"><div className="page-heading__title"><Eyebrow>{label}</Eyebrow><h1>{title}</h1><p>{description}</p></div><div className="page-heading__side"><span>{number}<i>/ 04</i></span>{aside}</div></section>;
}

function OverviewPage({ session, onNavigate }: { session: DemoSession; onNavigate: (page: PortalPage) => void }) {
  const today = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <div className="page page--overview">
    <section className="overview-hero">
      <div className="overview-hero__main"><Eyebrow>СЕГОДНЯ · {today.toLocaleUpperCase('ru')}</Eyebrow><h1>Команда —<br /><em>сердце</em> сообщества.</h1><p>Привет, {session.displayName}. Здесь собраны люди, знания и правила, которые помогают поддерживать порядок и здоровую атмосферу на сервере.</p><div className="hero-actions"><button className="button button--primary" onClick={() => onNavigate('guide')}>Перейти к справочнику <Icon name="arrow" size={19} /></button><button className="button button--text" onClick={() => onNavigate('team')}>Посмотреть команду <Icon name="arrow" size={18} /></button></div></div>
      <div className="overview-hero__visual" aria-hidden="true"><div className="hero-visual__grid" /><div className="hero-visual__ring hero-visual__ring--one" /><div className="hero-visual__ring hero-visual__ring--two" /><div className="hero-visual__ring hero-visual__ring--three" /><div className="hero-visual__disc"><img src={DISCORD_SYMBOL} alt="" /></div><span className="hero-visual__tag hero-visual__tag--top">ЛЮДИ И ПРОЦЕССЫ</span><span className="hero-visual__tag hero-visual__tag--bottom">ОДНО ОБЩЕЕ ПРОСТРАНСТВО</span><span className="hero-visual__cross hero-visual__cross--one">+</span><span className="hero-visual__cross hero-visual__cross--two">+</span></div>
      <div className="overview-hero__index"><b>01</b><span>—</span><small>ОБЗОР</small></div>
    </section>

    <section className="numbers-section"><div className="section-heading"><div><Eyebrow>КОМАНДА В ЦИФРАХ</Eyebrow><h2>Общая картина.</h2></div><span className="demo-caption"><i /> ВСЕ ПОКАЗАТЕЛИ ПРИМЕРНЫЕ</span></div>
      <div className="numbers-grid"><article className="number-cell number-cell--large"><span className="number-cell__label">Сотрудников в команде</span><strong>18</strong><span className="number-cell__note">Условный размер команды</span></article><article className="number-cell"><span className="number-cell__label">Сейчас на связи</span><strong>07</strong><span className="number-cell__note"><i className="status-dot" /> Пример текущего статуса</span></article><article className="number-cell"><span className="number-cell__label">Открытые обращения</span><strong>04</strong><span className="number-cell__note">Демонстрационная очередь</span></article><article className="number-cell"><span className="number-cell__label">Среднее время ответа</span><strong>12<span>м</span></strong><span className="number-cell__note">Условный показатель</span></article></div>
    </section>

    <div className="overview-content-grid">
      <section className="updates-section"><div className="section-heading section-heading--line"><div><Eyebrow>ЧТО НОВОГО</Eyebrow><h2>Объявления.</h2></div><button className="text-link" onClick={() => onNavigate('guide')}>Все материалы <Icon name="arrow" size={17} /></button></div>
        <div className="announcement-list">{announcements.map((item, index) => <article className="announcement-item" key={item.title}><span className="announcement-item__number">0{index + 1}</span><div className="announcement-item__content"><div className="announcement-item__meta"><span className={`announcement-tag announcement-tag--${item.tone}`}>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.body}</p></div><button className="circle-arrow" aria-label={`Открыть: ${item.title}`} onClick={() => onNavigate('guide')}><Icon name="arrow" size={19} /></button></article>)}</div>
      </section>
      <aside className="overview-aside"><section className="team-snapshot"><div className="team-snapshot__top"><span>СОСТАВ КОМАНДЫ</span><span className="snapshot-status"><i /> ПРИМЕР</span></div><div className="team-snapshot__count"><strong>07</strong><span>из 18<br />на связи</span></div><div className="snapshot-bars"><i /><i /><i /><i /><i /><i /><i /></div><div className="team-snapshot__bottom"><span>Активность команды</span><b>условно 39%</b></div><button className="snapshot-link" onClick={() => onNavigate('team')}>Изучить структуру <Icon name="arrow" size={16} /></button></section>
        <section className="aside-quote"><span className="aside-quote__mark">“</span><p>Сильное сообщество начинается с людей, которые готовы о нём заботиться.</p><span className="aside-quote__byline">ПРИНЦИП КОМАНДНОЙ РАБОТЫ</span></section></aside>
    </div>
    <section className="activity-section"><div className="section-heading section-heading--line"><div><Eyebrow>ПОСЛЕДНИЕ ДЕЙСТВИЯ</Eyebrow><h2>Жизнь команды.</h2></div><span className="activity-note">ИСТОРИЯ ДЛЯ ПРИМЕРА</span></div><div className="activity-list">{activity.map((item, index) => <article className="activity-row" key={`${item.initials}-${item.time}`}><span className={`activity-avatar activity-avatar--${item.color}`}>{item.initials}</span><p><b>{item.name}</b> {item.action}</p><time>{item.time}</time><span className="activity-row__index">0{index + 1}</span></article>)}</div></section>
  </div>;
}

function TeamPage() {
  return <div className="page page--inner">
    <PageHeading number="02" label="ЛЮДИ И РОЛИ" title={<>За порядком<br /><em>стоят люди.</em></>} description="Пример структуры команды условного Discord-сервера: кто за что отвечает и к кому обращаться по разным вопросам." aside={<div className="heading-stat"><b>06</b><span>ТИПОВ РОЛЕЙ<br />В ПРИМЕРЕ</span></div>} />
    <div className="page-note"><span className="page-note__icon"><Icon name="info" size={20} /></span><p>Все должности, полномочия и обязанности ниже — демонстрационные. Адаптируйте их под устройство конкретного сообщества.</p><span>ШАБЛОН</span></div>
    <div className="team-intro"><div><Eyebrow>ОРГАНИЗАЦИЯ РАБОТЫ</Eyebrow><h2>От общего курса<br />до ежедневной помощи.</h2></div><p>У каждой роли есть своя зона ответственности. Понятные границы помогают не дублировать работу и быстрее решать вопросы.</p></div>
    <div className="role-directory">{roles.map((role) => <article className={`role-entry role-entry--${role.tone}`} key={role.level}><span className="role-entry__number">{role.level}</span><div className="role-entry__identity"><h3>{role.name}</h3><span>{role.label}</span></div><div className="role-entry__description"><p>{role.description}</p><ul>{role.responsibilities.map((item) => <li key={item}><Icon name="check" size={16} />{item}</li>)}</ul></div><span className="role-entry__arrow"><Icon name="arrow" size={20} /></span></article>)}</div>
    <div className="team-closing"><span className="team-closing__symbol"><img src={DISCORD_SYMBOL} alt="" /></span><p>Хорошая структура не усложняет работу.<br /><b>Она помогает каждому понимать свою роль.</b></p></div>
  </div>;
}

function GuidePage({ onNavigate }: { onNavigate: (page: PortalPage) => void }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const guideSteps = [
    { title: 'Изучите правила команды', text: 'Ознакомьтесь со стандартами общения, конфиденциальностью и порядком работы с обращениями.', page: 'rules' as PortalPage, action: 'Перейти к правилам' },
    { title: 'Разберитесь в структуре ролей', text: 'Посмотрите, кто отвечает за разные направления и к кому обращаться по конкретным вопросам.', page: 'team' as PortalPage, action: 'Посмотреть команду' },
    { title: 'Уточните свои обязанности', text: 'Согласуйте задачи, границы полномочий и формат отчётности с ответственным сотрудником.', page: 'team' as PortalPage, action: 'Открыть структуру' },
    { title: 'Освойте рабочие процессы', text: 'Используйте каналы по назначению и передавайте сложные случаи по установленному порядку.', page: 'rules' as PortalPage, action: 'Открыть материалы' },
  ];
  return <div className="page page--inner">
    <PageHeading number="03" label="БАЗА ЗНАНИЙ" title={<>Сначала понять.<br /><em>Потом действовать.</em></>} description="Короткий маршрут для новых сотрудников и практические материалы для повседневной работы." aside={<div className="heading-stat"><b>{String(completed.length).padStart(2, '0')}</b><span>ИЗ 04 ШАГОВ<br />ВЫПОЛНЕНО</span></div>} />
    <div className="guide-layout"><section className="guide-checklist"><div className="guide-checklist__heading"><div><Eyebrow>ВВОДНЫЙ МАРШРУТ</Eyebrow><h2>Первые шаги.</h2></div><div className="guide-progress-value"><b>{Math.round(completed.length / guideSteps.length * 100)}%</b><span>ГОТОВНОСТЬ</span></div></div><div className="guide-progress"><span style={{ width: `${completed.length / guideSteps.length * 100}%` }} /></div>
      <div className="guide-steps">{guideSteps.map((step, index) => { const isDone = completed.includes(index); return <article className={`guide-step${isDone ? ' guide-step--done' : ''}`} key={step.title}><button className="guide-step__toggle" aria-label={isDone ? 'Отметить шаг невыполненным' : 'Отметить шаг выполненным'} onClick={() => setCompleted((current) => isDone ? current.filter((item) => item !== index) : [...current, index])}>{isDone ? <Icon name="check" size={18} /> : <span />}</button><div className="guide-step__content"><div className="guide-step__topline"><span>ШАГ {String(index + 1).padStart(2, '0')}</span>{isDone && <b>ВЫПОЛНЕНО</b>}</div><h3>{step.title}</h3><p>{step.text}</p><button className="text-link" onClick={() => onNavigate(step.page)}>{step.action} <Icon name="arrow" size={16} /></button></div><span className="guide-step__number">0{index + 1}</span></article>; })}</div>
    </section><aside className="guide-aside"><div className="guide-feature"><div className="guide-feature__orb"><img src={DISCORD_SYMBOL} alt="" /></div><Eyebrow>СПРАВОЧНЫЕ МАТЕРИАЛЫ</Eyebrow><h2>Важное.<br /><em>Без лишнего.</em></h2><p>Пример базы знаний, в которой новые сотрудники могут найти ответы и разобраться в рабочих процессах.</p><span className="guide-feature__footer">ПАМЯТКА СОТРУДНИКА <i>01—04</i></span></div>
      <div className="faq-block"><Eyebrow>ЧАСТО СПРАШИВАЮТ</Eyebrow><h2>Коротко о главном.</h2><details><summary>К кому обращаться с вопросом?</summary><p>Начните с руководителя направления или старшего сотрудника, отвечающего за нужную тему.</p></details><details><summary>Что делать, если задача непонятна?</summary><p>До начала работы уточните ожидаемый результат, контекст и срок выполнения.</p></details><details><summary>Можно ли менять правила?</summary><p>Предложения передаются ответственным за документацию. Изменения вносятся после согласования.</p></details></div></aside></div>
  </div>;
}

function RulesPage() {
  return <div className="page page--inner">
    <PageHeading number="04" label="ВНУТРЕННИЕ СТАНДАРТЫ" title={<>Общие правила.<br /><em>Общие ориентиры.</em></>} description="Пример принципов поведения, общения и работы с информацией внутри команды." aside={<div className="heading-stat"><b>06</b><span>ОСНОВНЫХ<br />ПРИНЦИПОВ</span></div>} />
    <section className="rules-manifesto"><span className="rules-manifesto__icon"><Icon name="shield" size={28} /></span><div><Eyebrow>ОСНОВА РАБОТЫ</Eyebrow><h2>Уважение. Последовательность. Ответственность.</h2><p>Это пример внутреннего документа для шаблона портала. Он не является правилами Discord или какого-либо реального сервера.</p></div><span className="rules-manifesto__stamp">ШАБЛОН<br />01 / 06</span></section>
    <div className="rules-directory">{rules.map((rule) => <article className="rule-entry" key={rule.number}><span className="rule-entry__number">{rule.number}</span><div className="rule-entry__main"><h2>{rule.title}</h2><p>{rule.description}</p></div><ul>{rule.points.map((point) => <li key={point}><span />{point}</li>)}</ul><span className="rule-entry__mark"><Icon name="plus" size={20} /></span></article>)}</div>
    <div className="rules-warning"><Icon name="info" size={19} /><p>Перед использованием замените примерные положения на собственные правила сообщества и согласуйте их с ответственными лицами.</p></div>
  </div>;
}

function PortalFooter() {
  return <footer className="portal-footer"><div className="portal-footer__brand"><Brand compact /><span>НЕЗАВИСИМЫЙ КОНЦЕПТ</span></div><p>Это демонстрационный веб-портал для условной команды Discord-сервера. Проект не аффилирован с Discord Inc., не поддерживается и не одобряется ею. Discord — товарный знак Discord Inc.</p><a href="https://discord.com/branding" target="_blank" rel="noreferrer">Материалы бренда Discord <Icon name="external" size={15} /></a></footer>;
}

function PortalLayout({ session, page, onNavigate, onLogout }: { session: DemoSession; page: PortalPage; onNavigate: (page: PortalPage) => void; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = navigation.find((item) => item.id === page)?.label ?? 'Обзор';
  const navigate = (nextPage: PortalPage) => { navigateTo(nextPage, onNavigate); setMobileOpen(false); };
  return <div className="portal-shell"><Sidebar active={page} onNavigate={navigate} onLogout={onLogout} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} displayName={session.displayName} /><div className="portal-main"><Header title={title} onNavigate={navigate} onMenu={() => setMobileOpen(true)} displayName={session.displayName} /><main className="content-area">{page === 'overview' && <OverviewPage session={session} onNavigate={navigate} />}{page === 'team' && <TeamPage />}{page === 'guide' && <GuidePage onNavigate={navigate} />}{page === 'rules' && <RulesPage />}<PortalFooter /></main></div></div>;
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
    setSession(nextSession); navigateTo('overview', setPage);
  };
  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is optional in demo mode. */ }
    setSession(null); setPage('overview');
  };
  return session ? <PortalLayout session={session} page={page} onNavigate={setPage} onLogout={logout} /> : <LoginScreen onComplete={completeLogin} />;
}
