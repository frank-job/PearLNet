// ============================================================
// Greeting Data
// - Time-based greeting configs for the home header
// - Each period has its own greeting, emoji, gradient, and
//   a set of rotating "words that suit the greeting"
// - Single source of truth for dynamic greeting text
// ============================================================

export type GreetingConfig = {
  id: string;
  greet: string;
  emoji: string;
  gradient: string; // tailwind gradient classes for the greeting text
  textColor: string; // tailwind color class for the user name line
  messages: string[]; // rotating sub-messages that suit the greeting
};

export const greetingConfigs: GreetingConfig[] = [
  {
    id: 'morning',
    greet: 'Good Morning',
    emoji: '☕',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    textColor: 'text-amber-600',
    messages: [
      'Rise and shine, the day is yours ✨',
      'Fresh start, fresh energy 🍳',
      'Coffee first, then conquer the world ☕',
      'Make today ridiculously good 🌅',
      'Morning vibes only 🌞',
    ],
  },
  {
    id: 'afternoon',
    greet: 'Good Afternoon',
    emoji: '☀️',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    textColor: 'text-blue-600',
    messages: [
      'Keep the momentum going 🔥',
      'You are halfway to greatness 💪',
      'Shine bright this afternoon ✨',
      'Crush the rest of your day 🚀',
      'Good vibes all afternoon 😎',
    ],
  },
  {
    id: 'evening',
    greet: 'Good Evening',
    emoji: '🌆',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    textColor: 'text-purple-600',
    messages: [
      'Golden hour thoughts, silver dreams 🌇',
      'Wind down and unwind 🧘',
      'Evenings are for good stories 📖',
      'You made it through the day, legend 👏',
      'Soak in the calm of the nightfall 🌆',
    ],
  },
  {
    id: 'night',
    greet: 'Good Night',
    emoji: '🌙',
    gradient: 'from-indigo-600 via-violet-500 to-purple-500',
    textColor: 'text-indigo-600',
    messages: [
      'Sweet dreams, big ideas 🌠',
      'Rest well, tomorrow is yours 🛌',
      'Stars are watching over you ✨',
      'Power down and recharge 🔋',
      'Midnight thoughts are golden 🌌',
    ],
  },
];

export const GREETING_INTERVAL_MS = 4000;

// ============================================================
// getGreetingConfig
// - Returns the greeting config that matches the given hour
//   (24-hour clock)
// ============================================================
export function getGreetingConfig(hour: number): GreetingConfig {
  if (hour >= 5 && hour < 12) return greetingConfigs[0]; // Morning
  if (hour >= 12 && hour < 15) return greetingConfigs[1]; // Afternoon
  if (hour >= 15 && hour < 21) return greetingConfigs[2]; // Evening
  return greetingConfigs[3]; // Night
}

