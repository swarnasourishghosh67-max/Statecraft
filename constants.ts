
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

const FIRST_NAMES = [
  "Alaric", "Cedric", "William", "James", "Henry", "Charlotte", "Eleanor", "Julian", "Silas", 
  "Bartholomew", "Isolde", "Godfrey", "Rowan", "Oswald", "Edmund", "Victor", "Frederick", 
  "Leopold", "Albert", "George", "Louis", "Charles", "Pierre", "Hans", "Otto", "Karl", 
  "Francis", "Sebastian", "Adrian", "Gabriel", "Thatcher", "Walter", "Geoffrey", "Matilda", 
  "Agnes", "Joan", "Balthazar", "Casimir", "Ezekiel", "Thaddeus", "Octavius", "Lucius", 
  "Cornelius", "Benedict", "Athanasius", "Cyprian", "Roderick", "Gawain", "Percival", 
  "Tristan", "Mordecai", "Absalom", "Zebulon", "Jedidiah", "Malachi", "Hezekiah", 
  "Maximilian", "Siegfried", "Wolfgang", "Ludwig", "Gustav", "Adolphus", "Bernhard", 
  "Dietrich", "Alphonse", "Bartholomé", "Étienne", "Gaspar", "Henri", "Jean-Pierre", 
  "Lazare", "Nicolas", "Olivier", "Rémy", "Alistair", "Barnaby", "Crispin", "Digby", 
  "Ephraim", "Fletcher", "Gideon", "Humphrey", "Ignatius", "Jasper", "Konrad", "Lysander", 
  "Montague", "Nigel", "Phineas", "Quentin", "Rufus", "Stellan", "Theodore", "Ulysses", 
  "Valentin", "Winston", "Xavier", "Yorick", "Zadok", "Ambrose", "Basil", "Cuthbert", 
  "Dorian", "Erasmus", "Fabian", "Giles", "Horatio", "Ivor", "Jocelyn", "Kenelm", 
  "Lambert", "Milo", "Neville", "Osmund", "Peregrine", "Quintus", "Rafe", "Swithin", 
  "Terence", "Urban", "Vernon", "Wilfred", "Amos", "Silas", "Cyrus", "Dante", "Elias", 
  "Felix", "Gaius", "Hugo", "Ivan", "Jude", "Klaus", "Lars", "Magnus", "Nico", "Orion"
];

const LAST_NAMES = [
  "Thatcher", "Blackwood", "Sterling", "Valois", "Habsburg", "Bourbon", "Plantagenet", 
  "Tudor", "Lancaster", "York", "Somerset", "Beaufort", "Hastings", "Neville", "Percy", 
  "Howard", "Grey", "Spencer", "Churchill", "Gladstone", "Disraeli", "Peel", "Russell", 
  "Palmerston", "Canning", "Pitt", "Fox", "Burke", "Miller", "Smith", "Baker", "Cook", 
  "Cooper", "Carter", "Fisher", "Gardner", "Potter", "Arkwright", "Baskerville", 
  "Cadwallader", "Drummond", "Eisner", "Fitzroy", "Grosvenor", "Hargreaves", "Ironwood", 
  "Jervis", "Killigrew", "Lovelace", "Maltravers", "Nightly", "Oglethorpe", "Pemberton", 
  "Quatermain", "Ravenscroft", "Stanhope", "Trevelyan", "Underwood", "Vavasour", 
  "Wainwright", "Xenakis", "Yardley", "Zouche", "Ashford", "Bridgerton", "Crawley", 
  "Darcy", "Elliot", "Ferrars", "Heathcliff", "Ingram", "Jekyll", "Knightley", "Linton", 
  "Morland", "Norris", "Osborne", "Pevensie", "Quick", "Rochester", "Steerforth", 
  "Tessier", "Ushant", "Wickham", "Yeobright", "Zimmerman", "Abberline", "Chiswick", 
  "Davenport", "Eastaugh", "Falconer", "Gaunt", "Hawthorne", "Inkpen", "Jakes", "Kendal", 
  "Latter", "Moon", "Nock", "Oldcastle", "Pike", "Quill", "Rudge", "Spurrell", "Thorne", 
  "Upcott", "Vesper", "Wren", "Yapp", "Zell", "Ames", "Boyle", "Crick", "Darwin", 
  "Evans", "Fleming", "Griffin", "Hale", "Irving", "Jarvis", "Keats", "Lowell"
];

