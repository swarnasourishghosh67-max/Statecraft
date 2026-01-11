
export enum Origin {
  PEASANT_SON = 'PEASANT_SON',
  MERCHANT_SON = 'MERCHANT_SON',
  MONASTERY_WAIF = 'MONASTERY_WAIF',
  SOLDIER_BRAT = 'SOLDIER_BRAT',
  BLACKSMITH_APPRENTICE = 'BLACKSMITH_APPRENTICE',
  STREET_URCHIN = 'STREET_URCHIN'
}

export type TimeScale = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | '5_YEARS';

export interface TacticalProfile {
  economicActions: number;
  aggressiveActions: number;
  diplomaticActions: number;
  subterfugeActions: number;
  successRate: number;
  adaptationLevel: number; // 0-100, increases as game learns player patterns
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WorldEvent {
  id: string;
  turn: number;
  category: 'WAR' | 'PLAGUE' | 'HERESY' | 'TRADE' | 'COURT';
  headline: string;
  body: string;
  impactLabel: string;
}

export interface FeudalMember {
  rank: string;
  name: string;
  influence: number;
}

export interface MapNode {
  id: string;
  name: string;
  type: 'REALM' | 'DUCHY' | 'COUNTY' | 'CITY' | 'VILLAGE' | 'CASTLE' | 'REPUBLIC' | 'THEOCRACY';
  nobilityTitle?: string;
  nobilityRuler?: string;
  churchTitle?: string;
  churchRuler?: string;
  hierarchy?: FeudalMember[];
  groundingUri?: string;
  children?: MapNode[];
}

export interface Faction {
  id: string;
  name: string;
  influence: number; 
  opinion: number;
  leader: string;
  leaderAmbition: number;
  leaderFear: number;
  secretsDiscovered: string[];
  alliances: string[];
}

export interface LogEntry {
  turn: number;
  message: string;
  whisper?: string;
  rippleEffect?: string;
  type: 'NEUTRAL' | 'VIOLENT' | 'SUCCESS' | 'SETBACK' | 'HARDSHIP' | 'LEVEL_UP' | 'WHISPER' | 'ADAPTATION';
}

export interface LegacyCharacter {
  name: string;
  rank: string;
  ageAtDeath: number;
  causeOfDeath: string;
  turnDied: number;
}

// Added missing Notification interface
export interface Notification {
  id: string;
  type: 'THREAT' | 'OPPORTUNITY' | 'EVENT';
  title: string;
  message: string;
  actionRequired?: boolean;
}

export interface GameState {
  turn: number;
  year: number;
  month: number;
  age: number;
  characterName: string;
  rankTitle: string;
  traits: string[];
  publicImage: number;
  nobleStanding: number;
  clergyTrust: number;
  treasury: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  health: number;
  safety: number;
  cunning: number;
  spirit: number;
  factions: Faction[];
  logs: LogEntry[];
  worldEvents: WorldEvent[]; 
  locationPath: string[];
  suggestions: string[];
  activeScenarios: string[];
  discoveredRegions: MapNode[];
  lineage: LegacyCharacter[];
  tacticalProfile: TacticalProfile; // Tracked AI/ML metadata
}

export interface AIResponse {
  narrative: string;
  whisper?: string;
  rippleContext?: string;
  adaptationNote?: string; // AI explains how it's adjusting the game
  stateUpdates: {
    treasuryChange: number;
    incomeChange: number;
    expenseChange: number;
    publicChange: number;
    nobleChange: number;
    clergyChange: number;
    cunningChange: number;
    safetyChange: number;
    healthChange: number;
    newTraits?: string[];
    newRankTitle?: string;
    newLocationPath?: string[];
    factionUpdates?: Partial<Faction>[];
    newWorldEvent?: WorldEvent; 
    updatedScenarios?: string[];
    adaptationIncrease?: number;
  };
  suggestions: string[];
  gameOver?: boolean;
  gameOverReason?: string;
}

export interface ExplorationResponse {
  hierarchy: FeudalMember[];
  churchInfo: { title: string; ruler: string };
  description: string;
  mapsUri?: string;
}
