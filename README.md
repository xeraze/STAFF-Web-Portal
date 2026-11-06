# Discord Staff WebPortal

A small, frontend-only staff portal concept for a hypothetical Discord community. It is intentionally generic: no server name, community identity, or official Discord branding is assumed.

## Stack

- React 19 + TypeScript
- Vite 8
- CSS (custom responsive design system; no UI framework required)

## Demo behavior

- The login screen types a generated test username and a masked sample password, then opens the demo workspace.
- The demo session is stored in `sessionStorage` and is cleared when the user logs out or closes the browser tab.
- All profile details, metrics, announcements, team activity, and documentation are sample content.
- No credentials are verified, transmitted, or stored on a server. There is no backend, database, Discord API connection, or real access control.
- The onboarding checklist is local UI state and is not persisted.

## Main sections

- **Overview** — sample metrics, announcements, activity, and links to documents.
- **Team** — an example hierarchy with responsibilities.
- **Handbook** — onboarding checklist and FAQ.
- **Rules** — generic example policy sections.

## Project structure

```text
src/
  App.tsx       Application, demo login, layouts, and pages
  data.ts       Example roles, rules, announcements, and activity
  main.tsx      React entry point
  styles.css    Responsive design system
index.html
vite.config.ts
tsconfig.json
```

## Disclaimer

This is an independent concept/template and is not affiliated with, endorsed by, sponsored by, or supported by Discord Inc. Discord is a trademark of Discord Inc. The portal is not an official Discord product and is not connected to any particular Discord server.

The existing `LICENSE` file is retained from the supplied project.