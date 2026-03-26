## Dependencies

All dependencies must be pinned to exact versions.

## Configuration

- API key and coordinates are in `.env.local` (gitignored — never commit this file)


## Development Workflow

### Validation

After making changes, run:

```bash
pnpm validate
```

### Git Branch Naming

- use short names, do not prefix with 'feature/', 'bugfix/', etc

### Branch Protection
**IMPORTANT**: Never make code changes when on the `main` branch. If the user requests changes while on `main`:
1. Check current branch with `git branch --show-current`
2. If on `main`, do NOT make any file changes
3. Inform the user: "Currently on main branch. Should I create a feature branch or would you like to switch branches first?"
4. Wait for user instructions before proceeding

## Unit Tests
* Structure tests using a Behavior Driven Development pattern
    * Use lower-case 'given', 'when', 'then' comments to organize the test
    * For expressions that combine the when/then use 'expect'
    * Do not add additional inline comments to the tests unless they explain something that is not obvious by reading the code
    * Do not add a file header to the test file that contains comments
