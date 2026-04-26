### No Ready Todos

```bash
if [ $TODO_COUNT -eq 0 ]; then
  echo "✅ No ready todos found"
  echo ""
  echo "To create todos:"
  echo "  1. Run code review: /cg-review [PR/branch]"
  echo "  2. Manually create: ${TODOS_ROOT}/NNN-ready-pN-description.md"
  echo "  3. Triage pending todos: /cg-triage"
  exit 0
fi
```

### Agent Resolution Failures

```bash
# If an agent fails or encounters errors
echo "⚠️ Todo #$todo_id resolution encountered issues"
echo "   Agent: cg-pr-comment-resolver"
echo "   Todo: $todo_file"
echo ""
echo "Actions:"
echo "  1. Review agent output for specific errors"
echo "  2. Resolve manually if needed"
echo "  3. Re-run with: /cg-resolve-todo-parallel $todo_id"
echo "  4. Or skip: mv $todo_file ${TODOS_ROOT}/${todo_id}-blocked-*"
```

### Commit/Checkin Failures

```bash
# If commit/checkin fails
echo "⚠️ Failed to commit changes"
echo ""
if [ "$VCS_TYPE" = "git" ]; then
  echo "Possible issues:"
  echo "  - Pre-commit hooks failed"
  echo "  - Merge conflicts"
  echo "  - No changes were made"
  echo ""
  echo "Check: git status"
  echo "Review: git diff"
elif [ "$VCS_TYPE" = "plastic" ]; then
  echo "Possible issues:"
  echo "  - Checkin rules failed"
  echo "  - Merge conflicts"
  echo "  - No changes were made"
  echo ""
  echo "Check: cm status"
  echo "Review: cm diff"
fi
```

### Push Failures

```bash
# If push fails
echo "⚠️ Failed to push to remote"
echo ""
echo "Changes are committed locally but not pushed"
echo "Manual push required:"
if [ "$VCS_TYPE" = "git" ]; then
  echo "  git pull origin $CURRENT_BRANCH  # Pull first if needed"
  echo "  git push origin $CURRENT_BRANCH"
elif [ "$VCS_TYPE" = "plastic" ]; then
  echo "  cm push  # Or use Plastic GUI to sync"
fi
```

### Dependency Deadlocks

```bash
# If circular dependencies detected
echo "⚠️ Circular dependency detected:"
echo "   Todo A depends on Todo B"
echo "   Todo B depends on Todo A"
echo ""
echo "Resolution:"
echo "  1. Edit one of the todos to remove the circular dependency"
echo "  2. Or resolve one manually to break the cycle"
```
