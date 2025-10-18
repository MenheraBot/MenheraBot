import { ToggleBitfield, User, UserFlags } from '@discordeno/bot';
import mongoose from 'mongoose';

import { DatabaseUserSchema, UserBadge } from '../../types/database.js';

const menheraBitBadgesAccepted = [
  UserFlags.EarlyVerifiedBotDeveloper,
  UserFlags.HouseBalance,
  UserFlags.HouseBravery,
  UserFlags.HouseBrilliance,
];

const discordBitFlagsToMenheraBadges = {
  131072: 5,
  256: 2,
  128: 3,
  64: 4,
};

const oneYearInMillis = 31_536_000_000;

const deletedBadges = [9];

const getYearBadgeId = (yearsWithMenhera: number): UserBadge['id'] =>
  (199 + yearsWithMenhera) as 200;

const getVotesBadgeId = (votes: number): UserBadge['id'] => {
  if (votes >= 1000) return 106;
  if (votes >= 500) return 105;
  if (votes >= 100) return (100 + Math.floor(votes / 100)) as 101;
  return 100;
};

const getUserBadges = (user: DatabaseUserSchema, discordUser: User): UserBadge[] => {
  const userBadges = user.badges.filter((a) => !deletedBadges.includes(a.id));

  const creationTime = new mongoose.Types.ObjectId(`${user._id}`).getTimestamp().getTime();

  const yearsWithMenhera = Math.floor((Date.now() - creationTime) / oneYearInMillis);

  if (yearsWithMenhera > 0)
    userBadges.push({
      id: getYearBadgeId(yearsWithMenhera),
      obtainAt: `${creationTime + oneYearInMillis * yearsWithMenhera}`,
    });

  const userFlagsBitfield = new ToggleBitfield(discordUser.publicFlags);

  if (discordUser.toggles.bot) userBadges.push({ id: 14, obtainAt: `${Date.now()}` });

  if (user.votes >= 50)
    userBadges.push({ id: getVotesBadgeId(user.votes), obtainAt: `${Date.now()}` });

  if (user.married && user.married !== 'false')
    userBadges.push({ id: 17, obtainAt: `${user.marriedAt ?? Date.now()}` });

  if (user.voteCooldown > Date.now())
    userBadges.push({ id: 18, obtainAt: `${user.voteCooldown - 1000 * 60 * 60 * 12}` });

  menheraBitBadgesAccepted.forEach((bit) => {
    if (userFlagsBitfield.contains(bit))
      userBadges.push({
        id: discordBitFlagsToMenheraBadges[bit as 256] as 3,
        obtainAt: `${Date.now()}`,
      });
  });

  return userBadges;
};

export { getUserBadges };
