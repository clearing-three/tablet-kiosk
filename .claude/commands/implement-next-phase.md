# Implement Next Phase Task

This command finds the next uncompleted subtask from the specified plan and implements it.

## Usage
```
@implement-next-phase <plan-file>
```

## Arguments
- `<plan-file>` - Path to the plan file

## What it does
1. Reads the specified plan to find the next uncompleted subtask
2. Switches to main branch, pulls latest changes, and creates a new git branch for the subtask (e.g., `implement-1-1`, `implement-1-2`)
3. Switches to the new branch and completes the work
4. Marks the task as completed in the plan
5. Creates a git commit and pushes to remote
6. Waits for further instructions


## Prerequisites
- Clean working directory (no uncommitted changes)
- Valid plan with clearly marked subtasks

## Output
- Summary of completed work
- Git branch created, committed, and pushed to remote
- Updated plan with task marked complete
- Ready for next task or review