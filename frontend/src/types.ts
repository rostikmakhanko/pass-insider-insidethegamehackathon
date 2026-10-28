export type VectorType = 'ground' | 'aerial' | 'through';

export type TacticalTool = 
  | 'select' 
  | 'ground' 
  | 'aerial' 
  | 'through' 
  | 'caliper' 
  | 'polygon' 
  | 'grid' 
  | 'layers';

export type TabType = 'workbench' | 'matrix' | 'voronoi' | 'vault';

export interface Player {
  id: string;
  num: number;
  name: string;
  pos: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  passes: string;
  pct: string;
  xt: string;
  prog: number;
  role?: string;
}

export interface PassVector {
  id: string;
  from: string; // player id
  to: string; // player id
  type: VectorType;
  xt: string;
  dist: string;
  vel: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  initial: string;
  color: string;
  textColor: string;
  formation: string;
  formationType: string;
  possession: string;
  passSucc: string;
  ppda?: string;
  transitions?: string;
  players: Player[];
}

export interface MatchSession {
  id: string;
  title: string;
  competition: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  vectors: PassVector[];
  kpis: {
    passAcc: string;
    passAccDelta: string;
    avgPassDist: string;
    tempo: string;
    xt: string;
    progPasses: number;
    finalThird: number;
    territorialTilt: string;
    dominantStatus: string;
  };
}
