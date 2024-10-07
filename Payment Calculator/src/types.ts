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

export type Day = {
  dayStartTime: Date;
  dayEndTime: Date;
  prevMonth: boolean; // Is the day from the previous month
  nextMonth: boolean; // Is the day from the next month
};

export type Week = {
  days: Day[];
  summaries: {
    totalHours: number;
    net: number;
  };
};
