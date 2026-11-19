# PromptFoo Support Bot Classifier

An AI-powered support ticket classification system that automatically assigns categories (BUG, BILLING, FEATURE, QUESTION) and priorities (CRITICAL, HIGH, LOW) to customer support messages. Built with PromptFoo, Claude AI, and AWS Bedrock.

## Overview

This project develops an intelligent support ticket classifier through iterative prompt engineering and comprehensive evaluation. It demonstrates:

- **Prompt iteration** from baseline (58.7% accuracy) to final (95.7% accuracy)
- **Systematic test suite** of 46 AI-generated test cases covering edge cases
- **Semantic understanding** of support tickets with nuanced priority rules
- **Deterministic evaluation** with temperature=0 and consistency validation

## Task Description

The classifier must analyze incoming support tickets and assign exactly one Category and one Priority according to `homework_requirements.md`:

**Categories**: 
- **BUG**: System errors, crashes, unexpected behavior
- **BILLING**: Payments, subscriptions, invoices, refunds (domain supersedes all)
- **FEATURE**: New functionality requests
- **QUESTION**: General inquiries, how-to questions, documentation

**Priorities**:
- **CRITICAL**: Complete outage, data loss, security breach, or user unable to pay
- **HIGH**: Core functionality broken WITH workaround, individual login issues
- **LOW**: Minor UI bugs, typos, questions, **ALL feature requests** (capped at LOW regardless of tone)

**Special Rules**:
1. BUG+BILLING → categorize as BILLING, prioritize by severity
2. Sarcasm and emotional language do NOT affect priority (evaluate technical issue only)
3. Feature requests ALWAYS LOW (no exceptions for angry tone or urgency)

## Project Structure

```
promptfoo-support-bot/
├── README.md                          # This file
├── ITERATIONS.md                      # Detailed prompt evolution (v1→v4)
├── CLAUDE.md                          # Working guidelines for Claude Code
├── homework_requirements.md           # Assignment specifications
├── tests.csv                          # 46 test cases with rationales
├── promptfooconfig.yaml              # PromptFoo configuration
├── package.json                       # npm scripts
│
├── prompts/
│   ├── v1.txt                        # Baseline prompt (58.7%)
│   ├── v2.txt                        # Explicit rules (84.8%)
│   ├── v3.txt                        # Semantic rules (93.5%)
│   └── v4.txt                        # Final prompt (95.7%)
│
├── assertions/
│   └── classification.js             # JSON validation assertion
│
├── results/
│   ├── v1.json                       # 27/46 passed
│   ├── v2.json                       # 39/46 passed
│   ├── v3.json                       # 43/46 passed
│   └── v4.json                       # 44/46 passed (3 repetitions)
│
└── scripts/
    └── summary.js                    # Result analysis script

```

## Setup

### Prerequisites
- Node.js 18+
- AWS credentials configured (Bedrock access)
- PromptFoo 0.120+

### Installation

```bash
npm install
```

### AWS Configuration

Set environment variables for Bedrock (Claude Haiku 4.5):
```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Running Evaluations

### Evaluate Current Prompt (v4)

```bash
# Run 46 tests against v4 prompt
npx promptfoo eval --no-cache --output results/v4-new.json

# View results summary
npm run summary -- results/v4-new.json
```

### Evaluate with Repetition (Consistency Test)

```bash
# Run 46 tests 3 times each (138 total) to validate consistency
npx promptfoo eval --no-cache --repeat 3 --output results/v4-validated.json

# View results
npm run summary -- results/v4-validated.json
```

### Evaluate Specific Version

```bash
# Update promptfooconfig.yaml prompts section to point to desired version
# Then run:
npx promptfoo eval --no-cache --output results/v1-test.json
npm run summary -- results/v1-test.json
```

### View Results in Web UI

```bash
npx promptfoo view

