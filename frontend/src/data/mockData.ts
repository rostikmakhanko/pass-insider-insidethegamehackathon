import { MatchSession, Team } from '../types';

export const MANCHESTER_BLUE: Team = {
  id: 'home',
  name: 'MANCHESTER BLUE',
  shortName: 'Man Blue',
  initial: 'M',
  color: '#0284c7',
  textColor: '#ffffff',
  formation: '4-3-3',
  formationType: '4-3-3 ATTACKING',
  possession: '58.4%',
  passSucc: '89.2%',
  players: [
    { id: 'h1', num: 1, name: 'Ederson', pos: 'GK', x: 8, y: 50, passes: '28/31', pct: '90%', xt: '+0.04', prog: 2, role: 'Sweeper Keeper' },
    { id: 'h2', num: 2, name: 'K. Walker', pos: 'RB', x: 26, y: 84, passes: '54/59', pct: '91%', xt: '+0.12', prog: 5, role: 'Inverted Full-Back' },
    { id: 'h5', num: 5, name: 'J. Stones', pos: 'CB', x: 22, y: 62, passes: '68/72', pct: '94%', xt: '+0.18', prog: 7, role: 'Ball Playing Defender' },
    { id: 'h3', num: 3, name: 'R. Dias', pos: 'CB', x: 22, y: 38, passes: '74/77', pct: '96%', xt: '+0.09', prog: 4, role: 'Central Anchor' },
    { id: 'h24', num: 24, name: 'J. Gvardiol', pos: 'LB', x: 26, y: 16, passes: '61/68', pct: '89%', xt: '+0.21', prog: 6, role: 'Wide Overloader' },
    { id: 'h16', num: 16, name: 'Rodri', pos: 'DM', x: 38, y: 50, passes: '88/93', pct: '94%', xt: '+0.36', prog: 11, role: 'Deep-Lying Playmaker' },
    { id: 'h17', num: 17, name: 'K. De Bruyne', pos: 'AM', x: 44, y: 70, passes: '46/55', pct: '83%', xt: '+0.58', prog: 14, role: 'Mezzala / Half-Space Creator' },
    { id: 'h20', num: 20, name: 'B. Silva', pos: 'CM', x: 43, y: 32, passes: '58/63', pct: '92%', xt: '+0.27', prog: 8, role: 'Roaming Playmaker' },
    { id: 'h47', num: 47, name: 'P. Foden', pos: 'RW', x: 49, y: 82, passes: '39/44', pct: '88%', xt: '+0.41', prog: 9, role: 'Inside Forward' },
    { id: 'h10', num: 10, name: 'J. Grealish', pos: 'LW', x: 49, y: 18, passes: '41/46', pct: '89%', xt: '+0.33', prog: 8, role: 'Wide Controller / Isolator' },
    { id: 'h9', num: 9, name: 'E. Haaland', pos: 'ST', x: 50, y: 50, passes: '16/20', pct: '80%', xt: '+0.49', prog: 4, role: 'Target Poacher' }
  ]
};

