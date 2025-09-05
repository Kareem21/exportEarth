module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Feature
        "fix", // Bug fix
        "test", // Test
        "perf", // Performance optimization
        "refactor", // Refactoring
        "docs", // Documentation
        "chore", // Auxiliary tool configuration
        "style", // Format (suitable for lint fix...)
        "revert", // Rollback
        "merge", // Merge
        "sync", // Sync (sync fix repairs from main line or branches)
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-empty": [0],
    "scope-case": [0],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
    "header-max-length": [0, "always", 72],
  },
};
