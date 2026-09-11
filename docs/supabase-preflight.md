# Supabase implementation preflight

Date: 2026-09-11

## Hosted state

This disposable worktree is not linked to a Supabase project: `supabase/.temp/project-ref` is absent, `supabase status` reports no project ref, and no `SUPABASE_*` or `SB_*` credential is present in the process environment. The authenticated CLI account can see two projects, but neither is named RetainMaxx and neither is linked, so selecting one by inference would be unsafe.

Consequently, the intended hosted project ref, its live PostgreSQL/pgvector versions, the existence and row counts of `public.topics`/`public.reels`, and live policies/grants/dependencies are **not established**. In particular, this note does not claim that `public.reels` is empty.

Before deployment, an operator must identify and link the intended project, then run [the read-only preflight](sql/hosted-preflight.sql). If `public.reels` contains any row, stop and obtain an explicit mapping from every row to `auth.users.id`. A URL or content creator is not ownership evidence.

## Source and local state

- Evidence base: clean `main` commit `38c18130679f7d9ef486a62d46f55fdb68203bfc` before this branch.
- Repository target: PostgreSQL 17; Data API schemas `public` and `graphql_public`.
- Historical migration `20260904212850_create_reel_intelligence_schema.sql` creates `topics` and ownerless `reels`, with unconstrained vector dimensions and no client policies. It remains unchanged.
- The corrective migration aborts before dropping anything when `public.reels` contains rows. It uses non-cascading drops, so an unreviewed dependency also stops replacement.
- `api.auto_expose_new_tables` is explicitly false. The migration grants every intended operation explicitly.

Local verification is recorded in [the implementation runbook](mvp-data-model.md). No command in this task linked, pushed, reset, seeded, or otherwise mutated a hosted Supabase project.
