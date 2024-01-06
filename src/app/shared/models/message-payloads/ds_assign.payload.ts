export type DSAssignPayload =
  | {
      [K in keyof any]: K extends keyof 'match' | 'event' | MatchType ? never : Station;
    }
  | {
      match: string;
      event: string;
      matchType: MatchType;
    };

export interface Station {
  team: string;
  station: string;
}

export enum MatchType {
  Practice = 'Practice',
  Qualification = 'Qualification',
  QuarterFinal = 'QuarterFinal',
  SemiFinal = 'SemiFinal',
  Final = 'Final',
}
