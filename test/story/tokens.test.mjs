import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COLORS,
  SLOT_DEFINITIONS,
  STORY,
  getSlotDefinitions,
} from '../../story/source/tokens.mjs';

test('story geometry fits six equal cards between the approved safe areas', () => {
  assert.deepEqual(
    { width: STORY.width, height: STORY.height },
    { width: 1080, height: 1920 },
  );
  assert.equal(STORY.safeTop, 120);
  assert.equal(STORY.safeBottom, 180);
  assert.equal(STORY.marginX, 72);
  assert.equal(STORY.card.height, 210);
  assert.equal(STORY.card.gap, 18);
  assert.equal(STORY.card.photoSize, 170);
  assert.equal(SLOT_DEFINITIONS.length, 6);
  assert.equal(
    STORY.card.firstY
      + SLOT_DEFINITIONS.length * STORY.card.height
      + (SLOT_DEFINITIONS.length - 1) * STORY.card.gap,
    1650,
  );
});

test('slot definitions preserve voting order and number lengths', () => {
  assert.deepEqual(
    SLOT_DEFINITIONS.map(({ key, digits }) => [key, digits]),
    [
      ['federalDeputy', 4],
      ['stateOrDistrictDeputy', 5],
      ['senatorFirstSeat', 3],
      ['senatorSecondSeat', 3],
      ['governor', 2],
      ['president', 2],
    ],
  );
});

test('only DF switches the state legislative office label', () => {
  assert.equal(getSlotDefinitions('BA')[1].label, 'DEPUTADO ESTADUAL');
  assert.equal(getSlotDefinitions(' df ')[1].label, 'DEPUTADO DISTRITAL');
  assert.equal(getSlotDefinitions('GO')[1].label, 'DEPUTADO ESTADUAL');
});

test('story colors are the approved brand palette', () => {
  assert.deepEqual(COLORS, {
    mist: '#F2F7EF',
    deep: '#143C35',
    blue: '#0759A5',
    green: '#168F61',
    yellow: '#F6C700',
    white: '#FFFFFF',
  });
});
