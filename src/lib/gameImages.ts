const LIVE_GAME_LOGOS: Record<string, string> = {
  mlbb: 'https://play-lh.googleusercontent.com/MztmLpB1-_eFbHnqNzzvzl5zjiOH2BEb0D71uBxZYf_4BEmW3QEPWODhRtyqY7Qz4wRLwQ--Rg1RAjOFqtHSs-o=s512',
  freefire: 'https://play-lh.googleusercontent.com/cK-U0_B9GrnSy26SNISDuvU_hL4VggyqJ1J5V2oiuyVEfiGo7fzegdBjk0ejXPg3PKK5sPwumdLBbWv8KkBKLQ=s512',
  pubg: 'https://play-lh.googleusercontent.com/Se7jR6A5R0Mk9ClaIguf46yi2K3k32JsqKb3gAtrktIh3JwnFfxrQRmG9GLvdMpbxbMrReUOxzDkStxGxNo-5Q=s512',
  hok: 'https://play-lh.googleusercontent.com/hEm5NVeEv7UfFJaK8GZdfWe7p3DB_VvYx57qIEHbR0tMV_NToziH0Vbgd6CxLiWF-iURpAe-jsC_UGUDt0diPQ=s512',
  bloodstrike: 'https://play-lh.googleusercontent.com/2u_SRoZ-5g7nqNz4NyFpBvWMg5oEu43MmBmz3m20Rf_wAkOmIV0dOuzblA6GAlUIwjLIOMrKQrpGHMp1JxMyZg=s512',
  wildrift: 'https://play-lh.googleusercontent.com/7-kbcpgrCOE1mleJ9g0d61sJeoqKcQRIj4iFvJ8DjPlRIfocOWfOQsXzKWw2I5oHySVdbjR2fvzfCCz1FYQ-RQ=s512',
  fcmobile: 'https://play-lh.googleusercontent.com/uT1JkXWK9pv1DWWOuVebnsbATHMZmhG4LUDkvoXne9H2MDF1im00_-U4taZPifIBpJ47sA0i8IoCh5aEVuUG5JI=s512',
  roblox: 'https://play-lh.googleusercontent.com/QqZj22aXblAyYDxLQw-Gg0ycW0QkKhrDnwqgERZU9BMRXZnMlgXfq-94sikG5mEpt_I0lzZxcUzfLblmQgwYzUE=s512',
  genshin: 'https://play-lh.googleusercontent.com/PQEqjOxr-3uZaNHmWoQinLVQQ9fbSegMKXmqgFm5nGgagqC2REH-1er3BguYStWbH3YStijj5WH1DDlwPh2ehw=s512',
  codm: 'https://play-lh.googleusercontent.com/cKXlbU72_2wSXdjcD_zPWED3EVaaOQVqqHgiA9JoRQMprYen49arNUMTngcRc9UWLnv-ANT9gyQBDQpvAn61lg=s512',
  clashofclans: 'https://play-lh.googleusercontent.com/gX_sXesdzLc9C4tancLSiJKZom_gLi7Uc5cMfaC-zaY0gvFbXV_DTRZFNqlVx6USMWkqglYgr-k0NeaUq5zE=s512',
  brawlstars: 'https://play-lh.googleusercontent.com/wEOIM7cYyXkMExNztvFYKHJLPegXp6h81-P_JQQ_9KQvDCWK49m2zpt1mTRXO5bA2qU_Bp4em_nfMsHXmq8Z=s512',
  aov: 'https://play-lh.googleusercontent.com/Uezg8ZC7krrxV1VfE03Mahzr174mlPoYQBraGypDXeGamJZszE0kZ_Jl0CtpwQELYWe9fw4M55Tqiucpm0tzi7E=s512',
  steam: 'https://play-lh.googleusercontent.com/E_x2GPSJakCdUYfECBptVyFoVnC4BxIPy3K4OdbwNyEtEJkRAY_J-Lo_Ltiybq6LiJ_aZCIzvqLv5h4Fbk91=s512',
  netflix: 'https://play-lh.googleusercontent.com/fXVS45nukV1x9PYVSKHkCQK0QGCOishIvAOxIZS3sgRem8HS7l9l94_Ggj-WZPrTLePRdNYN4pp4SPAQL7oS0PU=s512',
  spotify: 'https://play-lh.googleusercontent.com/IzQgYCcnCFCD08GR-3bdtcT8xzOvrNkC84avGT5CwTX2VIqmTmKKJcP_Cd4JoBOdmCMlTndlOzV6hrthg2fOWA=s512',
  youtube: 'https://play-lh.googleusercontent.com/QNmuZQc9I6Zbe3mWnSr0hycnENqGFCI5p3yE29Hkxtf22T0IWS6zTrpxULLyyjWpB7ONAXDsDQXnXcVWokl3eg=s512',
  valorant: 'https://media.valorant-api.com/gamemodes/96012644-4cf7-86a8-8605-99ac6f8196e8/displayicon.png',
  nikke: 'https://play-lh.googleusercontent.com/6qv7YkyQQ9fVeyM-PSIvnD1vnBO9xZVZoqQy9f3s9m3_IIUt2JS4ni3jDi7TZFpyrKN0cC-I2BbuXMYuhY1aCxg=s512',
  harry_potter: 'https://play-lh.googleusercontent.com/9Q_fxr4mZhHoYQyYriRtHJt2-KbWDSD8jdwy25C916x6QKCkOIgvcl87VPMcIQZGnPblhT1rEcWuGCMcJy4uxhI=s512',
  undawn: 'https://play-lh.googleusercontent.com/c6c6fa5e6b12a0f8b89c743842c13d3957f8979313936615b394136e0d9b4b0e=s512',
  arena_breakout: 'https://play-lh.googleusercontent.com/JBjC3-ztV1LX8nT2sumjHZqPi97NOuKFhIJy6i7Z0NcGvZbXpP50mwFv7SguTeNMspC6Y4HmO2qAAATi65Rl1Q=s512',
  super_sus: 'https://play-lh.googleusercontent.com/18DPC2VKF_9bYqnvcf2Jbas4W4pah5-mJ0rJ4lpx-7ACShqJLWRi3u-aIo-xduaYzesL5EmJK7i0yYa4fi_k=s512',
  metal_slug: 'https://play-lh.googleusercontent.com/xDk7cvZCyJlWro3ipxmYNvuq4kQm6iXp2ryX-RWaX8AJD5BpuvZqzJ1m4NDsQjVi6Mbt5PgNqvnCSTmnPzqhIA=s512',
  stumble_guys: 'https://play-lh.googleusercontent.com/bt7JMYIJDQgQjkfGPCQomYgNbtNkkvME1xP1WuYouiDiia1BxNnQtq9esfUsTFFhA1H3OVl3j8_XICLkzBcakvM=s512',
  identityv: 'https://play-lh.googleusercontent.com/TInj0KYJu5pubhK7iEaUAGIzxavLzjFT76Ei6okqcnQw-njQUnQkp9Vkz70aWf6-NA0PixqEGKs0RFBa4XyglZ4=s512',
  ragnarok: 'https://play-lh.googleusercontent.com/pF6WXInG5Jrwug7xv99ltVV4FBJRNITAouod7MPxIRk_u8zCPBUl0bj7lYWVjO65HqlraHXfo7ZmVkgcBhmpKg=s512',
};

