## Configuration

- API key and coordinates are in `.env.local` (gitignored — never commit this file)

## Development Workflow

### Validation

After making changes, run in this order:

```bash
npm run format && npm run lint:fix && npm run lint && npm test && npm run build
```

### Branch Protection
**IMPORTANT**: Never make code changes when on the `main` branch. If the user requests changes while on `main`:
1. Check current branch with `git branch --show-current`
2. If on `main`, do NOT make any file changes
3. Inform the user: "Currently on main branch. Should I create a feature branch or would you like to switch branches first?"
4. Wait for user instructions before proceeding