const ORIGIN_TEMPLATES = [
  { 
    origin: Origin.PEASANT_SON, 
    titles: ["Kitchen Scullion", "Farm Hand", "Stable Boy", "Factory Drudge"],
    bio: "Born into the lower strata of society. Your early years were defined by hard labor and the rigid expectations of your betters."
  },
  { 
    origin: Origin.MERCHANT_SON, 
    titles: ["Clerk", "Ledger Boy", "Agent", "Apprentice"],
    bio: "The son of a middling tradesman. You understand the flow of coin and the weight of a signed contract better than most."
  },
  { 
    origin: Origin.SOLDIER_BRAT, 
    titles: ["Drummer Boy", "Squire", "Cadet", "Militiaman"],
    bio: "Raised in the shadow of barracks and battlefields. The smell of powder and the flash of steel are your oldest memories."
  },
  { 
    origin: Origin.STREET_URCHIN, 
    titles: ["Messenger", "Pickpocket", "Lookout", "Newsie"],
    bio: "A product of the city's dampest alleys. Wits and speed were your only inheritance."
  }
];

export const INITIAL_FACTIONS: Faction[] = [
  { id: 'f1', name: 'The Common People', influence: 20, opinion: 60, leader: 'Elias Thorne', leaderAmbition: 30, leaderFear: 70, secretsDiscovered: [], alliances: [] },
  { id: 'f2', name: 'The Religious Authority', influence: 45, opinion: 50, leader: 'High Cleric Marcus', leaderAmbition: 40, leaderFear: 40, secretsDiscovered: [], alliances: ['The Ruling Elite'] },
  { id: 'f3', name: 'The Ruling Elite', influence: 70, opinion: 25, leader: 'Lord Archduke', leaderAmbition: 85, leaderFear: 20, secretsDiscovered: [], alliances: ['The Church'] }
];

const INITIAL_TACTICS: TacticalProfile = {
  economicActions: 0,
  aggressiveActions: 0,
  diplomaticActions: 0,
  subterfugeActions: 0,
  successRate: 0,
  adaptationLevel: 1
};

export const getRandomInitialState = (existingLineage: any[] = []): GameState => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const charName = `${firstName} ${lastName}`;
  
  const template = ORIGIN_TEMPLATES[Math.floor(Math.random() * ORIGIN_TEMPLATES.length)];
  const charTitle = template.titles[Math.floor(Math.random() * template.titles.length)];
  
  const startYear = 1400 + Math.floor(Math.random() * 501); // Random year between 1400 and 1900
  
  const initialLog: LogEntry = {
    turn: 1,
    message: `The year is ${startYear} AD. You are ${charName}, currently serving as a ${charTitle}. ${template.bio} The winds of change are blowing across the continent, and power is a shifting tide. Your journey begins.`,
    type: 'NEUTRAL'
  };

  return {
    turn: 1, year: startYear, month: 1, 
    age: 15 + Math.floor(Math.random() * 10), 
    characterName: charName, rankTitle: charTitle, 
    traits: ["Observant"], publicImage: 50, nobleStanding: 15, clergyTrust: 40,
    treasury: 35, monthlyIncome: 4, monthlyExpenses: 2,
    health: 95, safety: 90, cunning: 25, spirit: 90,
    factions: INITIAL_FACTIONS, logs: [initialLog], 
    worldEvents: [{
      id: 'e-start-1',
      turn: 1,
      category: 'COURT',
      headline: `A New Era Dawns (${startYear} AD)`,
      body: `The world stands at a precipice. Whether it is the iron grip of feudalism or the rising steam of industry, the struggle for control remains eternal.`,
      impactLabel: 'HISTORICAL'
    }], 
    locationPath: ["Christendom", "Europe"],
    suggestions: ["Seek a patron", "Observe the markets", "Infiltrate local gatherings"],
    activeScenarios: [],
    discoveredRegions: [],
    lineage: existingLineage,
    tacticalProfile: INITIAL_TACTICS
  };
};

export const formatCurrency = (amount: number) => `●${amount.toLocaleString()}`;
