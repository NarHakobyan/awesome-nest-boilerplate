---
name: verify
description: Run lint and unit tests to verify the current state of the codebase. Use after making changes before marking a task done.
---

Run the following commands in sequence and report any failures:

```bash
pnpm lint
pnpm test
```

If lint fails, show the specific errors and which files are affected.
If tests fail, show the failing test names and error messages.

If both pass, confirm that lint and tests are clean.
