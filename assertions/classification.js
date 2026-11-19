module.exports = (output, context) => {
  let parsed;
  try {
    parsed = JSON.parse(output.trim());
  } catch (e) {
    return {pass: false, score: 0, reason: `Failed to parse JSON: ${e.message}`};
  }

  const expectedCategory = context.vars.expected_category;
  const expectedPriority = context.vars.expected_priority;

  const keys = Object.keys(parsed);
  if (keys.length !== 2 || !keys.includes('category') || !keys.includes('priority')) {
    return {pass: false, score: 0, reason: `Expected exactly {category, priority}, got: {${keys.join(', ')}}`};
  }

  if (parsed.category !== expectedCategory) {
    return {pass: false, score: 0, reason: `Expected category "${expectedCategory}", got "${parsed.category}"`};
  }
  if (parsed.priority !== expectedPriority) {
    return {pass: false, score: 0, reason: `Expected priority "${expectedPriority}", got "${parsed.priority}"`};
  }

  return {pass: true, score: 1, reason: `Correct: ${parsed.category} / ${parsed.priority}`};
};
