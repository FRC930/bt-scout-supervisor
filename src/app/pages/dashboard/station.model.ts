import { MatchType } from 'src/app/shared/models/message-payloads/ds_assign.payload';

export interface ScoutingStation {
  station: 'Red' | 'Blue';
  position: 1 | 2 | 3;
  team: number;
  devices: {
    name: string;
    address: string;
    connected: boolean;
  }[];
}

export interface ScoutingStationMap {
  match: string;
  event: string;
  matchType: MatchType;
  red1: ScoutingStation;
  red2: ScoutingStation;
  red3: ScoutingStation;
  blue1: ScoutingStation;
  blue2: ScoutingStation;
  blue3: ScoutingStation;
}

export const initialScoutingStationMap: ScoutingStationMap = {
  match: 'Q1',
  event: '',
  matchType: MatchType.Qualification,
  red1: {
    station: 'Red',
    position: 1,
    devices: [
      // { name: 'Gwen', address: '', connected: true },
      // { name: 'Laura', address: '', connected: true },
    ],
    team: 6421,
  },
  red2: {
    station: 'Red',
    position: 2,
    devices: [
      // { name: 'Amelia', address: '', connected: false }
    ],
    team: 930,
  },
  red3: {
    station: 'Red',
    position: 3,
    devices: [
      // { name: 'Savannah', address: '', connected: true }
    ],
    team: 6574,
  },
  blue1: {
    station: 'Blue',
    position: 1,
    devices: [
      // { name: 'Owen', address: '', connected: false },
      // { name: 'Chris', address: '', connected: false },
    ],
    team: 1732,
  },
  blue2: {
    station: 'Blue',
    position: 2,
    devices: [
      // { name: 'Zach', address: '', connected: true }
    ],
    team: 1714,
  },
  blue3: {
    station: 'Blue',
    position: 3,
    devices: [
      // { name: 'Greg', address: '', connected: false },
      // { name: 'Allison', address: '', connected: true },
    ],
    team: 1792,
  },
};
