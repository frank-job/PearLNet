// ============================================================
// Additional Posts Data
// - Extra sample posts to populate the feed for visitors
// - Linked to the existing seeded demo users so the feed shows
//   realistic usernames and avatars
// - Deterministic UUIDs + ON CONFLICT DO NOTHING make this
//   idempotent: running the seed multiple times won't duplicate
// - Total: 50 posts (30 image + 20 text-only), distributed
//   across all 20 seed users (~2-3 posts each)
// ============================================================

export type SeedPost = {
  id: string;
  image_url: string | null; // null => text-only post
  caption: string;
  user_id: string;
  user_email: string;
};

// The 20 seeded demo users (kept in sync with /api/seed + init.sql)
export const SEED_USERS = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', username: 'frank_dev', email: 'frank_dev@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', username: 'handcrafted_haven', email: 'handcrafted_haven@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', username: 'maya_design', email: 'maya_design@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', username: 'wood_master', email: 'wood_master@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', username: 'jdm_vibes', email: 'jdm_vibes@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', username: 'sarah_create', email: 'sarah_create@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', username: 'mark_tech', email: 'mark_tech@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567808', username: 'elena_ceramics', email: 'elena_ceramics@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567809', username: 'city_snaps', email: 'city_snaps@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', username: 'dev_lina', email: 'dev_lina@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567811', username: 'retro_finds', email: 'retro_finds@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567812', username: 'plant_dad', email: 'plant_dad@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567813', username: 'hike_life', email: 'hike_life@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567814', username: 'pixel_perfect', email: 'pixel_perfect@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567815', username: 'hide_and_seek', email: 'hide_and_seek@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567816', username: 'chef_kitchen', email: 'chef_kitchen@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567817', username: 'remote_work', email: 'remote_work@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567818', username: 'shine_bright', email: 'shine_bright@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567819', username: 'arch_daily', email: 'arch_daily@example.com' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', username: 'neon_beats', email: 'neon_beats@example.com' },
];

const u = (idx: number) => SEED_USERS[idx];