export function getGameThumbnailUrl(slug: string = '', rawThumb: string = ''): string {
  const s = (slug || '').toLowerCase();

  if (s.includes('valorant') || s === 'val') return LIVE_GAME_LOGOS.valorant;
  if (s.includes('wild') || s.includes('lol')) return LIVE_GAME_LOGOS.wildrift;
  if (s.includes('blood')) return LIVE_GAME_LOGOS.bloodstrike;
  if (s.includes('fc') || s.includes('fifa') || s.includes('eafc')) return LIVE_GAME_LOGOS.fcmobile;
  if (s.includes('mlbb') || s.includes('mobile_legend') || s.includes('mobile-legend') || s.includes('mobilelegends')) return LIVE_GAME_LOGOS.mlbb;
  if (s.includes('free') || s.includes('ff')) return LIVE_GAME_LOGOS.freefire;
  if (s.includes('pubg')) return LIVE_GAME_LOGOS.pubg;
  if (s.includes('hok') || s.includes('honor')) return LIVE_GAME_LOGOS.hok;
  if (s.includes('roblox')) return LIVE_GAME_LOGOS.roblox;
  if (s.includes('genshin')) return LIVE_GAME_LOGOS.genshin;
  if (s.includes('cod') || s.includes('duty')) return LIVE_GAME_LOGOS.codm;
  if (s.includes('clash')) return LIVE_GAME_LOGOS.clashofclans;
  if (s.includes('brawl')) return LIVE_GAME_LOGOS.brawlstars;
  if (s.includes('aov') || s.includes('arena_of_valor')) return LIVE_GAME_LOGOS.aov;
  if (s.includes('steam')) return LIVE_GAME_LOGOS.steam;
  if (s.includes('netflix')) return LIVE_GAME_LOGOS.netflix;
  if (s.includes('spotify')) return LIVE_GAME_LOGOS.spotify;
  if (s.includes('youtube')) return LIVE_GAME_LOGOS.youtube;
  if (s.includes('nikke')) return LIVE_GAME_LOGOS.nikke;
  if (s.includes('harry') || s.includes('potter')) return LIVE_GAME_LOGOS.harry_potter;
  if (s.includes('undawn')) return LIVE_GAME_LOGOS.undawn;
  if (s.includes('breakout')) return LIVE_GAME_LOGOS.arena_breakout;
  if (s.includes('sus')) return LIVE_GAME_LOGOS.super_sus;
  if (s.includes('metal')) return LIVE_GAME_LOGOS.metal_slug;
  if (s.includes('stumble')) return LIVE_GAME_LOGOS.stumble_guys;
  if (s.includes('identity')) return LIVE_GAME_LOGOS.identityv;
  if (s.includes('ragnarok')) return LIVE_GAME_LOGOS.ragnarok;

  // For all other catalog games, use rawThumb if provided and valid
  if (rawThumb && rawThumb.trim() && !rawThumb.includes('default.png') && !rawThumb.includes('cloudinary.com')) {
    return rawThumb.trim();
  }

  return LIVE_GAME_LOGOS.mlbb;
}