export const REAL_MADRID: Team = {
  id: 'away',
  name: 'REAL MADRID CF',
  shortName: 'Real Madrid',
  initial: 'R',
  color: '#c00815',
  textColor: '#ffffff',
  formation: '4-3-3',
  formationType: '4-3-3 TRANSITION',
  possession: '41.6%',
  passSucc: '84.8%',
  ppda: '9.2',
  transitions: '18 High',
  players: [
    { id: 'a1', num: 1, name: 'T. Courtois', pos: 'GK', x: 92, y: 50, passes: '24/29', pct: '82%', xt: '+0.02', prog: 1, role: 'Traditional Shot Stopper' },
    { id: 'a2', num: 2, name: 'D. Carvajal', pos: 'RB', x: 74, y: 16, passes: '45/52', pct: '86%', xt: '+0.15', prog: 6, role: 'Attacking Full-Back' },
    { id: 'a3', num: 3, name: 'E. Militão', pos: 'CB', x: 78, y: 38, passes: '52/56', pct: '92%', xt: '+0.08', prog: 3, role: 'Stopper' },
    { id: 'a22', num: 22, name: 'A. Rüdiger', pos: 'CB', x: 78, y: 62, passes: '59/64', pct: '92%', xt: '+0.11', prog: 4, role: 'Aggressive Cover CB' },
    { id: 'a23', num: 23, name: 'F. Mendy', pos: 'LB', x: 74, y: 84, passes: '38/42', pct: '90%', xt: '+0.10', prog: 4, role: 'Defensive Full-Back' },
    { id: 'a8', num: 8, name: 'T. Kroos', pos: 'CM', x: 64, y: 34, passes: '82/87', pct: '94%', xt: '+0.42', prog: 12, role: 'Metronome / Tempo Controller' },
    { id: 'a12', num: 12, name: 'E. Camavinga', pos: 'DM', x: 62, y: 50, passes: '51/55', pct: '92%', xt: '+0.19', prog: 7, role: 'Dynamic Ball Winner' },
    { id: 'a15', num: 15, name: 'F. Valverde', pos: 'CM', x: 64, y: 66, passes: '48/54', pct: '88%', xt: '+0.29', prog: 8, role: 'Box-to-Box Engine' },
    { id: 'a5', num: 5, name: 'J. Bellingham', pos: 'AM', x: 57, y: 50, passes: '42/48', pct: '87%', xt: '+0.39', prog: 9, role: 'Shadow Striker / Raumdeuter' },
    { id: 'a11', num: 11, name: 'Rodrygo', pos: 'RW', x: 53, y: 22, passes: '31/37', pct: '83%', xt: '+0.34', prog: 6, role: 'Inverted Channel Runner' },
    { id: 'a7', num: 7, name: 'Vinícius Jr.', pos: 'LW', x: 53, y: 78, passes: '29/36', pct: '80%', xt: '+0.52', prog: 10, role: 'Direct Break Winger' }
  ]
};

export const INITIAL_VECTORS = [
  { id: 'v1', from: 'h1', to: 'h5', type: 'ground' as const, xt: '+0.03', dist: '18m', vel: '14m/s' },
  { id: 'v2', from: 'h5', to: 'h16', type: 'ground' as const, xt: '+0.11', dist: '22m', vel: '16m/s' },
  { id: 'v3', from: 'h16', to: 'h17', type: 'ground' as const, xt: '+0.24', dist: '24m', vel: '18m/s' },
  { id: 'v4', from: 'h17', to: 'h9', type: 'through' as const, xt: '+0.38', dist: '26m', vel: '21m/s' },
  { id: 'v5', from: 'h24', to: 'h10', type: 'aerial' as const, xt: '+0.18', dist: '32m', vel: '19m/s' },
  { id: 'v6', from: 'a8', to: 'a7', type: 'through' as const, xt: '+0.34', dist: '38m', vel: '22m/s' }
];

