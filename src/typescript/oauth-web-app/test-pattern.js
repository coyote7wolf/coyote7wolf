const pattern = /^(?:.*?\s+)?([a-z]+)(?:\((.+)\))?!?:\s+(.+)$/;

const testCases = [
  "🔧 chore(deps): update dependencies",
  "✨ feat(auth): add login",
  "🐛 fix(navbar): correct alignment",
  "chore(deps): update dependencies",
];

console.log("Pattern: ^(?:.*?\\s+)?([a-z]+)(?:\\((.+)\\))?!?:\\s+(.+)$\n");

testCases.forEach((test) => {
  const match = pattern.exec(test);
  console.log(`Input: ${test}`);
  if (match) {
    console.log(`  ✓ Supported: Yes`);
    console.log(
      `    Type: ${match[1]}, Scope: ${match[2]}, Subject: ${match[3]}`,
    );
  } else {
    console.log(`  ✗ Supported: No`);
  }
  console.log();
});
