module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // Para que Jest entienda TS/TSX
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },

  // Evita testear build, dist, etc.
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Simula imports de CSS (si lo necesitas en componentes)
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Cobertura básica
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
};
