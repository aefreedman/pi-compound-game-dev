# VCS Detection

This reference file contains the standard VCS detection logic used across multiple skills.

---

## Detection Logic

Before proceeding with VCS-specific operations, detect which version control system this project uses:

```bash
# VCS Detection (Plastic check first - handles git-parent/plastic-child edge case)
if cm status &>/dev/null 2>&1; then
  VCS_TYPE="plastic"
elif [ -d ".git" ]; then
  VCS_TYPE="git"
else
  VCS_TYPE="none"
fi

echo "🔍 Detected VCS: $VCS_TYPE"
```

---

## Workflow Lock Contract (Mandatory)

After detection, select exactly one active workflow and treat it as authoritative for VCS writes.

- If `VCS_TYPE=git`, load `git-workflow.md` only and apply Git commit rules.
- If `VCS_TYPE=plastic`, load `plastic-workflow.md` only and apply Plastic checkin rules.
- Do not combine branch-write policies across workflows in the same run.
- If a generic instruction conflicts with the active VCS workflow file, the active workflow file wins.

---

## Why Plastic First?

Some projects use **Plastic SCM for child directories within a Git parent**. Checking Plastic first ensures we detect the actual VCS being used in the current working directory, not the parent.

**Example edge case:**
```
/project-root/          (Git repository)
  /unity-game/          (Plastic SCM workspace inside Git repo)
```

If you're in `/project-root/unity-game/`, you want to use Plastic commands, not Git commands.

---

## Exit Conditions

**If VCS is required:**
```bash
if [ "$VCS_TYPE" = "none" ]; then
  echo "❌ No version control detected (Git or PlasticSCM)"
  exit 1
fi
```

**If VCS is optional:**
```bash
if [ "$VCS_TYPE" = "none" ]; then
  echo "ℹ️ No version control detected"
  echo "   Operations will be local-only"
fi
```

---

## Usage in Skills

**Load this file when:**
- Skill needs to perform VCS-specific operations
- Skill needs to commit/checkin changes
- Skill needs to create branches or workspaces
- Skill needs to push/sync to remote

**Reference this file:**
```markdown
Load VCS detection from ./vcs-detection.md
```

Then proceed with VCS-specific workflows based on `$VCS_TYPE`.
