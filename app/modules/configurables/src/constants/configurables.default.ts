/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TGameTheme = {
  bgDark: string;
  bgMid: string;
  bloodRed: string;
  forestGreen: string;
  amber: string;
};

export type TTitleScreenCopy = {
  subtitle: string;
  startButtonLabel: string;
  howToPlayHeading: string;
};

export type TVictoryScreenCopy = {
  heading: string;
  message: string;
  shareText: string;
};

export type TGameOverCopy = {
  heading: string;
  retryButtonLabel: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  gameTagline: string;
  totalNights: number;
  showHighScores: boolean;
  gameTheme: TGameTheme;
  titleScreenCopy: TTitleScreenCopy;
  victoryScreenCopy: TVictoryScreenCopy;
  gameOverCopy: TGameOverCopy;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Horror Kutty Satthan",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#dc2626",
    secondary: "#14532d",
    accent: "#d97706",
  },
  gameTagline: "Survive 100 nights. Outlast the darkness. Escape the haunted forest.", // fill it here
  totalNights: 100, // fill it here
  showHighScores: true, // fill it here
  gameTheme: {
    bgDark: "#020617",
    bgMid: "#0f172a",
    bloodRed: "#dc2626",
    forestGreen: "#14532d",
    amber: "#d97706",
  },
  titleScreenCopy: {
    subtitle: "A Haunted Forest Survival Game",
    startButtonLabel: "Begin the Nightmare",
    howToPlayHeading: "How to Survive",
  },
  victoryScreenCopy: {
    heading: "You Survived",
    message: "100 nights of pure dread. The haunted forest could not claim you.",
    shareText: "I survived all 100 nights in Horror Kutty Satthan!",
  },
  gameOverCopy: {
    heading: "The Ghost Got You",
    retryButtonLabel: "Try Again",
  },
};