```

## Prompt Versions

| Version | Score | Change | Key Features |
|---------|-------|--------|--------------|
| v1 | 27/46 (58.7%) | Baseline | General instructions, "tone and severity" |
| v2 | 39/46 (84.8%) | +26.1% | Explicit ordered rules, clear HIGH/CRITICAL distinction |
| v3 | 43/46 (93.5%) | +8.7% | Semantic rules, prompt injection protection, report vs asking |
| v4 | 44/46 (95.7%) | +2.2% | BILLING domain supersedes all, individual CRITICAL rules, deterministic |

**Total improvement**: +37.0 percentage points

## Results

### v1 Baseline on original 3 tests (1/3, 33.3%)
![v1 baseline](docs/screenshots/01-v1-baseline-1-of-3.png)
*Initial version with general "tone and severity" instructions. Shows 1 of 3 original test cases passing, establishing baseline performance.*

### v1 Full Suite (27/46, 58.7%)
![v1 full suite](docs/screenshots/02-v1-full-suite-27-of-46.png)
*Complete evaluation on 46-test suite. Demonstrates fundamental issues: inflated priorities, feature requests misclassified as HIGH, BILLING domain ignored.*

### v2 Improved (39/46, 84.8%)
![v2 results](docs/screenshots/03-v2-39-of-46.png)
*+12 tests improvement (+26.1%). Explicit rules and clear priority distinctions significantly reduce errors. Major categories now correctly identified.*

### v3 Refined (43/46, 93.5%)
![v3 results](docs/screenshots/04-v3-43-of-46.png)
*+4 tests improvement (+8.7%). Semantic rules handle edge cases. Data loss correctly identified as CRITICAL. Only 3 boundary cases remain.*

### v4 Final (44/46, 95.7%)
![v4 results](docs/screenshots/05-v4-132-of-138-repeat3.png)
*+1 test improvement (+2.2%). Deterministic evaluation with temperature=0 and --repeat 3 validates consistency. 132/138 total runs (46 tests × 3 repetitions) with identical results. Only 2 semantic boundary cases remain consistently across all runs.*

## Test Suite (46 Cases)

### Coverage

The test suite covers all requirement scenarios:

**Basic Coverage (12 cases)**:
- All 4 categories × 3 priorities
- BUG/CRITICAL, BUG/HIGH, BUG/LOW
- BILLING/CRITICAL, BILLING/HIGH, BILLING/LOW
- FEATURE/LOW (always), QUESTION/LOW (always)

**Special Rules (8 cases)**:
- BUG+BILLING combinations (3 severity levels)
- Sarcastic bug reports (should be HIGH, not CRITICAL)
- Angry feature requests (should be LOW, not HIGH)
- Emotional language handling

**Security & Data Incidents (8 cases)**:
- Security breaches (CRITICAL)
- Data loss scenarios (CRITICAL)
- Payment system failures (BILLING/CRITICAL)
- Prompt injection attempts (should classify content, not follow instruction)

**Ambiguous Cases (6 cases)**:
- **Original Test 1 Resolution**: "I can't log in, getting a 500 error" reclassified from CRITICAL to HIGH
  - Rationale: Per `homework_requirements.md` (line 14): **"Login issues for individual users" → HIGH**
  - Single user issue without evidence of system-wide outage
  - Message says "I can't log in" (singular), not "nobody can log in"
- "Site is slow" (BUG/LOW - minor performance)
- "Some users report errors" (BUG/HIGH - affects multiple)
- "Unclear bug report" (QUESTION/LOW - needs clarification)
- "Mixed issues" (multiple problems - categorize by highest priority)
- "Feature vs existing capability" (distinguishing requests from questions)

**Edge Cases (8 cases)**:
- Very short messages ("bug")
- Very long messages (200+ words)
- Non-English messages (French, Spanish)
- All caps (emotional intensity - should be ignored)
- Emoji-heavy messages
- Multiple issues in one ticket
- Vague problem descriptions

**Boundary Cases (6 cases)**:
- "Urgent" feature request (still LOW)
- Asking about outage vs reporting it (QUESTION vs BUG)
- Payment vs billing page access issue
- Individual vs system-wide login problems
- Workaround availability affecting priority
- Documentation vs error classification

### Known Limitations

**2 Remaining Failed Tests** (semantic edge cases, boundary conditions):

1. **Performance Degradation** (Tests 97-99)
   - Message: "The site is loading very slowly today."
   - Expected: BUG/HIGH (core functionality impaired)
   - Got: BUG/LOW
   - Issue: "Slowly" perceived as minor vs "broken"
   - Reason: Boundary between "working slow" (LOW) and "working but impaired" (HIGH) is semantic
   - Real-world note: May need additional context (affected users, SLA impact) for accurate priority

2. **Billing Display Issue** (Tests 130-132)
   - Message: "I can't see my invoice history on the billing page."
   - Expected: BILLING/LOW (display issue, payments work)
   - Got: BILLING/HIGH
   - Issue: "Can't see" perceived as access blocker
   - Reason: BILLING domain + "can't access" pattern → HIGH (conservative default)
   - Real-world note: Would need to clarify "can't see UI element" vs "can't access payment function"

**Why these are boundary cases**:
- Both involve semantic distinction between severity levels that humans often debate
- Context-dependent: "slow" performance becomes HIGH if it blocks transactions
- Display vs functionality: "can't see invoice" is LOW if payment still works, HIGH if prevents payment
- The prompts correctly identify these as exceptions; they require either:
  - Additional context in the ticket
  - Clearer user message (e.g., "I can't PAY because invoice history is unavailable")
  - Domain-specific SLA thresholds

## Original Test 1: Interpretation Decision

**Original Expectation**: BUG/CRITICAL
**Changed To**: BUG/HIGH

**Justification**:
The original test expected CRITICAL for a login issue, but `homework_requirements.md` explicitly states:

> "**Login issues for individual users** → **HIGH priority**"
> "**CRITICAL**: Complete system outage... or users completely unable to pay"

Analysis of message: "I can't log in, getting a 500 error on the main screen."
- "I can't" (singular user, not "nobody can")
- No evidence of system-wide impact
- 500 error on authentication is a core issue (HIGH) but individual scope
- Meets HIGH definition: "Core functionality broken but workaround may exist" (password reset, support contact, etc.)

**Decision**: Test 1 reclassified to BUG/HIGH to align with requirements specification.

## Attribution

- **Prompt and Test Suite**: Generated with Claude Code (Anthropic)
- **Test Suite Quality Note**: The 46-case test suite was generated by the same AI model used for classification. This is excellent for validation within the suite but **real-world accuracy should be validated on actual customer support tickets** to ensure the patterns generalize beyond AI-generated synthetic data.

## Development Notes

### Prompt Evolution

Each iteration targeted specific failure patterns:

- **v1 → v2**: Added explicit categorization rules with precedence
- **v2 → v3**: Introduced semantic understanding, report vs question distinction
- **v3 → v4**: Implemented domain supersession and individual CRITICAL rules

### Deterministic Evaluation

v4 uses `temperature: 0` for deterministic model responses, validated with `--repeat 3` to confirm consistency across runs (all 3 repetitions identical, demonstrating stable behavior).

### Files Generated by Claude Code

- All prompt versions (v1-v4)
- Test suite (46 cases with rationales)
- Assertion logic (classification.js)
- Summary scripts
- Configuration files

## Next Steps

1. **Validate on Real Tickets**: Run v4 against actual support queue to assess real-world accuracy
2. **Address Boundary Cases**: Gather feedback on performance and billing display issues
3. **Expand Test Suite**: Add more real examples, especially edge cases specific to your support domain
4. **Fine-tune Thresholds**: Adjust CRITICAL vs HIGH boundaries based on actual incident patterns
5. **Implement Confidence Scoring**: Add confidence levels to classifications for human review
6. **Monitor Drift**: Set up continuous evaluation as ticket patterns evolve