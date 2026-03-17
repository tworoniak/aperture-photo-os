import type { Shoot } from '@/types';

export const mockShoots: Shoot[] = [
  {
    id: 's1',
    title: 'Sarah Mitchell — Wedding',
    clientName: 'Sarah Mitchell',
    bookingId: 'b1',
    date: '2026-03-22',
    location: 'Loose Park, Kansas City',
    locationNotes:
      'Meet at the main rose garden entrance on Wornall Rd. Parking lot is free on weekends. Backup location if rainy: The Nelson-Atkins Museum east lawn.',
    status: 'ready',
    shotList: [
      {
        id: 'sl1',
        text: 'Bride getting ready — detail shots (dress, shoes, rings)',
        checked: true,
      },
      { id: 'sl2', text: 'First look', checked: true },
      { id: 'sl3', text: 'Bridal party portraits', checked: true },
      { id: 'sl4', text: 'Ceremony wide establishing shot', checked: false },
      { id: 'sl5', text: 'Exchange of vows close-ups', checked: false },
      { id: 'sl6', text: 'Ring exchange', checked: false },
      { id: 'sl7', text: 'First kiss', checked: false },
      { id: 'sl8', text: 'Couple portraits — golden hour', checked: false },
      { id: 'sl9', text: 'Reception — first dance', checked: false },
      { id: 'sl10', text: 'Cake cutting', checked: false },
    ],
    moodBoard: [
      {
        id: 'mb1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        caption: 'Soft natural light',
      },
      {
        id: 'mb2',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
        caption: 'Garden ceremony',
      },
      {
        id: 'mb3',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
        caption: 'Golden hour portraits',
      },
    ],
    gearKitIds: ['g1', 'g3', 'g4', 'g7', 'g8'],
    isStandalone: false,
    notes: 'Client prefers candid moments over posed. Husband is camera shy.',
  },
  {
    id: 's2',
    title: 'James & Priya Okafor — Engagement',
    clientName: 'James & Priya Okafor',
    bookingId: 'b2',
    date: '2026-03-25',
    location: 'River Market, KC',
    locationNotes:
      'Start at the KC River Market around 4pm for street scene shots, then move to the Missouri River overlook for golden hour. Street parking on 5th St.',
    status: 'planning',
    shotList: [
      {
        id: 'sl1',
        text: 'Candid walk shots — River Market streets',
        checked: false,
      },
      { id: 'sl2', text: 'Close-up ring detail', checked: false },
      { id: 'sl3', text: 'Laughing/playful portraits', checked: false },
      {
        id: 'sl4',
        text: 'River overlook — wide environmental',
        checked: false,
      },
      { id: 'sl5', text: 'Golden hour backlit silhouette', checked: false },
    ],
    moodBoard: [
      {
        id: 'mb1',
        url: 'https://images.unsplash.com/photo-1529637008965-ff25ac7f0c88?w=400',
        caption: 'Urban candid',
      },
      {
        id: 'mb2',
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400',
        caption: 'Warm tones',
      },
    ],
    gearKitIds: ['g1', 'g3', 'g5'],
    isStandalone: false,
    notes:
      'Priya mentioned she loves film-style editing. Discuss preset options.',
  },
  {
    id: 's3',
    title: 'Spring styled shoot — florals',
    clientName: undefined,
    bookingId: undefined,
    date: '2026-04-10',
    location: 'Studio',
    locationNotes:
      'Home studio setup. Need to clear the east wall and set up the muslin backdrop.',
    status: 'planning',
    shotList: [
      {
        id: 'sl1',
        text: 'Flat lay — spring florals arrangement',
        checked: false,
      },
      { id: 'sl2', text: 'Detail shots — individual blooms', checked: false },
      { id: 'sl3', text: 'Model with floral crown', checked: false },
      { id: 'sl4', text: 'Window light portraits', checked: false },
    ],
    moodBoard: [
      {
        id: 'mb1',
        url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc21?w=400',
        caption: 'Spring florals',
      },
    ],
    gearKitIds: ['g1', 'g4', 'g7'],
    isStandalone: true,
    notes: 'Portfolio builder. Try pastel color grading.',
  },
  {
    id: 's4',
    title: 'Megan Torres — Newborn',
    clientName: 'Megan Torres',
    bookingId: 'b4',
    date: '2026-04-02',
    location: 'Studio',
    locationNotes:
      'Keep studio warm — minimum 75°F for newborn comfort. Set up the white wrap station first.',
    status: 'planning',
    shotList: [
      { id: 'sl1', text: 'Wrapped newborn — neutral basket', checked: false },
      { id: 'sl2', text: 'Parent hands with baby feet', checked: false },
      { id: 'sl3', text: 'Family of three portrait', checked: false },
      { id: 'sl4', text: 'Sibling introduction shot', checked: false },
      { id: 'sl5', text: 'Macro — tiny fingers/toes', checked: false },
    ],
    moodBoard: [],
    gearKitIds: ['g1', 'g4', 'g7'],
    isStandalone: false,
    notes:
      'Baby is 10 days old at shoot date. Schedule for when baby is fed and sleepy.',
  },
  {
    id: 's5',
    title: 'Derek Paulson — Headshots',
    clientName: 'Derek Paulson',
    bookingId: 'b5',
    date: '2026-01-15',
    location: 'Studio',
    status: 'completed',
    completedAt: '2026-01-15',
    locationNotes: '',
    shotList: [
      { id: 'sl1', text: 'Classic white background headshot', checked: true },
      { id: 'sl2', text: 'Dark background dramatic option', checked: true },
      {
        id: 'sl3',
        text: 'Casual lifestyle — bookshelf background',
        checked: true,
      },
      { id: 'sl4', text: 'LinkedIn crop variants', checked: true },
    ],
    moodBoard: [],
    gearKitIds: ['g1', 'g3', 'g7', 'g8'],
    isStandalone: false,
    notes: 'Delivered gallery Jan 18. Client very happy.',
  },
];
