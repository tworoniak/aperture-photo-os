import type { Gallery } from '@/types';

export const mockGalleries: Gallery[] = [
  {
    id: 'gal1',
    clientId: 'c1',
    shootId: 's1',
    title: 'Sarah Mitchell — Wedding',
    publicToken: 'sm-wedding-2026',
    expiresAt: '2026-06-22',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        status: 'approved',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
        status: 'favourite',
        clientComment: 'I love this one!',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
        status: 'approved',
      },
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p5',
        url: 'https://images.unsplash.com/photo-1529637008965-ff25ac7f0c88?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1529637008965-ff25ac7f0c88?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p6',
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400',
        status: 'rejected',
        clientComment: 'Eyes closed on this one',
      },
      {
        id: 'p7',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p8',
        url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400',
        status: 'approved',
      },
      {
        id: 'p9',
        url: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p10',
        url: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=400',
        status: 'favourite',
        clientComment: 'Print this one please!',
      },
    ],
  },
  {
    id: 'gal2',
    clientId: 'c2',
    shootId: 's2',
    title: 'James & Priya Okafor — Engagement',
    publicToken: 'okafor-engagement-2026',
    expiresAt: '2026-06-25',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400',
        status: 'unreviewed',
      },
      {
        id: 'p5',
        url: 'https://images.unsplash.com/photo-1529636444744-adffc9135a5e?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1529636444744-adffc9135a5e?w=400',
        status: 'unreviewed',
      },
    ],
  },
  {
    id: 'gal3',
    clientId: 'c5',
    shootId: 's5',
    title: 'Derek Paulson — Headshots',
    publicToken: 'paulson-headshots-2026',
    expiresAt: '2026-04-15',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        status: 'approved',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        status: 'favourite',
        clientComment: 'Use this for LinkedIn',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        status: 'approved',
      },
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        status: 'rejected',
      },
    ],
  },
];
