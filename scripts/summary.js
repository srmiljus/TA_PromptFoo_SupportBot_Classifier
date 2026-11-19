#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const resultsPath = process.argv[2];

if (!resultsPath) {
  console.error('Usage: node scripts/summary.js <results-file>');
  console.error('Example: node scripts/summary.js results/v1.json');
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const tests = data.results.results;

  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const total = tests.length;

  console.log(`\n=== Evaluation Summary ===\n`);
  console.log(`Results: ${passed}/${total} passed (${(passed/total*100).toFixed(1)}%)\n`);

  if (failed > 0) {
    console.log(`Failed Tests (${failed}):\n`);
    tests.forEach((test, idx) => {
      if (!test.success) {
        const msg = test.vars.user_message;
        const exp_cat = test.vars.expected_category;
        const exp_pri = test.vars.expected_priority;
        const rationale = test.vars.rationale || null;
        const reason = test.gradingResult?.reason || 'Unknown reason';

        console.log(`Test ${idx + 1}:`);
        console.log(`  Message: ${msg}`);
        if (rationale) {
          console.log(`  Rationale: ${rationale}`);
        }
        console.log(`  Expected: ${exp_cat}/${exp_pri}`);

        let actual;
        if (!test.response || !test.response.output) {
          console.log(`  Got: ${test.error || 'No output from provider'}`);
        } else {
          try {
            actual = JSON.parse(test.response.output);
            console.log(`  Got: ${actual.category}/${actual.priority}`);
          } catch (e) {
            const rawOutput = test.response.output.substring(0, 200);
            console.log(`  Got (raw): ${rawOutput}`);
          }
        }

        console.log(`  Reason: ${test.gradingResult?.reason || 'Unknown reason'}\n`);
      }
    });
  } else {
    console.log('All tests passed! ✓\n');
  }
} catch (err) {
  console.error(`Error reading results: ${err.message}`);
  process.exit(1);
}
