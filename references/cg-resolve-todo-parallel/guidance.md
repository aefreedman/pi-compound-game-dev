## Best Practices

1. **Review Before Running**: Check ready todos to ensure they're actually ready for resolution
2. **Run Tests After**: Always run your test suite after resolving todos
3. **Small Batches**: If you have many todos, consider resolving in smaller batches (filter by priority or pattern)
4. **Check Dependencies**: Make sure dependency ordering makes sense before running
5. **Archive Completed**: Periodically move completed todos to archive directory
6. **Monitor Agents**: Watch agent output for any warnings or errors during parallel execution

## Integration with Workflow Commands

This command integrates with the compound-engineering workflow:

**After code review:**
```bash
/cg-review <PR/branch>  # Creates pending todos
# ... triage and approve todos ...
/cg-resolve-todo-parallel         # Resolves all ready todos
```

**Targeted resolution:**
```bash
/cg-resolve-todo-parallel 001     # Resolve only todo #001
/cg-resolve-todo-parallel p1      # Resolve only P1 todos
/cg-resolve-todo-parallel security # Resolve todos matching "security"
```

**Check status:**
```bash
ls ${TODOS_ROOT}/*-ready-*.md          # List ready todos
ls ${TODOS_ROOT}/*-complete-*.md       # List completed todos
ls ${TODOS_ROOT}/*-pending-*.md        # List pending todos (need triage)
```

---

**This command provides efficient, parallel todo resolution with full VCS support for both Git and PlasticSCM, making it easy to systematically address code review findings and technical debt.**