export const MOCK_MATCH_SESSIONS: MatchSession[] = [
  {
    id: 'session-ucl-final',
    title: 'Manchester Blue vs Real Madrid - UCL Final Q1 24\'',
    competition: 'UEFA Champions League · Final Knockout Phase',
    date: '2024-05-28',
    homeTeam: MANCHESTER_BLUE,
    awayTeam: REAL_MADRID,
    vectors: INITIAL_VECTORS,
    kpis: {
      passAcc: '88.6%',
      passAccDelta: '+3.2% vs avg',
      avgPassDist: '19.4m',
      tempo: 'Tempo: Rapid',
      xt: '+1.48',
      progPasses: 22,
      finalThird: 14,
      territorialTilt: '64% / 36%',
      dominantStatus: 'Dominant'
    }
  },
  {
    id: 'session-arsenal-liverpool',
    title: 'Arsenal FC vs Liverpool FC - Premier League Dec 24\'',
    competition: 'English Premier League · Matchday 18',
    date: '2024-12-23',
    homeTeam: {
      ...MANCHESTER_BLUE,
      name: 'ARSENAL FC',
      shortName: 'Arsenal',
      initial: 'A',
      color: '#dc2626',
      possession: '54.2%',
      passSucc: '87.1%'
    },
    awayTeam: {
      ...REAL_MADRID,
      name: 'LIVERPOOL FC',
      shortName: 'Liverpool',
      initial: 'L',
      color: '#0284c7',
      possession: '45.8%',
      passSucc: '83.9%'
    },
    vectors: [
      { id: 'av1', from: 'h1', to: 'h3', type: 'ground', xt: '+0.02', dist: '21m', vel: '15m/s' },
      { id: 'av2', from: 'h3', to: 'h16', type: 'ground', xt: '+0.14', dist: '25m', vel: '17m/s' },
      { id: 'av3', from: 'h16', to: 'h47', type: 'through', xt: '+0.32', dist: '31m', vel: '20m/s' }
    ],
    kpis: {
      passAcc: '85.4%',
      passAccDelta: '+1.8% vs avg',
      avgPassDist: '21.2m',
      tempo: 'Tempo: High',
      xt: '+1.24',
      progPasses: 19,
      finalThird: 11,
      territorialTilt: '55% / 45%',
      dominantStatus: 'Balanced'
    }
  },
  {
    id: 'session-inter-barca',
    title: 'Inter Milan vs FC Barcelona - UCL Semi-Final',
    competition: 'UEFA Champions League · Semi-Final',
    date: '2024-04-16',
    homeTeam: {
      ...MANCHESTER_BLUE,
      name: 'INTER MILAN',
      shortName: 'Inter',
      initial: 'I',
      color: '#1d4ed8',
      possession: '42.0%',
      passSucc: '81.5%'
    },
    awayTeam: {
      ...REAL_MADRID,
      name: 'FC BARCELONA',
      shortName: 'Barça',
      initial: 'B',
      color: '#b91c1c',
      possession: '58.0%',
      passSucc: '90.2%'
    },
    vectors: [
      { id: 'bv1', from: 'h1', to: 'h2', type: 'ground', xt: '+0.01', dist: '16m', vel: '13m/s' },
      { id: 'bv2', from: 'h2', to: 'h17', type: 'aerial', xt: '+0.28', dist: '36m', vel: '19m/s' }
    ],
    kpis: {
      passAcc: '82.9%',
      passAccDelta: '-1.2% vs avg',
      avgPassDist: '24.1m',
      tempo: 'Tempo: Direct',
      xt: '+0.98',
      progPasses: 15,
      finalThird: 9,
      territorialTilt: '41% / 59%',
      dominantStatus: 'Counter'
    }
  }
];

export const FORMATION_PRESETS = [
  {
    id: '433-attack',
    name: '4-3-3 Attacking',
    coords: [
      { x: 8, y: 50 },
      { x: 26, y: 84 },
      { x: 22, y: 62 },
      { x: 22, y: 38 },
      { x: 26, y: 16 },
      { x: 38, y: 50 },
      { x: 44, y: 70 },
      { x: 43, y: 32 },
      { x: 49, y: 82 },
      { x: 49, y: 18 },
      { x: 50, y: 50 }
    ]
  },
  {
    id: '4231-highpress',
    name: '4-2-3-1 High Press',
    coords: [
      { x: 9, y: 50 },
      { x: 28, y: 86 },
      { x: 24, y: 64 },
      { x: 24, y: 36 },
      { x: 28, y: 14 },
      { x: 36, y: 60 },
      { x: 36, y: 40 },
      { x: 46, y: 50 },
      { x: 48, y: 80 },
      { x: 48, y: 20 },
      { x: 52, y: 50 }
    ]
  },
  {
    id: '3241-box',
    name: '3-2-4-1 Box Midfield',
    coords: [
      { x: 8, y: 50 },
      { x: 22, y: 75 },
      { x: 20, y: 50 },
      { x: 22, y: 25 },
      { x: 33, y: 60 },
      { x: 33, y: 40 },
      { x: 44, y: 62 },
      { x: 44, y: 38 },
      { x: 48, y: 86 },
      { x: 48, y: 14 },
      { x: 51, y: 50 }
    ]
  },
  {
    id: '532-lowblock',
    name: '5-3-2 Low Block',
    coords: [
      { x: 7, y: 50 },
      { x: 18, y: 88 },
      { x: 16, y: 68 },
      { x: 15, y: 50 },
      { x: 16, y: 32 },
      { x: 18, y: 12 },
      { x: 28, y: 65 },
      { x: 26, y: 50 },
      { x: 28, y: 35 },
      { x: 42, y: 60 },
      { x: 42, y: 40 }
    ]
  }
];
