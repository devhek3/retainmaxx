# RetainMaxx MVP data implementation

The authoritative design is the approved Lavish report. This implementation keeps Supabase Auth managed and adds only `topics`, `user_topics`, and `saves`.

## Source layout

- `supabase/migrations/20260911143915_implement_approved_mvp_data_model.sql` is the one corrective migration. It fails closed if the ownerless prototype `reels` table has rows.
- `supabase/seed/topics.json` is the human-reviewable 45-topic contract. `supabase/seed.sql` is generated from it with real `Supabase/gte-small` vectors.
- `supabase/functions/ingest-save/` contains the authenticated synchronous ingestion boundary and its injectable extraction, embedding, and persistence interfaces.
- `app/src/data/` contains the pinned client/session setup and only four data operations: `listTopics`, `listSaves`, `getSave`, and `deleteSave`.
- `supabase/tests/database/` and the app/function tests cover grants, RLS, vector matching, ingestion state transitions, and client query behavior.

PostgreSQL reports the matcher identity arguments as `p_user_id uuid, p_embedding vector`; vector typmods and the extension schema are intentionally omitted from that identity string. The migration's explicit function grant/revoke targets resolve to this same function.

## Topic vector generation

The generator pins the repository's quantized `Supabase/gte-small` ONNX artifact at revision `93b36ff09519291b77d6000d2e86bd8565378086` and verifies its SHA-256 before inference. It performs attention-mask mean pooling, normalizes each result, and refuses any vector that is not 384 finite values with unit norm.

```sh
python3 -m pip install -r supabase/scripts/requirements-topic-seed.txt
python3 supabase/scripts/generate_topic_seed.py
```

Model downloads happen only in this explicit generator, never in migration or seed SQL. The generated SQL repeats database-side count, dimension, and norm validation and is idempotent by topic slug.

The ingestion function uses the Edge Runtime's native `gte-small` session with mean pooling and normalization. `EMBEDDING_MODEL`, if configured, must equal `gte-small`; a mismatch fails closed. Topic and content embeddings must be regenerated together for any future model change.

## Ingestion integration contract

`ingest-save` requires the platform-verified user JWT. The handler calls Auth for the current user, derives ownership from that result, and uses the runtime-provided protected admin client for processor writes. The request accepts exactly:

```json
{ "source_url": "https://www.instagram.com/reel/example/" }
```

Set these protected function variables for the real extraction service:

- `EXTRACTION_API_URL`
- `EXTRACTION_API_TOKEN`
- `EMBEDDING_MODEL=gte-small` (optional assertion; no alternate model is accepted)

The extraction endpoint receives normalized platform, external ID, and canonical URL. It must return nonblank `title`, `transcript`, and `summary`; one to three `key_takeaways`; at most 12 `{ "at", "for" }` evidence objects; and an optional HTTPS `thumbnail_url`. Missing credentials deliberately return `extraction_unconfigured`; there is no fake provider fallback.

Duplicate source identities reuse the same row. `ready` duplicates return immediately, fresh `processing` duplicates do not start another attempt, and `failed` or ten-minute-stale `processing` rows may be reclaimed. Only one final update writes all derived knowledge, the normalized vector, SQL-produced topic similarity, and `ready` together.

## App cutover boundary

The mobile Supabase foundation uses only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, persists sessions, and handles native foreground token refresh. No Auth UI or provider was selected.

The current worktree has neither RetainMaxx backend configuration nor an Auth UI/session entry point. Cutting Library screens to authenticated reads would therefore replace working states with a guaranteed configuration/authentication error. The source-controlled `SAVED_VIDEOS` remains the sole runtime Library source until that external workstream lands. It is not written to Supabase, and no dual read/write path was added. The data module and its loading-success/empty/error-facing return contract are tested now so the eventual screen cutover is a single-source replacement.

Onboarding UI, AsyncStorage preference migration, and preference replacement remain untouched.

## Local verification

Run from the repository root:

```sh
app/node_modules/.bin/supabase start
app/node_modules/.bin/supabase db reset
app/node_modules/.bin/supabase migration list --local
app/node_modules/.bin/supabase test db
app/node_modules/.bin/supabase db lint --local --schema public --level warning --fail-on error
cd app && npm test -- --no-cache
cd app && npm run test:function
cd app && npx expo export --platform web
```

Hosted Database/Security advisors cannot be reviewed until the intended hosted project is identified and linked. No deploy command belongs in this implementation task.

## Validation record

Local validation on 2026-09-11 completed without contacting or mutating a hosted project:

- A clean local reset replayed both tracked migrations and the generated seed. The local migration list is aligned.
- All 53 pgTAP assertions passed, database lint reported no schema errors, and the local Security Advisor reported no findings.
- The local Performance Advisor reported two informational findings: the deliberately reviewed partial index does not begin with `saves.topic_id`, and it was unused immediately after reset. No extra index was added outside the approved index set.
- The seed has 45 unique active slugs, names, and display orders. Every vector has 384 dimensions; observed norms were 0.99999991–1.00000009. Regeneration from the pinned model cache was byte-for-byte identical to `seed.sql`.
- The actual corrective migration was replayed against a disposable database containing one prototype `reels` row. It raised the expected refusal and preserved that row.
- Representative 5,000-row `EXPLAIN (ANALYZE, BUFFERS)` checks used `saves_user_created_idx` for recent Library reads and `saves_user_topic_created_ready_idx` for ready topic-filter reads. The selected-topic matcher remained an exact function scan over five selections.
- All 20 app/data tests and all 8 ingestion tests passed. A real local Data API smoke check returned all 45 topics pre-auth, denied anonymous save reads, exposed only User A's save, and returned `null` for User B's detail ID. Expo web export completed, and repository scans found no JWT, secret-key value, or public secret variable.
- A local authenticated Edge integration completed capture → extraction stub → native `gte-small` embedding → selected-topic RPC → atomic `ready` persistence. PostgreSQL confirmed a 384-dimensional stored content vector and SQL-produced similarity; the duplicate returned the same ready row and a request without a user JWT returned 401.

The cold local `gte-small` inference took about 41 seconds. The function returned 201 and committed the ready row before the local Edge Runtime logged its CPU soft-limit warning and terminated the isolate. This resolves the earlier client-side timeout as a slow cold local inference, not a failed write, but it does **not** prove hosted latency or CPU headroom. The required deployment follow-up is a controlled staging capture with real extraction credentials, followed by duration/error review; queue infrastructure remains out of scope until that measurement demonstrates a need.

## Current documentation basis

- [Supabase changelog: Data API auto-exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Supabase local CLI workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Edge Function authentication](https://supabase.com/docs/guides/functions/auth)
- [Supabase vector columns](https://supabase.com/docs/guides/ai/vector-columns)
- [Supabase Edge Function testing](https://supabase.com/docs/guides/functions/unit-test)
- [pgvector operators and exact search](https://github.com/pgvector/pgvector)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
