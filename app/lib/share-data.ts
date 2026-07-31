export interface ShareApp {
  name: string;
  icon: string;
  color: string;
  url: string;
}

export const shareApps: ShareApp[] = [
  { name: 'WhatsApp', icon: '🟢', color: 'bg-[#25D366]', url: 'whatsapp://send?text=' },
  { name: 'Telegram', icon: '✈️', color: 'bg-[#0088cc]', url: 'https://t.me/share/url?url=' },
  { name: 'TikTok', icon: '🎵', color: 'bg-black', url: 'https://tiktok.com/' },
  { name: 'Instagram', icon: '📸', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', url: 'https://instagram.com/' },
  { name: 'X (Twitter)', icon: '𝕏', color: 'bg-black', url: 'https://twitter.com/intent/tweet?url=' },
  { name: 'Copy', icon: '🔗', color: 'bg-gray-500', url: 'copy' },
];