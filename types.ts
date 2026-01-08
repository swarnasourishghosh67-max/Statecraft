
export enum Origin {
  PEASANT_SON = 'PEASANT_SON',
  MERCHANT_SON = 'MERCHANT_SON',
  MONASTERY_WAIF = 'MONASTERY_WAIF',
  SOLDIER_BRAT = 'SOLDIER_BRAT',
  BLACKSMITH_APPRENTICE = 'BLACKSMITH_APPRENTICE',
  STREET_URCHIN = 'STREET_URCHIN'
}

export type TimeScale = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | '5_YEARS';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface POI {
  type: 'THREAT' | 'WEALTH' | 'INTEL' | 'GENERAL';
  name: string;
  description: string;
}

export interface WorldEvent {
  id: string;
  turn: number;
  category: 'WAR' | 'PLAGUE' | 'HERESY' | 'TRADE' | 'COURT';
  headline: string;
  body: string;
  impactLabel: string;
}

export interface MapNode {
  id: string;
  name: string;
  type: 'REALM' | 'DUCHY' | 'COUNTY' | 'CITY' | 'VILLAGE' | 'CASTLE' | 'REPUBLIC' | 'THEOCRACY';
  nobilityTitle?: string;
  nobilityRuler?: string;
  churchTitle?: string;
  churchRuler?: string;
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

export interface SpyNetwork {
  location: string;
  efficiency: number;
  isBurned: boolean;
}

export interface LogEntry {
  turn: number;
  message: string;
  whisper?: string;
  rippleEffect?: string;
  type: 'NEUTRAL' | 'VIOLENT' | 'SUCCESS' | 'SETBACK' | 'HARDSHIP' | 'LEVEL_UP' | 'WHISPER';
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
  spies: SpyNetwork[];
  logs: LogEntry[];
  worldEvents: WorldEvent[]; 
  locationPath: string[];
  notifications: Notification[];
  suggestions: string[];
  activeScenarios: string[]; // Track ongoing story threads for continuity
}

export interface AIResponse {
  narrative: string;
  whisper?: string;
  rippleContext?: string;
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
    updatedScenarios?: string[]; // AI manages active story threads
  };
  suggestions: string[];
  gameOver?: boolean;
  gameOverReason?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'THREAT' | 'PLOT' | 'INFO' | 'RIPPLE';
  isRead: boolean;
  actionRequired?: boolean;
}
