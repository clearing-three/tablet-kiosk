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

### Lit Rewrite Branch (`lit-rewrite`)

When working on the `lit-rewrite` branch, you are performing a complete architectural rewrite from MVC to idiomatic Lit with Web Components.

**Referencing Original Implementation:**

The original MVC implementation is preserved at the `pre-lit-rewrite` tag. To view old files without switching branches:

```bash
# View old file
git show pre-lit-rewrite:<path>

# Examples:
git show pre-lit-rewrite:src/controllers/WeatherController.ts
git show pre-lit-rewrite:src/components/Weather/ForecastView.ts

# View with line numbers
git show pre-lit-rewrite:src/components/Weather/ForecastView.ts | cat -n

# Compare old vs new implementation
git diff pre-lit-rewrite:src/controllers/WeatherController.ts src/components/weather-app.ts
```

**When to Reference Original Code:**
- When migrating logic from old controllers to new components
- When verifying that functionality is preserved
- When understanding how old views rendered data
- When comparing architectural approaches

**Key Context:**
- Old architecture: MVC with controllers, views, and UpdateScheduler
- New architecture: Self-contained Lit components with lifecycle hooks
- Tag `pre-lit-rewrite` is permanent and can always be referenced
