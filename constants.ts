
import { Faction, GameState, MapNode, Origin, WorldEvent, LogEntry, TacticalProfile } from './types';

export const WORLD_MAP: MapNode = {
  id: 'christendom_root',
  name: "Europe & The Mediterranean",
  type: 'REALM',
  children: [
    { id: 'realm_france', name: "Kingdom of France", type: 'REALM' },
    { id: 'realm_england', name: "Kingdom of England", type: 'REALM' },
    { id: 'realm_hre', name: "Holy Roman Empire", type: 'REALM' },
    { id: 'realm_castile', name: "Kingdom of Castile", type: 'REALM' },
    { id: 'realm_aragon', name: "Kingdom of Aragon", type: 'REALM' },
    { id: 'realm_papal', name: "Papal States", type: 'THEOCRACY' },
    { id: 'realm_venice', name: "Serene Republic of Venice", type: 'REPUBLIC' },
    { id: 'realm_scotland', name: "Kingdom of Scotland", type: 'REALM' },
    { id: 'realm_portugal', name: "Kingdom of Portugal", type: 'REALM' },
    { id: 'realm_hungary', name: "Kingdom of Hungary", type: 'REALM' },
    { id: 'realm_poland', name: "Kingdom of Poland", type: 'REALM' }
  ]
};

const CHARACTER_POOL = [
  { 
    name: "Alaric Thatcher", 
    origin: Origin.PEASANT_SON, 
    title: "Kitchen Scullion",
    bio: "Born in a thatched hovel near the edge of the lord's forest. Your childhood was spent gathering fallen branches and dodging the overseer's lash. Now, you toil in the soot-stained kitchens of the local manor, scraping grease and dreaming of the high table."
  },
  { 
    name: "Cedric of Kent", 
    origin: Origin.SOLDIER_BRAT, 
    title: "Stable Boy",
    bio: "The son of a broken pikeman, you were raised in the baggage trains of a dozen minor campaigns. You know the smell of iron and horseflesh better than the scent of home. You spend your days mucking stalls and tending to the destriers of knights who don't know your name."
  },
  { 
    name: "Elara Vane", 
    origin: Origin.STREET_URCHIN, 
    title: "Messenger",
    bio: "A product of the damp, winding alleys of the capital. You survived on wits and whatever fell from merchant carts. Your legs are fast and your ears are sharp; you earn your bread by carrying whispers and letters across the city's divide."
  },
  { 
    name: "Brother Thomas", 
    origin: Origin.MONASTERY_WAIF, 
    title: "Scribe's Apprentice",
    bio: "Found at the abbey gates on a winter morning. You were raised by the silence of the library and the rhythm of the bells. You spend your waking hours hunched over parchment, your fingers stained with oak gall ink, recording the deeds of men you will never meet."
  }
];

export const INITIAL_FACTIONS: Faction[] = [
  { id: 'f1', name: 'The Local Peasantry', influence: 15, opinion: 65, leader: 'Old Miller Wat', leaderAmbition: 20, leaderFear: 80, secretsDiscovered: [], alliances: [] },
  { id: 'f2', name: 'The Holy Mother Church', influence: 40, opinion: 50, leader: 'Abbot Jerome', leaderAmbition: 50, leaderFear: 30, secretsDiscovered: [], alliances: ['The High Peerage'] },
  { id: 'f3', name: 'The High Peerage', influence: 75, opinion: 20, leader: 'Count William IV', leaderAmbition: 90, leaderFear: 10, secretsDiscovered: [], alliances: ['The Church'] }
];

const STARTING_EVENT: WorldEvent = {
  id: 'e-start-1',
  turn: 1,
  category: 'COURT',
  headline: 'The Great Famine Recedes',
  body: 'The harvest of 1400 AD begins with a whisper of hope. While the plague still haunts the shadows of the cities, the wheat in the fields stands tall. The lords call for a tithe, and the peasants sharpen their scythes.',
  impactLabel: 'STABILITY'
};

const INITIAL_TACTICS: TacticalProfile = {
  economicActions: 0,
  aggressiveActions: 0,
  diplomaticActions: 0,
  subterfugeActions: 0,
  successRate: 0,
  adaptationLevel: 1
};

export const getRandomInitialState = (existingLineage: any[] = []): GameState => {
  const char = CHARACTER_POOL[Math.floor(Math.random() * CHARACTER_POOL.length)];
  
  const initialLog: LogEntry = {
    turn: 1,
    message: `You are ${char.name}, and you serve as a ${char.title}. ${char.bio} The year is 1400 AD, and the world is a dangerous place for a soul of low birth. Your journey begins here, in the shadow of power.`,
    type: 'NEUTRAL'
  };

  return {
    turn: 1, year: 1400, month: 1, 
    age: 14 + Math.floor(Math.random() * 4), 
    characterName: char.name, rankTitle: char.title, 
    traits: ["Observant"], publicImage: 50, nobleStanding: 10, clergyTrust: 35,
    treasury: 25, monthlyIncome: 3, monthlyExpenses: 1,
    health: 90, safety: 85, cunning: 20, spirit: 90,
    factions: INITIAL_FACTIONS, logs: [initialLog], 
    worldEvents: [STARTING_EVENT], locationPath: ["Christendom", "Europe"],
    suggestions: ["Listen at the pantry door", "Steal a loaf of bread", "Inquire about the lord's health"],
    activeScenarios: [],
    discoveredRegions: [],
    lineage: existingLineage,
    tacticalProfile: INITIAL_TACTICS
  };
};

export const formatCurrency = (amount: number) => `●${amount.toLocaleString()}`;
