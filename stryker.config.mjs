// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  vitest: {
    configFile: "vite.config.ts",
  },

  // Focus mutation on critical business logic
  mutate: [
    "src/shared/utils/geocode.ts",
    "src/shared/utils/reverseGeocode.ts",
    "src/modules/chat/hooks/useChatWs.ts",
    "src/modules/chat/hooks/useVoice.ts",
    "src/modules/chat/components/ui/ChatMessage.tsx",
    "src/modules/planificar/hooks/useRoutePredictMulti.ts",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
  ],

  // Thresholds — if mutation score drops below these, CI fails
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },

  // Performance
  concurrency: 4,
  timeoutMS: 10000,
  tempDirName: ".stryker-tmp",

  htmlReporter: {
    fileName: "tests/mutation/report.html",
  },
};

export default config;
