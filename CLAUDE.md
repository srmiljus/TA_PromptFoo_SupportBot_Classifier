# PromptFoo Support Bot: Working Guidelines

## Shell and Paths
- Use Git Bash (POSIX sh), not cmd.exe or PowerShell
- All paths use forward slashes: `/c/Users/srmil/Desktop/promptfoo-support-bot/`
- Relative paths in YAML and commands use forward slashes: `file://prompts/v1.txt`

## Prompts and Tests
- **You write all prompts** - never ask the user to write or edit prompts
- **You write all tests** - never ask the user to write or edit test cases
- **Never modify existing tests to make them pass** unless you can clearly demonstrate that the test contradicts `homework_requirements.md`
- Document any test/requirement conflicts explicitly (e.g., Test 1 expects CRITICAL but requirements say HIGH for individual user login issues)

## Git
- **Do not run** `git add`, `git commit`, or `git push`
- User handles all git operations
- Focus on creating and modifying files only

## Versioning
- Each new prompt version goes in a separate file: `prompts/v1.txt`, `prompts/v2.txt`, etc.
- Each evaluation produces results: `results/v1.json`, `results/v2.json`, etc.
- Update `promptfooconfig.yaml` to reference the current prompt version
- Use `npm run summary -- results/vN.json` to view evaluation results

## Evaluation Workflow
1. Create/modify prompt in `prompts/vN.txt`
2. Update `promptfooconfig.yaml` to reference `file://prompts/vN.txt`
3. Run: `npx promptfoo eval --no-cache --output results/vN.json`
4. Review results: `npm run summary -- results/vN.json`
5. Document findings and plan next iteration
