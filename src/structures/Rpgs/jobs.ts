import { IJobFile } from '@utils/Types';

const jobs: IJobFile = {
  1: {
    name: 'name',
    min_level: 1,
    work_cooldown_in_hours: 1,
    xp: 50,
    min_money: 1,
    max_money: 50,
  },
  2: {
    name: 'name',
    min_level: 7,
    work_cooldown_in_hours: 1,
    xp: 350,
    min_money: 70,
    max_money: 460,
  },
  3: {
    name: 'name',
    min_level: 15,
    work_cooldown_in_hours: 2,
    xp: 1000,
    min_money: 450,
    max_money: 1200,
  },
  4: {
    name: 'name',
    min_level: 25,
    work_cooldown_in_hours: 2,
    xp: 100000,
    min_money: 1191,
    max_money: 1800,
  },
};

export default jobs;
