// Default homepage configuration
export const DEFAULT_HOME_CONFIG = {
  notificationBanner: {
    enabled: false,
    text: '',
    link: '',
    bgColor: '#1A1B4B',
    textColor: '#FF9F1C',
    dismissable: true,
  },
  sections: [
    { id: 'hero',        label: 'Hero Slider',      visible: true, order: 1 },
    { id: 'credentials', label: 'Credentials',       visible: true, order: 2 },
    { id: 'logos',       label: 'Corporate Logos',   visible: true, order: 3 },
    { id: 'featured',    label: 'Featured Cards',    visible: true, order: 4 },
    { id: 'about',       label: 'About Biography',   visible: true, order: 5 },
    { id: 'books',       label: 'Featured Books',    visible: true, order: 6 },
    { id: 'youtube',     label: 'YouTube Channel',   visible: true, order: 7 },
  ],
  pinnedVideos: [],
  heroSlides: [
    'https://lh3.googleusercontent.com/d/1Bpk-lc_U4E2Gxo8_9b-43X-fHbrYWwrU',
    'https://lh3.googleusercontent.com/d/1MN4z91XjyCUFfuOPKDCeBse8TwAfJRVg',
    'https://lh3.googleusercontent.com/d/1O3fWg2DJQe9OjftyazsN51GsieQlFHTI',
    'https://lh3.googleusercontent.com/d/11w6VyjYDU2nnpu2dCZxmEI1J6CIknPd2',
    'https://lh3.googleusercontent.com/d/1TyVI1qZG_H-_sV4AMjx4s0KMK9uL9OZ9',
    'https://lh3.googleusercontent.com/d/1vLIoTs884mJS5e_X0TElAwSFqtCFPzxt',
    'https://lh3.googleusercontent.com/d/1Rf589EQudojyzXvW-VoslX9-85tlcZYY',
    'https://lh3.googleusercontent.com/d/1xiif-If20kRnW9Y_uLyu97L9dNLAOi1d',
    'https://lh3.googleusercontent.com/d/1bMzO5xj3RjhY-yzWvblG1TIHSklYEjsw',
    'https://lh3.googleusercontent.com/d/1bj0d9uI_GxIiOxnWDZ8NGRkqxd8J-Jrt',
    'https://lh3.googleusercontent.com/d/10mK9cOKdMWbFdY6-54eMf8k8NttVQvqT',
    'https://lh3.googleusercontent.com/d/1V2dkDXRKYxUnhr6svJku7bFeqsvDEgzE',
    'https://lh3.googleusercontent.com/d/1EiBnGGZEEbhHbEAtKrkWaxVj2rjssowf',
    'https://lh3.googleusercontent.com/d/1gh3Xk7FzDUldPCd99ZtrE9PH6H93guN_',
    'https://lh3.googleusercontent.com/d/1CXURMsM6guqQh9zT_RxeNOJGZbGBrI-3',
  ],
  featuredBooks: [
    {
      id: 1, title: 'The Happiness Paradox (SS Series - Book 1)', price: '₹170.00',
      url: 'https://voicepublication.in/products/the-happiness-paradox',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TheHappinessParadox-cover.jpg?v=1780304890',
    },
    {
      id: 3, title: 'Decoding the Self (CC Series - Book 1)', price: '₹200.00',
      url: 'https://voicepublication.in/products/decoding-the-self',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/TCCDecodingtheself-cover.jpg?v=1780305591',
    },
    {
      id: 5, title: 'Your Best Friend', price: '₹280.00',
      url: 'https://voicepublication.in/products/your-best-friend',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YourBestFriend-front.jpg?v=1764746523',
    },
    {
      id: 6, title: 'Wisdom Eye (Course 1) - Laying the Foundation for Success', price: '₹150.00',
      url: 'https://voicepublication.in/products/wisdom-eye',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/WisdomEye-cover.jpg?v=1780304483',
    },
    {
      id: 12, title: 'GAME Positive Thinker (Course 1, 2, 4 & 6)', price: '₹120.00 - ₹280.00',
      url: 'https://voicepublication.in/products/game-positive-thinker-course-1-2-6',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/GAME-PT-12.png?v=1764741397',
    },
    {
      id: 14, title: 'Discover Yourself', price: '₹160.00',
      url: 'https://voicepublication.in/products/discover-yourself',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/DYS-front.jpg?v=1764332893',
    },
    {
      id: 16, title: 'Art of Smart Work', price: '₹70.00',
      url: 'https://voicepublication.in/products/art-of-smart-work',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/ArtofSmartWork-Front.jpg?v=1756533599',
    },
    {
      id: 4, title: 'Your Secret Journey', price: '₹200.00',
      url: 'https://voicepublication.in/products/your-secret-journey',
      image: 'https://cdn.shopify.com/s/files/1/0614/8639/9543/files/YSJ-front.jpg?v=1764746566',
    },
  ],
  credentials: [
    { src: 'https://lh3.googleusercontent.com/d/19yYbEATwSgrOVfuKk339h6j6qVNY48Nw', alt: 'IIT Mumbai Topper' },
    { src: 'https://lh3.googleusercontent.com/d/1zHSviGsVWpcjqEEcDClEht0qNihIQ8qp', alt: 'Temple President ISKCON Pune' },
    { src: 'https://lh3.googleusercontent.com/d/1etXzaXu2p4rmW81PrMW6T-bHRfKIZzSQ', alt: 'Temple Management Council Member ISKCON Abids' },
    { src: 'https://lh3.googleusercontent.com/d/1vu3f15JL_oJ8LAiYq4WItoVSH4Of5uEz', alt: 'Global Duty Officer Youth Training ISKCON' },
  ],
  announcements: [],
};

export const EMPTY_HOME_CONFIG = {
  notificationBanner: {
    enabled: false,
    text: '',
    link: '',
    bgColor: '#1A1B4B',
    textColor: '#FF9F1C',
    dismissable: true,
  },
  sections: [
    { id: 'hero',        label: 'Hero Slider',      visible: false, order: 1 },
    { id: 'credentials', label: 'Credentials',       visible: false, order: 2 },
    { id: 'logos',       label: 'Corporate Logos',   visible: false, order: 3 },
    { id: 'featured',    label: 'Featured Cards',    visible: false, order: 4 },
    { id: 'about',       label: 'About Biography',   visible: false, order: 5 },
    { id: 'books',       label: 'Featured Books',    visible: false, order: 6 },
    { id: 'youtube',     label: 'YouTube Channel',   visible: false, order: 7 },
  ],
  pinnedVideos: [],
  heroSlides: [],
  featuredBooks: [],
  credentials: [],
  announcements: [],
};

