export interface ShareApp {
  name: string;
  icon: string;
  color: string;
  url: string;
}

export const shareApps: ShareApp[] = [
  { name: 'WhatsApp', icon: '/icons8-whatsapp-logo-94.png', color: 'bg-[#25D366]', url: 'whatsapp://send?text=' },
  { name: 'Telegram', icon: '/icons8-telegram-logo-48.apng.png', color: 'bg-[#0088cc]', url: 'https://t.me/share/url?url=' },
  { name: 'TikTok', icon: '/icons8-tik-tok.svg', color: 'bg-black', url: 'https://tiktok.com/' },
  { name: 'Instagram', icon: '/icons8-instagram-logo-94.png', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', url: 'https://instagram.com/' },
  { name: 'X (Twitter)', icon: '/icons8-x.svg', color: 'bg-black', url: 'https://twitter.com/intent/tweet?url=' },
  { name: 'Copy', icon: '/icons8-copy-32.png', color: 'bg-gray-500', url: 'copy' },
];

