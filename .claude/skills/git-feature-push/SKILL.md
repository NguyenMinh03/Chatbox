---
name: git-feature-push
description: >
  Use this skill whenever the user says they've finished, completed, or wrapped up a feature, bug fix, or task in their project and wants it committed, pushed, or turned into a PR. Trigger on phrases like "I'm done with X", "finished the feature", "ready to push", "commit this", "push my changes", "open a PR", or "wrap this up" in the context of a git repository. Also use when the user asks Claude to write a commit message, draft a PR description, or review and stage changes before pushing. Handles the full workflow - inspecting git status and diff, confirming a summary of the changes with the user, writing a plain descriptive commit message, staging and committing, confirming before push, pushing to the remote, and optionally opening a GitHub PR via gh pr create with a drafted description.
---

# Git Feature Push

Workflow for wrapping up a finished feature: review changes, commit, confirm, push, and (optionally) open a PR.

## Step 1: Inspect the changes

Never guess what changed — always run these first:

```
git status
git diff
git diff --staged
git log --oneline -5
git branch --show-current
```

`git log` gives a feel for the existing commit style; `branch --show-current` confirms what branch this will land on.

## Step 2: Confirm with the user

Summarize, in plain language, what files changed and what the change appears to do. Ask the user to confirm this matches the feature they just finished — especially if:
- there are unrelated or unstaged changes mixed in that they didn't mention, or
- it's unclear which files belong to this feature.

If the change is small and obvious, a light confirmation is enough — don't over-ask. Do not stage/commit anything until the summary is confirmed.

## Step 3: Stage and write the commit message

- Stage only the relevant files (`git add <specific files>`). Avoid `git add -A`/`git add .` if there are unrelated changes present that the user didn't mention.
- Write the commit message as a **plain, descriptive sentence** — not Conventional Commits style. E.g. "Add JWT-based authentication for login and signup routes", not "feat: add auth".
- One line is usually enough. Only add a short body (blank line + 1-3 bullets) if the change is large, touches multiple unrelated areas, or has a breaking-change/migration note worth flagging.
- Show the drafted message to the user before committing.

## Step 4: Commit

Once the user is happy with the message:

```
git commit -m "<message>"
```

## Step 5: Confirm before pushing

**Always ask for explicit confirmation before running `git push`, even if the user approved the commit message.** State which branch and remote it will push to (e.g. "Push `feature/login` to `origin`?"). Push always needs its own yes — never bundle it into an earlier approval.

## Step 6: Push

After confirmation:

```
git push
```

Use `git push -u origin <branch>` instead if the branch has no upstream yet.

If the push fails (diverged branch, merge conflict, auth error), show the actual git error to the user rather than retrying blindly or force-pushing.

## Step 7: Optional PR

If the user wants a PR for this change:

1. Draft a PR description: a short summary, what changed, and how to test it if relevant.
2. Show the draft to the user and get confirmation before creating anything (this posts publicly to GitHub — always confirm first, same as with push).
3. Once confirmed:

```
gh pr create --title "<title>" --body "<description>"
```

If `gh` isn't installed or not authenticated, say so and hand the user the drafted title/description to paste in manually instead.

## Notes

- If there's no upstream branch yet, or the working tree has unrelated uncommitted changes, flag it and ask how to proceed rather than assuming.
- Never force-push, rewrite history, or push to `main`/`master` directly without calling that out explicitly to the user first.
- Match the message to what the diff actually shows — don't take the user's verbal description of the feature at face value if the diff tells a different story; point out discrepancies.
