import { Injectable } from '@angular/core';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';
import { MatchDataPayload } from '../../models/message-payloads/match_data.payload';

const STORAGE_KEY = 'match-data';

export interface MatchData {
  eventKey: string;
  deviceId: string;
  teamNumber: string;
  matchNumber: string;
  [key: string]: any;
}

export interface MatchDataStore {
  [eventKey: string]: {
    [matchKey: string]: {
      [teamKey: string]: {
        [deviceKey: string]: {
          [key: string]: any;
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class MatchDataService {
  constructor(private storage: KeyValueStorage) {}

  private async getMatchDataStore(): Promise<MatchDataStore> {
    try {
      await this.storage.create('totally_secure_encryption_key');
    } catch (e) {}
    const matchData = await this.storage.get(STORAGE_KEY);
    return matchData ? JSON.parse(matchData) : {};
  }

  private async setMatchDataStore(matchDataStore: MatchDataStore) {
    try {
      await this.storage.create('totally_secure_encryption_key');
    } catch (e) {}
    await this.storage.set(STORAGE_KEY, JSON.stringify(matchDataStore));
  }

  async addOrUpdateMatch(match: MatchData) {
    const matchDataStore = await this.getMatchDataStore();
    const eventKey = match.eventKey;
    const matchKey = match.matchNumber;
    const teamKey = match.teamNumber;
    const deviceKey = match.deviceId;

    if (!matchDataStore[eventKey]) {
      matchDataStore[eventKey] = {};
    }
    if (!matchDataStore[eventKey][matchKey]) {
      matchDataStore[eventKey][matchKey] = {};
    }
    if (!matchDataStore[eventKey][matchKey][teamKey]) {
      matchDataStore[eventKey][matchKey][teamKey] = {};
    }

    matchDataStore[eventKey][matchKey][teamKey][deviceKey] = match;

    await this.setMatchDataStore(matchDataStore);
  }

  async addEventIfNotExists(eventKey: string) {
    const matchDataStore = await this.getMatchDataStore();
    if (!matchDataStore[eventKey]) {
      matchDataStore[eventKey] = {};
      await this.setMatchDataStore(matchDataStore);
    }
  }

  async getMatches(): Promise<MatchData[]> {
    const matchDataStore = await this.getMatchDataStore();
    const matches: MatchData[] = [];
    Object.keys(matchDataStore).forEach((eventKey) => {
      Object.keys(matchDataStore[eventKey]).forEach((matchKey) => {
        Object.keys(matchDataStore[eventKey][matchKey]).forEach((teamKey) => {
          Object.keys(matchDataStore[eventKey][matchKey][teamKey]).forEach((deviceKey) => {
            matches.push(matchDataStore[eventKey][matchKey][teamKey][deviceKey] as MatchData);
          });
        });
      });
    });
    return matches;
  }

  async getAllEvents(): Promise<string[]> {
    const matchDataStore = await this.getMatchDataStore();
    return Object.keys(matchDataStore);
  }

  async getAllTeamsForEvent(eventKey: string): Promise<string[]> {
    const matchDataStore = await this.getMatchDataStore();
    return Object.keys(matchDataStore[eventKey]);
  }

  async getAllMatchesForTeam(team: string): Promise<MatchData[]> {
    const matchDataStore = await this.getMatchDataStore();
    const matches: MatchData[] = [];
    Object.keys(matchDataStore).forEach((eventKey) => {
      Object.keys(matchDataStore[eventKey]).forEach((matchKey) => {
        Object.keys(matchDataStore[eventKey][matchKey]).forEach((teamKey) => {
          if (teamKey === team) {
            Object.keys(matchDataStore[eventKey][matchKey][teamKey]).forEach((deviceKey) => {
              matches.push(matchDataStore[eventKey][matchKey][teamKey][deviceKey] as MatchData);
            });
          }
        });
      });
    });
    return matches;
  }

  async getAllMatchesForEvent(eventKey: string): Promise<MatchData[]> {
    const matchDataStore = await this.getMatchDataStore();
    const matches: MatchData[] = [];
    Object.keys(matchDataStore[eventKey]).forEach((matchKey) => {
      Object.keys(matchDataStore[eventKey][matchKey]).forEach((teamKey) => {
        Object.keys(matchDataStore[eventKey][matchKey][teamKey]).forEach((deviceKey) => {
          matches.push(matchDataStore[eventKey][matchKey][teamKey][deviceKey] as MatchData);
        });
      });
    });
    return matches;
  }

  async getAllMatchesForTeamAtEvent(team: string, eventKey: string): Promise<MatchData[]> {
    const matchDataStore = await this.getMatchDataStore();
    const matches: MatchData[] = [];
    Object.keys(matchDataStore[eventKey]).forEach((matchKey) => {
      Object.keys(matchDataStore[eventKey][matchKey]).forEach((teamKey) => {
        if (teamKey === team) {
          Object.keys(matchDataStore[eventKey][matchKey][teamKey]).forEach((deviceKey) => {
            matches.push(matchDataStore[eventKey][matchKey][teamKey][deviceKey] as MatchData);
          });
        }
      });
    });
    return matches;
  }

  async getAllTeamsForMatchAtEvent(matchKey: string, eventKey: string): Promise<string[]> {
    const matchDataStore = await this.getMatchDataStore();
    const teams: string[] = [];
    Object.keys(matchDataStore[eventKey][matchKey]).forEach((teamKey) => {
      teams.push(teamKey);
    });
    return teams;
  }
}
