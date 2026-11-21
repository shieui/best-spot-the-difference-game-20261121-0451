// differences.js: where the differences hide. One job: the data.
// Each level has exactly 7 differences. Coordinates are in scene space
// (600 x 470, the inside of one picture panel); r is the click radius.
// `name` is what the game announces when the difference is found, and
// `hint` is the riddle the hint button whispers.

export const DIFFERENCES = [
  // Level 0 — Moonlit Garden
  [
    { id: 'crater', x: 470, y: 70, r: 30, name: 'Moon crater', hint: 'Look at the moon — is it perfectly smooth?' },
    { id: 'tail', x: 150, y: 232, r: 28, name: "Cat's tail", hint: 'The garden cat holds its tail differently.' },
    { id: 'flower', x: 352, y: 402, r: 24, name: 'Flower colour', hint: 'One bloom changed its favourite colour.' },
    { id: 'lantern', x: 300, y: 152, r: 26, name: 'Paper lantern', hint: 'Something hangs from the old tree — or does it?' },
    { id: 'butterfly', x: 432, y: 218, r: 24, name: 'Butterfly', hint: 'A night butterfly flutters near the lantern.' },
    { id: 'fish', x: 152, y: 392, r: 26, name: 'Pond fish', hint: 'The fish in the pond swims the other way.' },
    { id: 'mushroom', x: 252, y: 428, r: 24, name: 'Mushroom', hint: 'Something small grows beside the pond.' },
  ],
  // Level 1 — Harbor at Dawn
  [
    { id: 'beam', x: 498, y: 178, r: 30, name: 'Lighthouse beam', hint: 'The lighthouse is either guiding ships or resting.' },
    { id: 'gull', x: 198, y: 88, r: 24, name: 'Third gull', hint: 'Count the gulls over the harbour.' },
    { id: 'flag', x: 500, y: 118, r: 22, name: 'Flag colour', hint: 'The lighthouse flag flies a different colour.' },
    { id: 'buoy', x: 420, y: 384, r: 24, name: 'Buoy', hint: 'Something bobs on the water near the boats.' },
    { id: 'stripe', x: 300, y: 268, r: 26, name: 'Sail stripe', hint: 'The big sail is either striped or plain.' },
    { id: 'star', x: 522, y: 424, r: 22, name: 'Crate star', hint: 'A crate on the dock is marked — or not.' },
    { id: 'anchor', x: 92, y: 420, r: 26, name: 'Anchor', hint: 'On the dock: an anchor, or just a coil of rope?' },
  ],
  // Level 2 — Night Market
  [
    { id: 'glyph', x: 152, y: 150, r: 24, name: 'Stall sign', hint: 'One stall sign shows a different symbol.' },
    { id: 'lantern', x: 300, y: 108, r: 24, name: 'Lantern colour', hint: 'A hanging lantern changed its colour.' },
    { id: 'roofcat', x: 452, y: 128, r: 26, name: 'Roof cat', hint: 'A cat naps on a stall roof — when it feels like it.' },
    { id: 'steam', x: 150, y: 228, r: 26, name: 'Steamer steam', hint: 'The dumpling steamer puffs — or it does not.' },
    { id: 'bell', x: 522, y: 378, r: 22, name: 'Bicycle bell', hint: 'The bicycle by the stall: does it ring?' },
    { id: 'bulb', x: 250, y: 58, r: 20, name: 'String-light bulb', hint: 'One bulb in the string lights has gone dark.' },
    { id: 'awning', x: 452, y: 190, r: 26, name: 'Awning stripe', hint: 'A stall awning wears a different stripe.' },
  ],
];

export function totalDifferences(levelIndex) {
  return DIFFERENCES[levelIndex].length;
}
