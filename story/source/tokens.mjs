export const COLORS = Object.freeze({
  mist: '#F2F7EF',
  deep: '#143C35',
  blue: '#0759A5',
  green: '#168F61',
  yellow: '#F6C700',
  white: '#FFFFFF',
});

export const STORY = Object.freeze({
  width: 1080,
  height: 1920,
  marginX: 72,
  safeTop: 120,
  safeBottom: 180,
  header: Object.freeze({
    logoX: 72,
    logoY: 132,
    logoWidth: 390,
    logoHeight: 92,
    yearX: 842,
    yearY: 145,
    yearWidth: 166,
    yearHeight: 66,
  }),
  card: Object.freeze({
    x: 72,
    firstY: 300,
    width: 936,
    height: 210,
    gap: 18,
    radius: 28,
    padding: 20,
    photoSize: 170,
    photoRadius: 22,
    textX: 282,
    textWidth: 500,
    numberX: 812,
    numberY: 50,
    numberWidth: 176,
    numberHeight: 110,
    numberRadius: 22,
  }),
  footer: Object.freeze({ x: 0, y: 1668, width: 1080, height: 72 }),
});

export const SLOT_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'federalDeputy', label: 'DEPUTADO FEDERAL', digits: 4 }),
  Object.freeze({ key: 'stateOrDistrictDeputy', label: 'DEPUTADO ESTADUAL', digits: 5 }),
  Object.freeze({ key: 'senatorFirstSeat', label: 'SENADOR · 1ª VAGA', digits: 3 }),
  Object.freeze({ key: 'senatorSecondSeat', label: 'SENADOR · 2ª VAGA', digits: 3 }),
  Object.freeze({ key: 'governor', label: 'GOVERNADOR', digits: 2 }),
  Object.freeze({ key: 'president', label: 'PRESIDENTE', digits: 2 }),
]);

export function getSlotDefinitions(uf = '') {
  const normalized = String(uf).trim().toUpperCase();

  return SLOT_DEFINITIONS.map((slot, index) => (
    index === 1 && normalized === 'DF'
      ? { ...slot, label: 'DEPUTADO DISTRITAL' }
      : { ...slot }
  ));
}
