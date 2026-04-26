# Troubleshooting

## Worktree Already Exists

The script will offer to switch to the existing worktree.

## Cannot Remove Current Worktree

Switch to the main repo, then run cleanup:

```bash
cd $(git rev-parse --show-toplevel)
bash skills/git-worktree/scripts/worktree-manager.sh cleanup
```

## Missing .env Files

```bash
bash skills/git-worktree/scripts/worktree-manager.sh copy-env feature-login
```
