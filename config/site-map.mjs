export const siteMounts = [
  {
    publicPath: '/runtime/syncdeck-reveal',
    sourcePath: 'vendor/SyncDeck-Reveal',
  },
  {
    publicPath: '/',
    sourcePath: 'Decks',
  },
];

// Public base URL of the deployed GitHub Pages site. Used to build absolute
// `presentationUrl` values for ActiveBits SyncDeck launch/permalink links.
export const siteBaseUrl = 'https://perryhighcs.github.io/Presentations/';

// ActiveBits hosts the SyncDeck instructor/student session infrastructure.
// See vendor/SyncDeck-Reveal/reveal-iframe-sync-message-schema.md
// ("Presentation Team Handoff") for the full launch/permalink contract.
export const syncDeckHosting = {
  activeBitsOrigin: 'https://bits.mycode.run',
  launchPath: '/util/syncdeck/launch-presentation',
  permalinkPath: '/util/syncdeck/permalink',
};
