export function getGameThumbnailUrl(slug: string = '', rawThumb: string = ''): string {
  const s = (slug || '').toLowerCase();
  
  if (s.includes('valorant') || s.includes('val')) return '/images/games/valorant.png';
  if (s.includes('wild_rift') || s.includes('wildrift') || s.includes('lol')) return '/images/games/wildrift.png';
  if (s.includes('bloodstrike') || s.includes('blood')) return '/images/games/bloodstrike.png';
  if (s.includes('fc') || s.includes('eafc') || s.includes('fifa')) return '/images/games/fcmobile.png';
  if (s.includes('mlbb') || s.includes('mobile_legends') || s.includes('legends')) return '/images/games/mlbb.png';
  if (s.includes('freefire') || s.includes('free_fire') || s.includes('ff')) return '/images/games/freefire.png';
  if (s.includes('pubg')) return '/images/games/pubg.png';
  if (s.includes('hok') || s.includes('honor') || s.includes('kings')) return '/images/games/hok.png';
  if (s.includes('roblox')) return '/images/games/roblox.png';
  if (s.includes('genshin')) return '/images/games/genshin.png';
  if (s.includes('codm') || s.includes('call_of_duty') || s.includes('duty')) return '/images/games/codm.png';
  if (s.includes('clashofclans') || s.includes('clash') || s.includes('coc')) return '/images/games/clashofclans.png';
  if (s.includes('brawlstars') || s.includes('brawl')) return '/images/games/brawlstars.png';
  if (s.includes('aov') || s.includes('arena')) return '/images/games/aov.png';
  if (s.includes('steam')) return '/images/games/steam.png';
  if (s.includes('chatgpt') || s.includes('gpt')) return '/images/games/chatgpt.png';
  if (s.includes('canva')) return '/images/games/canva.png';
  if (s.includes('netflix')) return '/images/games/netflix.png';
  if (s.includes('spotify')) return '/images/games/spotify.png';
  if (s.includes('youtube')) return '/images/games/youtube.png';
  if (s.includes('cellcard')) return '/images/games/cellcard.png';
  if (s.includes('smart')) return '/images/games/smart.png';
  if (s.includes('metfone')) return '/images/games/metfone.png';

  if (rawThumb && rawThumb.startsWith('/images/')) {
    return rawThumb;
  }

  return '/images/games/mlbb.png';
}
