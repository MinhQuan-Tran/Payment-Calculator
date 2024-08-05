export type Entry = {
  id: number;
  workplace: string;
  payRate: number;
  from: Date;
  to: Date;
};

export type WorkInfos = {
  [workplace: string]: {
    payRate: Set<number>;
  };
};
