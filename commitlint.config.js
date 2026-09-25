export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    // GitHub squash-merge PR titles like "Sprint 2 - Database & Simulation Layer (#2)"
    (commit) => /\(#[0-9]+\)$/.test(commit.split('\n')[0].trim()),
    // Automated release commits like "chore(release): 0.0.1"
    (commit) => commit.split('\n')[0].trim().startsWith('chore(release):'),
  ],
};
