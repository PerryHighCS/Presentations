export const siteMounts = [
  {
    publicPath: '/runtime/syncdeck-reveal',
    sourcePath: 'vendor/SyncDeck-Reveal',
  },
  {
    publicPath: '/',
    sourcePath: 'Decks',
    // Markdown files here are published as document pages, such as lesson
    // plans (`plan.md` is served as `plan.html`); see scripts/markdown-pages.mjs. Keep notes that
    // should not be public out of Decks/, or exclude them in .pages-manifest.
    markdownPages: true,
  },
];

// Public base URL of the deployed GitHub Pages site. Used to build absolute
// `presentationUrl` values for ActiveBits SyncDeck launch/permalink links.
export const siteBaseUrl = 'https://perryhighcs.github.io/Presentations/';

// Source repository; index pages link project badges to its issues.
export const repoUrl = 'https://github.com/PerryHighCS/Presentations';

// ActiveBits hosts the SyncDeck instructor/student session infrastructure.
// See vendor/SyncDeck-Reveal/reveal-iframe-sync-message-schema.md
// ("Presentation Team Handoff") for the full launch/permalink contract.
export const syncDeckHosting = {
  activeBitsOrigin: 'https://bits.mycode.run',
  launchPath: '/util/syncdeck/launch-presentation',
  permalinkPath: '/util/syncdeck/permalink',
};
