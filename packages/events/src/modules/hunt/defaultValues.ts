const defaultHuntingProbabilities = {
  demons: [
    { amount: 0, probability: 25 },
    { amount: 1, probability: 21 },
    { amount: 2, probability: 18 },
    { amount: 4, probability: 15 },
    { amount: 3, probability: 12 },
    { amount: 5, probability: 9 },
  ],
  giants: [
    { amount: 0, probability: 33 },
    { amount: 1, probability: 23 },
    { amount: 2, probability: 19 },
    { amount: 4, probability: 18 },
    { amount: 3, probability: 7 },
  ],
  angels: [
    { amount: 0, probability: 50 },
    { amount: 1, probability: 30 },
    { amount: 2, probability: 15 },
    { amount: 3, probability: 5 },
  ],
  archangels: [
    { amount: 0, probability: 54 },
    { amount: 1, probability: 27 },
    { amount: 2, probability: 15 },
    { amount: 3, probability: 4 },
  ],
  demigods: [
    { amount: 0, probability: 70 },
    { amount: 1, probability: 27 },
    { amount: 2, probability: 3 },
  ],
  gods: [
    { amount: 0, probability: 92 },
    { amount: 1, probability: 8 },
  ],
};

const defaultHuntCooldown = 3_600_000;

export { defaultHuntingProbabilities, defaultHuntCooldown };
