# Implement Next Phase Task

This command finds the next uncompleted subtask from the specified modernization plan and implements it.

## Usage
```
@implement-next-phase <plan-file>
```

## Arguments
- `<plan-file>` - Path to the modernization plan file (e.g., `Modernization-Plan-2025-09.md`)

## What it does
1. Reads the specified modernization plan to find the next uncompleted subtask
2. Creates a git branch for the subtask (e.g., `implement-1-1`, `implement-1-2`)
3. Switches to the new branch and completes the work
4. Marks the task as completed in the plan
5. Creates a git commit (but does not push)
6. Waits for further instructions

## Example
```
@implement-next-phase Modernization-Plan-2025-09.md
```
- Finds task "1.1 Initialize Package Management" is next uncompleted task
- Creates branch `implement-1-1`
- Implements the package.json setup and dependencies
- Updates the plan to mark task 1.1 as completed
- Commits changes with descriptive message
- Provides summary and waits for next instructions

## Prerequisites
- Clean working directory (no uncommitted changes)
- Valid modernization plan with clearly marked subtasks

## Output
- Summary of completed work
- Git branch created and committed
- Updated modernization plan with task marked complete
- Ready for next task or review