export const additionalPosts: SeedPost[] = [
  // ============================================================
  // 50 fresh posts — image posts (30)
  // ============================================================
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678001',
    image_url: 'https://picsum.photos/seed/neokey/800/1200',
    caption: 'New keycap set installed. Thocky switches, zero regrets. ⌨️✨ #mechkeys',
    user_id: u(0).id,
    user_email: u(0).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678002',
    image_url: 'https://picsum.photos/seed/macrame/800/1200',
    caption: 'Macramé plant hanger, hand-knotted with recycled cotton. 🌿🧶 #handmade',
    user_id: u(1).id,
    user_email: u(1).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678003',
    image_url: 'https://picsum.photos/seed/poster/800/1200',
    caption: 'Midnight poster series. Negative space doing the heavy lifting. 🎨🖤 #graphicdesign',
    user_id: u(2).id,
    user_email: u(2).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678004',
    image_url: 'https://picsum.photos/seed/dovetail/800/1200',
    caption: 'Hand-cut dovetails, no jig. Patience pays off. 🪚📐 #woodworking',
    user_id: u(3).id,
    user_email: u(3).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678005',
    image_url: 'https://picsum.photos/seed/sakura/800/1200',
    caption: 'Touge run at golden hour. The MR2 loves the twisties. 🏎️🌄 #jdm',
    user_id: u(4).id,
    user_email: u(4).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678006',
    image_url: 'https://picsum.photos/seed/inkwash/800/1200',
    caption: 'Ink wash study. Water, ink, and a little bravery. 🖋️🌊',
    user_id: u(5).id,
    user_email: u(5).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678007',
    image_url: 'https://picsum.photos/seed/soldering/800/1200',
    caption: 'Desoldered and rebuilt a vintage keyboard PCB. Works perfectly. 🔧⌨️',
    user_id: u(6).id,
    user_email: u(6).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678008',
    image_url: 'https://picsum.photos/seed/celadon/800/1200',
    caption: 'Celadon glaze mixed from scratch. That crackle is dreamy. 🏺💚',
    user_id: u(7).id,
    user_email: u(7).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678009',
    image_url: 'https://picsum.photos/seed/arcade/800/1200',
    caption: 'Neon arcade sign after midnight. The nostalgia hits hard. 🕹️📸',
    user_id: u(8).id,
    user_email: u(8).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678010',
    image_url: 'https://picsum.photos/seed/sprint/800/1200',
    caption: 'Shipped the sprint board to Done. Whiteboard party! 🚀📋',
    user_id: u(9).id,
    user_email: u(9).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678011',
    image_url: 'https://picsum.photos/seed/rotary/800/1200',
    caption: 'Restored rotary phone. The dial sound is ASMR. 📞🎵 #vintage',
    user_id: u(10).id,
    user_email: u(10).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678012',
    image_url: 'https://picsum.photos/seed/bonsai/800/1200',
    caption: 'Repotted my bonsai. Wiring branches for the first time. 🌳✂️',
    user_id: u(11).id,
    user_email: u(11).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678013',
    image_url: 'https://picsum.photos/seed/bluff/800/1200',
    caption: 'Clifftop lunch with a view that goes forever. 🥾🌊 #hiking',
    user_id: u(12).id,
    user_email: u(12).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678014',
    image_url: 'https://picsum.photos/seed/wireframe/800/1200',
    caption: 'Wireframing the new onboarding flow. Simplicity wins. 📱✏️ #uidesign',
    user_id: u(13).id,
    user_email: u(13).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678015',
    image_url: 'https://picsum.photos/seed/stitching/800/1200',
    caption: 'Saddle-stitched wallet in cognac leather. Aging beautifully. 👜🔶',
    user_id: u(14).id,
    user_email: u(14).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678016',
    image_url: 'https://picsum.photos/seed/ramen/800/1200',
    caption: 'Tonkotsu ramen from scratch. 18-hour broth, zero shortcuts. 🍜🥢 #foodie',
    user_id: u(15).id,
    user_email: u(15).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678017',
    image_url: 'https://picsum.photos/seed/fireplace/800/1200',
    caption: 'Winter office: fireplace + laptop. The cozy setup. 🏠💻🔥 #remote',
    user_id: u(16).id,
    user_email: u(16).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678018',
    image_url: 'https://picsum.photos/seed/paintcheck/800/1200',
    caption: 'Paint correction gone right. That depth though. 🚗✨ #detailing',
    user_id: u(17).id,
    user_email: u(17).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678019',
    image_url: 'https://picsum.photos/seed/bamboo/800/1200',
    caption: 'Bamboo fence shadow play. Light as architecture. 🎋🌇',
    user_id: u(18).id,
    user_email: u(18).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678020',
    image_url: 'https://picsum.photos/seed/modular/800/1200',
    caption: 'Modular synth patch #7. This pad is enormous. 🎛️🌌 #synthwave',
    user_id: u(19).id,
    user_email: u(19).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678021',
    image_url: 'https://picsum.photos/seed/miniserv/800/1200',
    caption: 'Home lab mini server. 8 cores, silent fans, pure joy. 🖥️🔇 #homelab',
    user_id: u(0).id,
    user_email: u(0).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678022',
    image_url: 'https://picsum.photos/seed/colorstudy/800/1200',
    caption: 'Color study in teal + amber. Complementaries for the win. 🎨🌈',
    user_id: u(2).id,
    user_email: u(2).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678023',
    image_url: 'https://picsum.photos/seed/garage2/800/1200',
    caption: 'Garage cleanup day. The wheels stay on display. 🏁🛠️',
    user_id: u(4).id,
    user_email: u(4).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678024',
    image_url: 'https://picsum.photos/seed/smartdesk/800/1200',
    caption: 'Smart desk setup: standing, sitting, LED everything. 🪑💡 #tech',
    user_id: u(6).id,
    user_email: u(6).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678025',
    image_url: 'https://picsum.photos/seed/rainwindow/800/1200',
    caption: 'Rain on the café window. Mood: amber. 🌧️☕ #streetphotography',
    user_id: u(8).id,
    user_email: u(8).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678026',
    image_url: 'https://picsum.photos/seed/typewriter/800/1200',
    caption: '1950s typewriter, fully serviced. The keys are silky. ⌨️🕰️',
    user_id: u(10).id,
    user_email: u(10).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678027',
    image_url: 'https://picsum.photos/seed/alpine/800/1200',
    caption: 'Alpine lake at sunrise. Worth every switchback. 🏔️🏞️',
    user_id: u(12).id,
    user_email: u(12).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678028',
    image_url: 'https://picsum.photos/seed/duffel/800/1200',
    caption: 'Minimal leather duffel, hand-sewn straps. Weekend ready. 🎒🧵',
    user_id: u(14).id,
    user_email: u(14).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678029',
    image_url: 'https://picsum.photos/seed/lakeside/800/1200',
    caption: 'Lakeside laptop session. Zoom calls with a view. 🖥️🌅',
    user_id: u(16).id,
    user_email: u(16).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678030',
    image_url: 'https://picsum.photos/seed/spiral/800/1200',
    caption: 'Spiral staircase shot from below. Geometry nerd heaven. 🌀🏢 #architecture',
    user_id: u(18).id,
    user_email: u(18).email,
  },

  // ============================================================
  // Text-only posts (20)
  // ============================================================
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678031',
    image_url: null,
    caption: 'Small batches mean every piece is a little different. That\'s the charm. ✨',
    user_id: u(1).id,
    user_email: u(1).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678032',
    image_url: null,
    caption: 'Wood doesn\'t lie. If you rush, it shows. Take the time. 🪵',
    user_id: u(3).id,
    user_email: u(3).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678033',
    image_url: null,
    caption: 'Art blocks are just your brain recharging. Be patient with it. 🎨',
    user_id: u(5).id,
    user_email: u(5).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678034',
    image_url: null,
    caption: 'The kiln is the real artist. I just set the stage. 🔥🏺',
    user_id: u(7).id,
    user_email: u(7).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678035',
    image_url: null,
    caption: 'Today I learned: the bug was a missing semicolon. Always. 😅💻',
    user_id: u(9).id,
    user_email: u(9).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678036',
    image_url: null,
    caption: 'If your plant is drooping, check the roots first. Advice for plants and people. 🌱',
    user_id: u(11).id,
    user_email: u(11).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678037',
    image_url: null,
    caption: 'Every pixel should earn its place on the canvas. 📐',
    user_id: u(13).id,
    user_email: u(13).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678038',
    image_url: null,
    caption: 'A pinch of salt at the start beats a handful at the end. 👨‍🍳',
    user_id: u(15).id,
    user_email: u(15).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678039',
    image_url: null,
    caption: 'Details are the difference between clean and detailed. 🧼',
    user_id: u(17).id,
    user_email: u(17).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678040',
    image_url: null,
    caption: 'Some tracks are born at 2am when the city is quiet. 🎧🌃',
    user_id: u(19).id,
    user_email: u(19).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678041',
    image_url: null,
    caption: 'Merged 14 PRs today. My coffee cup deserves a medal. ☕🫡',
    user_id: u(0).id,
    user_email: u(0).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678042',
    image_url: null,
    caption: 'The best client brief is the one with no adjectives. Show me, don\'t tell me. 📋',
    user_id: u(2).id,
    user_email: u(2).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678043',
    image_url: null,
    caption: 'RPM > MPG. That\'s the whole philosophy. 🏎️',
    user_id: u(4).id,
    user_email: u(4).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678044',
    image_url: null,
    caption: 'Backed up everything today. Future me says thanks. 💾',
    user_id: u(6).id,
    user_email: u(6).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678045',
    image_url: null,
    caption: 'Shoot the ordinary. One day it becomes history. 📷',
    user_id: u(8).id,
    user_email: u(8).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678046',
    image_url: null,
    caption: 'Old tech wasn\'t slower. We were just faster at waiting. 📻',
    user_id: u(10).id,
    user_email: u(10).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678047',
    image_url: null,
    caption: 'Leave no trace. Pack in what you pack out. ♻️🥾',
    user_id: u(12).id,
    user_email: u(12).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678048',
    image_url: null,
    caption: 'Good leather gets better with every scratch. Wear it proudly. 👜',
    user_id: u(14).id,
    user_email: u(14).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678049',
    image_url: null,
    caption: 'Meeting-free Friday. Deep work champion. 🧠☕',
    user_id: u(16).id,
    user_email: u(16).email,
  },
  {
    id: 'f2a3b4c5-d6e7-4f8a-9b0c-d12345678050',
    image_url: null,
    caption: 'Concrete, glass, and sky. Three materials, endless possibilities. 🏢',
    user_id: u(18).id,
    user_email: u(18).email,
  },
];

