import type {
  DashboardMetric,
  LoggedWorkout,
  ProfileGoal,
  ProfileSummary,
  UpcomingSession,
  WeeklyFocus,
  WorkoutPlan,
} from "@/lib/types";

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Current streak", value: "11 days", change: "Up from 7 days last week" },
  { label: "Plan completion", value: "82%", change: "4 of 5 scheduled sessions done" },
  { label: "Monthly sessions", value: "17", change: "2 more than this time last month" },
  { label: "Recovery score", value: "7.8 / 10", change: "Sleep and soreness are trending better" },
];

export const weeklyFocus: WeeklyFocus[] = [
  {
    title: "Strength volume",
    value: "14.2k lb",
    note: "Primary lifts are progressing steadily without excessive fatigue.",
  },
  {
    title: "Conditioning",
    value: "96 min",
    note: "Zone 2 and finishers are balanced with resistance training.",
  },
  {
    title: "Mobility",
    value: "3 sessions",
    note: "Keep thoracic and hip mobility work after lower-body days.",
  },
];

export const upcomingSessions: UpcomingSession[] = [
  {
    day: "Monday",
    name: "Upper Strength",
    duration: "60 min",
    goal: "Bench press top set, weighted rows, overhead press, shoulder stability.",
  },
  {
    day: "Wednesday",
    name: "Lower Power",
    duration: "70 min",
    goal: "Trap-bar deadlift, split squats, hamstring work, sled pushes.",
  },
  {
    day: "Friday",
    name: "Conditioning + Core",
    duration: "45 min",
    goal: "Intervals, carries, anti-rotation work, and cooldown mobility.",
  },
];

export const workoutPlans: WorkoutPlan[] = [
  {
    id: "plan-foundation",
    name: "Foundation Builder",
    level: "Beginner",
    schedule: "3 days / week",
    description:
      "A simple full-body plan focused on learning movement patterns, building consistency, and logging clean data.",
    focus: [
      "Full-body sessions with repeatable progression",
      "Short conditioning finishers",
      "Weekly recovery check-in",
    ],
  },
  {
    id: "plan-strength",
    name: "Strength Split",
    level: "Intermediate",
    schedule: "4 days / week",
    description:
      "Push, pull, lower, and upper emphasis with progressive overload and accessory balance built into the week.",
    focus: [
      "Primary lift progression tracking",
      "Separate hypertrophy volume blocks",
      "Deload-ready session organization",
    ],
  },
  {
    id: "plan-performance",
    name: "Hybrid Performance",
    level: "Advanced",
    schedule: "5 days / week",
    description:
      "A higher-output plan blending strength work, athletic conditioning, and recovery management for busy performers.",
    focus: [
      "Lift plus conditioning pairing",
      "Workload visibility across the week",
      "Performance notes tied to recovery",
    ],
  },
];

export const recentLogs: LoggedWorkout[] = [
  {
    id: "log-1",
    name: "Push Strength",
    date: "April 4",
    duration: "58 min",
    volume: "4,860 lb",
    intensity: "8 / 10",
    focus: "Chest / shoulders / triceps",
    note: "Top bench set moved well. Shoulder felt stable after longer warm-up.",
  },
  {
    id: "log-2",
    name: "Lower Body Power",
    date: "April 2",
    duration: "66 min",
    volume: "5,940 lb",
    intensity: "7 / 10",
    focus: "Quads / glutes / posterior chain",
    note: "Front squats felt strong. Keep rest periods tighter on accessory work.",
  },
  {
    id: "log-3",
    name: "Conditioning Intervals",
    date: "March 31",
    duration: "42 min",
    volume: "N/A",
    intensity: "6 / 10",
    focus: "Aerobic base and core",
    note: "Intervals stayed controlled. Good recovery between rounds.",
  },
];

export const profile: ProfileSummary = {
  name: "Jordan Lee",
  email: "jordan@forgefitness.app",
  initials: "JL",
  stats: [
    { label: "Primary goal", value: "Build strength" },
    { label: "Experience", value: "Intermediate" },
    { label: "Weekly availability", value: "5 sessions" },
    { label: "Preferred session length", value: "60 minutes" },
  ],
};

export const profileGoals: ProfileGoal[] = [
  {
    label: "Short-term target",
    value: "Complete 20 sessions this month",
    note: "Consistency is the main KPI for the current training block.",
  },
  {
    label: "Performance target",
    value: "Add 15 lb to bench press working sets",
    note: "Use session notes to monitor bar speed, shoulder comfort, and fatigue.",
  },
  {
    label: "Recovery preference",
    value: "One low-intensity day between heavy sessions",
    note: "Dashboard readiness should eventually combine sleep, soreness, and previous load.",
  },
];
