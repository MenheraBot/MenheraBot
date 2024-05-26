const defaultHuntingProbabilities = {
  demons: [
    { value: 0, probability: 25 },
    { value: 1, probability: 21 },
    { value: 2, probability: 18 },
    { value: 4, probability: 15 },
    { value: 3, probability: 12 },
    { value: 5, probability: 9 },
  ],
  giants: [
    { value: 0, probability: 33 },
    { value: 1, probability: 23 },
    { value: 2, probability: 19 },
    { value: 3, probability: 18 },
    { value: 4, probability: 7 },
  ],
  angels: [
    { value: 0, probability: 50 },
    { value: 1, probability: 30 },
    { value: 2, probability: 15 },
    { value: 3, probability: 5 },
  ],
  archangels: [
    { value: 0, probability: 54 },
    { value: 1, probability: 27 },
    { value: 2, probability: 15 },
    { value: 3, probability: 4 },
  ],
  demigods: [
    { value: 0, probability: 70 },
    { value: 1, probability: 27 },
    { value: 2, probability: 3 },
  ],
  gods: [
    { value: 0, probability: 92 },
    { value: 1, probability: 8 },
  ],
};

const defaultHuntCooldown = 3_600_000;

export { defaultHuntingProbabilities, defaultHuntCooldown };
