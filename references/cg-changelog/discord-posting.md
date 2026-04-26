# Discord Posting (Optional, Lazy-Load)

Load this reference only when the user explicitly asks to post changelog output to Discord.

## Preconditions

- `DISCORD_WEBHOOK_URL` is available
- Changelog text is finalized
- For Discord posting, enforce message length <= 2000 characters

## Post Command

```bash
curl -H "Content-Type: application/json" \
  -d "{\"content\": \"{{CHANGELOG}}\"}" \
  "$DISCORD_WEBHOOK_URL"
```

## Safety Notes

- Do not post automatically unless user requests it.
- If output exceeds 2000 chars, shorten content before posting.
- If webhook fails, return the changelog text so user can post manually.

Length limiting is specific to the Discord posting path. Do not apply this limit to non-Discord changelog generation.
