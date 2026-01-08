
import { Faction, GameState, MapNode, Origin } from './types';

export const WORLD_MAP: MapNode = {
  id: 'christendom_root',
  name: "Christendom",
  type: 'REALM',
  children: [
    {
      id: 'realm_france',
      name: "Kingdom of France",
      type: 'REALM',
      nobilityTitle: "King",
      nobilityRuler: "Charles VI 'The Mad'",
      children: [
        {
          id: 'duchy_aquitaine',
          name: "Duchy of Aquitaine",
          type: 'DUCHY',
          nobilityRuler: "John of Gaunt",
          children: [
            { id: 'county_poitou', name: "Poitou", type: 'COUNTY', nobilityRuler: "William IV", children: [
              { id: 'city_lusignan', name: "Lusignan", type: 'CITY', nobilityRuler: "Lord Guy", churchRuler: "Abbot Jerome" }
            ]}
          ]
        },
        { id: 'duchy_burgundy', name: "Duchy of Burgundy", type: 'DUCHY', nobilityRuler: "Philip the Bold" }
      ]
    },
    {
      id: 'realm_england',
      name: "Kingdom of England",
      type: 'REALM',
      nobilityTitle: "King",
      nobilityRuler: "Henry IV",
      children: [
        { id: 'duchy_lancaster', name: "Duchy of Lancaster", type: 'DUCHY', nobilityRuler: "Henry of Monmouth" },
        { id: 'principality_wales', name: "Principality of Wales", type: 'DUCHY', nobilityRuler: "Owain Glyndŵr (Rebel)" }
      ]
    },
    {
      id: 'realm_hre',
      name: "Holy Roman Empire",
      type: 'REALM',
      nobilityTitle: "Emperor",
      nobilityRuler: "Wenceslaus IV",
      children: [
        { id: 'kingdom_bohemia', name: "Kingdom of Bohemia", type: 'DUCHY', nobilityRuler: "Sigismund" },
        { id: 'duchy_austria', name: "Duchy of Austria", type: 'DUCHY', nobilityRuler: "Albert IV" }
      ]
    },
    {
      id: 'realm_castile',
      name: "Kingdom of Castile",
      type: 'REALM',
      nobilityRuler: "Henry III",
      children: [{ id: 'county_toledo', name: "Toledo", type: 'COUNTY' }]
    },
    {
      id: 'realm_aragon',
      name: "Kingdom of Aragon",
      type: 'REALM',
      nobilityRuler: "Martin the Elder"
    },
    {
      id: 'realm_papal',
      name: "The Papal States",
      type: 'THEOCRACY',
      churchTitle: "Pope",
      churchRuler: "Boniface IX"
    },
    {
      id: 'realm_venice',
      name: "Republic of Venice",
      type: 'REPUBLIC',
      nobilityTitle: "Doge",
      nobilityRuler: "Michele Steno"
    },
    {
      id: 'realm_naples',
      name: "Kingdom of Naples",
      type: 'REALM',
      nobilityRuler: "Ladislaus of Naples"
    },
    {
      id: 'realm_poland',
      name: "Kingdom of Poland",
      type: 'REALM',
      nobilityRuler: "Władysław II Jagiełło"
    }
  ]
};

const CHARACTER_POOL = [
  { name: "Alaric Thatcher", origin: Origin.PEASANT_SON, title: "Kitchen Scullion" },
  { name: "Cedric of Kent", origin: Origin.SOLDIER_BRAT, title: "Stable Boy" },
  { name: "Elara Vane", origin: Origin.STREET_URCHIN, title: "Messenger" },
  { name: "Brother Thomas", origin: Origin.MONASTERY_WAIF, title: "Scribe's Apprentice" },
  { name: "Kaelen Stout", origin: Origin.BLACKSMITH_APPRENTICE, title: "Bellows-Blower" },
  { name: "Silas Mercer", origin: Origin.MERCHANT_SON, title: "Ledger Assistant" },
  { name: "Gwenna the Weaver", origin: Origin.PEASANT_SON, title: "Chamber Maid" },
  { name: "Hugo the Bold", origin: Origin.SOLDIER_BRAT, title: "Squire-in-Waiting" }
];

export const INITIAL_FACTIONS: Faction[] = [
  { id: 'f1', name: 'The Lusignan Peasantry', influence: 15, opinion: 65, leader: 'Old Miller Wat', leaderAmbition: 20, leaderFear: 80, secretsDiscovered: [], alliances: [] },
  { id: 'f2', name: 'The Abbey of St. Jude', influence: 40, opinion: 50, leader: 'Abbot Jerome', leaderAmbition: 50, leaderFear: 30, secretsDiscovered: [], alliances: ['The County Nobility'] },
  { id: 'f3', name: 'The County Nobility', influence: 75, opinion: 20, leader: 'Count William IV', leaderAmbition: 90, leaderFear: 10, secretsDiscovered: [], alliances: ['The Abbey of St. Jude'] }
];

export const getRandomInitialState = (): GameState => {
  const char = CHARACTER_POOL[Math.floor(Math.random() * CHARACTER_POOL.length)];
  
  return {
    turn: 1, 
    year: 1400, 
    month: 1, 
    age: 14 + Math.floor(Math.random() * 4), 
    characterName: char.name, 
    rankTitle: char.title, 
    traits: ["Observant"],
    publicImage: 50, 
    nobleStanding: 10, 
    clergyTrust: 35,
    treasury: 25, 
    monthlyIncome: 3, 
    monthlyExpenses: 1,
    health: 100, 
    safety: 85, 
    cunning: 20, 
    spirit: 90,
    factions: INITIAL_FACTIONS, 
    spies: [], 
    logs: [{ 
      turn: 1, 
      message: `In the shadow of Lusignan Castle, ${char.name} begins a journey. The air is cold, but your resolve is burning. You are currently a ${char.title}, yet the chronicles have a blank page reserved for your name.`, 
      type: 'NEUTRAL' 
    }],
    worldEvents: [{ 
      id: 'e1', 
      turn: 1, 
      category: 'WAR', 
      headline: "A Season of Truce", 
      body: "Conflict in the north has stalled. While the great lords argue over borders, the common folk breathe a sigh of relief.", 
      impactLabel: "Security is stable for now." 
    }],
    locationPath: ["Christendom", "Kingdom of France", "Duchy of Aquitaine", "County of Poitou", "Lusignan"],
    notifications: [],
    suggestions: ["Listen at the pantry door", "Save scraps for the poor", "Offer to sharpen the guards' blades"],
    activeScenarios: []
  };
};

export const formatCurrency = (amount: number) => `●${amount.toLocaleString()}`;
