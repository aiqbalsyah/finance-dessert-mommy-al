# CERBREC-UI: Plan Status — Check progress across all plans or a specific plan

Check progress across all plans or a specific plan.

## If argument provided: `/plan-status {plan-name}`

1. Read `docs/planning/{plan-name}/README.md`
2. Read each phase file to get current status and task completion
3. Show detailed report:

```
## {Plan Title}

**Goal:** {goal}
**Progress:** {done}/{total} phases ({percentage}%)

| # | Phase | Status | Tasks |
|---|-------|--------|-------|
| 01 | Types & Models | ✅ Done | 4/4 |
| 02 | API Routes | 🔄 In Progress | 2/5 |
| 03 | UI Components | ⬜ Pending | 0/6 |

**Current:** Phase 02 — API Routes
**Next up:** Phase 03 — UI Components
```

4. Suggest next action:
   - If a phase is 🔄 In Progress → "Run `/execute-plan {plan-name}` to continue Phase {NN}"
   - If all phases are ✅ Done → "All phases complete! Plan is finished."
   - If next phase is ⬜ Pending → "Run `/execute-plan {plan-name}` to start Phase {NN}"

## If no argument provided

1. List all directories in `docs/planning/`
2. Read each `README.md` for a summary
3. Show overview:

```
## All Plans

| Plan | Progress | Status |
|------|----------|--------|
| user-management | 3/5 (60%) | 🔄 In Progress |
| analytics-dashboard | 5/5 (100%) | ✅ Complete |
| auth-rbac | 0/4 (0%) | ⬜ Not Started |
```

4. Ask which plan to inspect for details, or suggest starting/continuing one

## Cleanup

If a plan is 100% complete and the user confirms, offer to:
1. Update the README.md status to `**Status:** ✅ Complete`
2. Let the user know the plan docs remain as a record of what was built
