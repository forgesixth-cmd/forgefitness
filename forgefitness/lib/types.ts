export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
};

export type WeeklyFocus = {
  title: string;
  value: string;
  note: string;
};

export type UpcomingSession = {
  day: string;
  name: string;
  duration: string;
  goal: string;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  level: string;
  schedule: string;
  description: string;
  focus: string[];
};

export type LoggedWorkout = {
  id: string;
  name: string;
  date: string;
  duration: string;
  volume: string;
  intensity: string;
  focus: string;
  note: string;
};

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileSummary = {
  name: string;
  email: string;
  initials: string;
  stats: ProfileStat[];
};

export type ProfileGoal = {
  label: string;
  value: string;
  note: string;
};
