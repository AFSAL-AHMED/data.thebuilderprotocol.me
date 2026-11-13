# Contributing to TBP Dataset Commons

Thank you for your interest in contributing to **TBP Dataset Commons** — the open dataset discovery hub by [The Builder Protocol](https://thebuilderprotocol.me).

This guide explains how to submit datasets, contribute code, and participate in the community.

---

## Table of Contents

1. [Dataset Submission Process](#dataset-submission-process)
2. [The Review Process](#the-review-process)
3. [Dataset Quality Standards](#dataset-quality-standards)
4. [Code Contributions](#code-contributions)
5. [Development Setup](#development-setup)
6. [Pull Request Guidelines](#pull-request-guidelines)
7. [Community Guidelines & Code of Conduct](#community-guidelines--code-of-conduct)
8. [Getting Help](#getting-help)

---

## Dataset Submission Process

### Who can submit?

Anyone with a registered account can submit a dataset. Submissions are reviewed by the TBP team before being published.

### What makes a good dataset submission?

A high-quality submission should:

- **Have a clear, descriptive title** — something another developer or researcher would search for.
- **Include a meaningful short description** (≤ 500 characters) and a detailed full description.
- **Link to a stable, working source URL** — institutional repositories, Kaggle, Hugging Face, GitHub, government portals, etc.
- **Have an accurate licence** — if you are unsure, check the original source; do not guess.
- **Declare the file format(s)** (CSV, JSON, Parquet, …).
- **Provide record and column counts** where available.
- **Describe known limitations** — bias, incompleteness, staleness, geographic gaps.
- **State the intended use** — be honest about what this data is good (and not good) for.
- **Include citation information** if the dataset accompanies an academic paper or report.

### Step-by-step

1. **Register or log in** at [data.thebuilderprotocol.me](https://data.thebuilderprotocol.me).
2. Click **Submit a Dataset**.
3. Fill in all required fields in the submission form.
4. Click **Submit for Review**. Your dataset will appear as **Pending** in your profile.
5. Wait for a reviewer to process your submission (target: 5 business days).
6. You will receive an email notification when your submission is **Approved**, **Rejected**, or when **Corrections are requested**.

---

## The Review Process

Reviewers (TBP admins) evaluate each submission against the following criteria:

| Criterion           | What we check                                                            |
|---------------------|--------------------------------------------------------------------------|
| **Source validity** | Does the source URL work? Is the dataset where it says it is?           |
| **Licence accuracy**| Does the declared licence match the actual source licence?               |
| **Metadata quality**| Are descriptions accurate, complete, and readable?                      |
| **Data quality**    | Is the record count plausible? Are file formats correct?                |
| **Policy compliance**| Does the dataset comply with our content policy (no PII, no illegal content)? |

### Outcomes

| Status | Meaning |
|---|---|
| `pending` | Awaiting review. |
| `approved` | Published — visible to all visitors. |
| `correction_requested` | Reviewer has left notes; resubmit after fixing. |
| `rejected` | Does not meet our standards; rejection reason provided. |

If your submission is **rejected**, you are welcome to fix the issues and re-submit as a new entry.

---

## Dataset Quality Standards

We do not require perfect datasets — we require **honest** ones.

- **Do** disclose if data is a sample or subset.
- **Do** list known biases and limitations.
- **Do not** misrepresent the size, scope, or licence.
- **Do not** submit datasets that contain personally identifiable information (PII) unless it has been properly anonymised and the licence permits redistribution.
- **Do not** submit duplicates — search first.

---

## Code Contributions

We welcome bug fixes, improvements, and new features. The codebase is split into:

- `backend/` — Python 3.11, FastAPI, SQLAlchemy 2.0 async
- `frontend/` — React 18, TypeScript, Vite, Tailwind CSS

### Good first issues

Look for issues labelled `good first issue` or `help wanted` on GitHub.

---

## Development Setup

See the full instructions in [README.md](./README.md). Quick recap:

```bash
git clone https://github.com/thebuilderprotocol/data.thebuilderprotocol.me.git
cd data.thebuilderprotocol.me
cp backend/.env.example .env
docker compose up --build
```

### Running tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend (type-check + build)
cd frontend
pnpm tsc --noEmit
pnpm build
```

---

## Pull Request Guidelines

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Keep PRs focused** — one feature or fix per PR; avoid unrelated changes.

3. **Write or update tests** for any backend logic you change.

4. **Follow the existing code style**:
   - Backend: [Ruff](https://github.com/astral-sh/ruff) for linting; type annotations required.
   - Frontend: ESLint + Prettier; TypeScript strict mode.

5. **Write a clear PR description** explaining *what* changed and *why*.

6. **Ensure CI passes** before requesting review (GitHub Actions runs automatically).

7. **Keep commits clean** — squash fixup commits before merging.

8. **Address review comments promptly** — PRs inactive for 30 days may be closed.

### Commit message format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(datasets): add full-text search endpoint
fix(auth): handle expired refresh tokens correctly
docs(readme): update local dev instructions
chore(deps): bump fastapi to 0.111
```

---

## Community Guidelines & Code of Conduct

TBP Dataset Commons is an open, respectful community. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) Code of Conduct.

**In short:**

- Be kind and constructive in all interactions.
- Respect different skill levels and backgrounds.
- Harassment, discrimination, or bad-faith behaviour will not be tolerated.
- Critique ideas, never people.

If you experience or witness a violation, please email **conduct@thebuilderprotocol.me**.

---

## Getting Help

- **GitHub Discussions** — for questions, ideas, and feedback.
- **GitHub Issues** — for reproducible bugs only; include steps to reproduce.
- **Email** — [hello@thebuilderprotocol.me](mailto:hello@thebuilderprotocol.me) for anything that does not fit above.

We appreciate every contribution — whether it is a dataset, a bug report, a one-line fix, or simply spreading the word. Thank you for helping build a better commons.

— The Builder Protocol team
