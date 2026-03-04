export type Region = 'UK' | 'EU' | 'CARNIVAL' | 'CONCERT';

export interface Festival {
  id: string;
  name: string;
  location: string;
  dates: string;
  region: Region;
  genres: string[];
  accentColor: string;
  aggroScore: number;
  firstTimerScore: number;
  description: string;
}

export const FESTIVALS: Festival[] = [
  {
    id: 'creamfields-2026',
    name: 'Creamfields',
    location: 'Daresbury, Cheshire, UK',
    dates: 'Aug 21–24, 2026',
    region: 'UK',
    genres: ['House', 'Techno', 'Dance'],
    accentColor: '#00f5ff',
    aggroScore: 5,
    firstTimerScore: 7,
    description: 'The UK\'s biggest dance music festival — four days of relentless beats in a field.',
  },
  {
    id: 'terminal-v-2026',
    name: 'Terminal V',
    location: 'Edinburgh, Scotland, UK',
    dates: 'Oct 31 – Nov 1, 2026',
    region: 'UK',
    genres: ['Techno', 'Industrial', 'Dark Electro'],
    accentColor: '#ff00ff',
    aggroScore: 8,
    firstTimerScore: 4,
    description: 'Scotland\'s most intense indoor techno event — not for the faint-hearted.',
  },
  {
    id: 'parklife-2026',
    name: 'Parklife',
    location: 'Heaton Park, Manchester, UK',
    dates: 'Jun 13–14, 2026',
    region: 'UK',
    genres: ['Electronic', 'Grime', 'Dance', 'Indie'],
    accentColor: '#00ff88',
    aggroScore: 4,
    firstTimerScore: 8,
    description: 'Manchester\'s flagship urban festival blending dance, grime and good vibes.',
  },
  {
    id: 'glastonbury-2026',
    name: 'Glastonbury',
    location: 'Worthy Farm, Somerset, UK',
    dates: 'Jun 24–28, 2026',
    region: 'UK',
    genres: ['Mixed', 'Rock', 'Electronic', 'Everything'],
    accentColor: '#ffcc00',
    aggroScore: 3,
    firstTimerScore: 9,
    description: 'The legendary Somerset mudfield where every genre collides under the Pyramid stage.',
  },
  {
    id: 'notting-hill-carnival-2026',
    name: 'Notting Hill Carnival',
    location: 'Notting Hill, London, UK',
    dates: 'Aug 23–24, 2026',
    region: 'CARNIVAL',
    genres: ['Dancehall', 'Soca', 'Reggae', 'Afrobeats'],
    accentColor: '#ff8c00',
    aggroScore: 6,
    firstTimerScore: 6,
    description: 'Europe\'s biggest street party — two million people, steel drums, and jerk chicken.',
  },
  {
    id: 'tomorrowland-2026',
    name: 'Tomorrowland',
    location: 'Boom, Belgium, EU',
    dates: 'Jul 17–19 & Jul 24–26, 2026',
    region: 'EU',
    genres: ['EDM', 'Trance', 'House', 'Techno'],
    accentColor: '#7b2fff',
    aggroScore: 4,
    firstTimerScore: 8,
    description: 'The world\'s most theatrical festival — fairy-tale stages, global headliners, sold out in minutes.',
  },
  {
    id: 'o2-arena-2026',
    name: 'O2 Arena',
    location: 'Greenwich, London, UK',
    dates: 'Year-round',
    region: 'CONCERT',
    genres: ['Mixed', 'Live', 'Pop', 'Electronic'],
    accentColor: '#ff0040',
    aggroScore: 2,
    firstTimerScore: 10,
    description: 'London\'s premier indoor arena — world-class production, seated and standing shows.',
  },
  {
    id: 'houghton-2026',
    name: 'Houghton',
    location: 'Houghton Hall, Norfolk, UK',
    dates: 'Aug 12–16, 2026',
    region: 'UK',
    genres: ['Techno', 'Experimental', 'Ambient', 'Electronic'],
    accentColor: '#00f5ff',
    aggroScore: 5,
    firstTimerScore: 5,
    description: 'Craig Richards\' boutique Norfolk gathering where art, nature and deep techno collide.',
  },
];
