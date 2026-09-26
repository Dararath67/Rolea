import { GameProduct, PaymentMethod, Order } from '../types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'vngzz2game',
    name_en: 'Rothz Payment ABA PayWay KHQR',
    name_km: 'Rothz Payment ABA PayWay KHQR (បាគង គ្រប់ធនាគារ)',
    category: 'khqr',
    icon: 'PAYWAY',
    fee_percent: 0,
    fee_fixed_usd: 0,
    account_name: 'Rothz Payment',
    account_number: 'ABA PayWay KHQR Gateway',
    badge_en: 'AUTO KHQR (ABA & BAKONG)',
    badge_km: 'KHQR ស្វ័យប្រវត្តិ',
    is_active: true
  }
];

export const INITIAL_PRODUCTS: GameProduct[] = [
  {
    id: 'mlbb',
    slug: 'mobile-legends',
    name_en: 'Mobile Legends: Bang Bang',
    name_km: 'Mobile Legends: Bang Bang',
    subtitle_en: 'Instant MLBB Diamond top-up via Cambodian KHQR & Bakong',
    subtitle_km: 'បញ្ចូលពេជ្រ MLBB តាមរយៈ KHQR & Bakong ស្វ័យប្រវត្តិ',
    category: 'mobile',
    publisher: 'Moonton',
    region: 'Cambodia / Global',
    thumbnail: '/images/games/mlbb.png',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    badge_en: 'HOT',
    badge_km: 'ពេញនិយម',
    currency_name_en: 'Diamonds',
    currency_name_km: 'ពេជ្រ',
    instant_delivery: true,
    is_popular: true,
    is_hot_deal: true,
    is_active: true,
    guide_en: 'Find your User ID and Zone ID on your in-game avatar screen. Example: 12345678 (2026).',
    guide_km: 'ស្វែងរក User ID និង Zone ID នៅក្នុង Profile ហ្គេមរបស់អ្នក។ ឧទាហរណ៍៖ 12345678 (2026)',
    fields: [
      { id: 'user_id', label_en: 'User ID', label_km: 'User ID', placeholder_en: 'e.g. 12345678', placeholder_km: 'ឧទាហរណ៍ 12345678', required: true },
      { id: 'zone_id', label_en: 'Zone ID', label_km: 'Zone ID', placeholder_en: 'e.g. 2026', placeholder_km: 'ឧទាហរណ៍ 2026', required: true }
    ],
    packages: [
      { id: 'ml-86', name: '86 Diamonds', price_usd: 1.35, cost_usd: 1.20, price_khr: 5535, bonus: '+8 Bonus' },
      { id: 'ml-172', name: '172 Diamonds', price_usd: 2.65, cost_usd: 2.40, price_khr: 10865, bonus: '+16 Bonus' },
      { id: 'ml-257', name: '257 Diamonds', price_usd: 3.95, cost_usd: 3.60, price_khr: 16195, bonus: '+25 Bonus', popular: true },
      { id: 'ml-344', name: '344 Diamonds', price_usd: 5.30, cost_usd: 4.80, price_khr: 21730, bonus: '+34 Bonus' },
      { id: 'ml-706', name: '706 Diamonds', price_usd: 10.50, cost_usd: 9.50, price_khr: 43050, bonus: '+70 Bonus', popular: true },
      { id: 'ml-2195', name: '2,195 Diamonds', price_usd: 31.00, cost_usd: 28.50, price_khr: 127100, bonus: '+219 Bonus' },
      { id: 'ml-pass', name: 'Weekly Diamond Pass', price_usd: 1.85, cost_usd: 1.65, price_khr: 7585, bonus: '210 Diamonds Total', popular: true }
    ]
  },
  {
    id: 'ff',
    slug: 'free-fire',
    name_en: 'Garena Free Fire',
    name_km: 'Garena Free Fire',
    subtitle_en: 'Instant Free Fire Diamonds delivery via Cambodian KHQR',
    subtitle_km: 'បញ្ចូលពេជ្រ Free Fire ស្វ័យប្រវត្តិ',
    category: 'mobile',
    publisher: 'Garena',
    region: 'Cambodia / Global',
    thumbnail: '/images/games/freefire.png',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    badge_en: 'HOT',
    badge_km: 'ប្រូម៉ូសិន',
    currency_name_en: 'Diamonds',
    currency_name_km: 'ពេជ្រ',
    instant_delivery: true,
    is_popular: true,
    is_hot_deal: true,
    is_active: true,
    guide_en: 'Open Free Fire, click on your profile icon in top-left, copy your Player UID.',
    guide_km: 'បើក Free Fire ចុចលើ Profile ជ្រុងខាងឆ្វេងខាងលើ ដើម្បីចម្លង Player UID។',
    fields: [
      { id: 'player_uid', label_en: 'Player UID', label_km: 'Player UID', placeholder_en: 'e.g. 987654321', placeholder_km: 'ឧទាហរណ៍ 987654321', required: true }
    ],
    packages: [
      { id: 'ff-100', name: '100 + 10 Diamonds', price_usd: 0.99, cost_usd: 0.85, price_khr: 4059 },
      { id: 'ff-310', name: '310 + 31 Diamonds', price_usd: 2.95, cost_usd: 2.60, price_khr: 12095, popular: true },
      { id: 'ff-520', name: '520 + 52 Diamonds', price_usd: 4.90, cost_usd: 4.30, price_khr: 20090, popular: true },
      { id: 'ff-1060', name: '1,060 + 106 Diamonds', price_usd: 9.80, cost_usd: 8.60, price_khr: 40180 },
      { id: 'ff-w-member', name: 'Weekly Membership', price_usd: 1.99, cost_usd: 1.75, price_khr: 8159, bonus: '450 Diamonds Total' }
    ]
  },
  {
    id: 'pubgm',
    slug: 'pubg-mobile',
    name_en: 'PUBG Mobile',
    name_km: 'PUBG Mobile',
    subtitle_en: 'Instant Unknown Cash (UC) direct top-up for Cambodia',
    subtitle_km: 'បញ្ចូល UC PUBG Mobile តាមប្រព័ន្ធស្វ័យប្រវត្តិ',
    category: 'mobile',
    publisher: 'Level Infinite / Tencent',
    region: 'Cambodia / Global',
    thumbnail: '/images/games/pubg.png',
    banner: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&auto=format&fit=crop&q=80',
    badge_en: 'POPULAR',
    badge_km: 'ពេញនិយម',
    currency_name_en: 'UC',
    currency_name_km: 'UC',
    instant_delivery: true,
    is_popular: true,
    is_active: true,
    guide_en: 'Tap on your player avatar in the top right to view and copy your Character ID.',
    guide_km: 'ចុចលើ Profile ដើម្បីចម្លង Character ID របស់អ្នក។',
    fields: [
      { id: 'character_id', label_en: 'Player Character ID', label_km: 'Character ID', placeholder_en: 'e.g. 5123456789', placeholder_km: 'ឧទាហរណ៍ 5123456789', required: true }
    ],
    packages: [
      { id: 'pubg-60', name: '60 UC', price_usd: 0.99, cost_usd: 0.85, price_khr: 4059 },
      { id: 'pubg-325', name: '325 UC', price_usd: 4.80, cost_usd: 4.20, price_khr: 19680, popular: true },
      { id: 'pubg-660', name: '660 UC', price_usd: 9.50, cost_usd: 8.40, price_khr: 38950, popular: true },
      { id: 'pubg-1800', name: '1,800 UC', price_usd: 23.50, cost_usd: 21.00, price_khr: 96350 }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'RT-94821',
    reference: 'REF-KHQR-9921',
    user_id: 'usr-gamer-1',
    game_slug: 'mobile-legends',
    game_name_en: 'Mobile Legends: Bang Bang',
    game_name_km: 'Mobile Legends: Bang Bang',
    product_id: 'ml-257',
    product_name_en: '257 Diamonds (+25 Bonus)',
    product_name_km: '257 ពេជ្រ (+25 បន្ថែម)',
    player_id: '84920194',
    server_id: '2104',
    amount_usd: 3.95,
    amount_khr: 16195,
    currency: 'USD',
    payment_method_id: 'khqr',
    payment_method_name: 'Bakong KHQR',
    status: 'success',
    provider_id: 'smileone',
    provider_order_id: 'SM-TXN-8829192',
    delivery_code: 'AUTO-DIRECT-MOONTON-REF-883921',
    customer_contact: 'gamer@gmail.com',
    created_at: new Date().toISOString()
  }
];
