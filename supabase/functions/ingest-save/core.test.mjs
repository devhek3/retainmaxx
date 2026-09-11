import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROCESSING_STALE_AFTER_MS,
  buildContentEmbeddingText,
  ingestSave,
  normalizeSourceUrl,
  validateEmbedding,
} from './core.ts';

const USER_ID = '10000000-0000-0000-0000-000000000001';
const SAVE_ID = '30000000-0000-0000-0000-000000000001';
const TOPIC_ID = '20000000-0000-0000-0000-000000000001';
const NOW = new Date('2026-09-11T12:00:00.000Z');
const UNIT_VECTOR = Object.freeze([1, ...Array(383).fill(0)]);

const KNOWLEDGE = Object.freeze({
  title: 'Build a consistent training habit',
  thumbnail_url: 'https://cdn.example.test/thumb.jpg',
  transcript: 'Consistency matters more than a burst of motivation.',
  summary: 'Use a small repeatable routine to make training consistent.',
  key_takeaways: ['Choose a small routine', 'Repeat it on a stable schedule'],
  evidence: [{ at: '00:08', for: 'A small routine is easier to repeat' }],
});

function makeRepository(status = 'pending', updatedAt = '2026-09-11T11:00:00.000Z') {
  const calls = [];
  return {
    calls,
    async upsertPending(userId, source) {
      calls.push(['upsertPending', userId, source]);
      return { id: SAVE_ID, processingStatus: status, updatedAt };
    },
    async claimProcessing(save, userId) {
      calls.push(['claimProcessing', save.id, userId]);
      return true;
    },
    async matchSelectedTopic(userId, embedding) {
      calls.push(['matchSelectedTopic', userId, embedding]);
      return { topicId: TOPIC_ID, similarity: 0.75 };
    },
    async markReady(input) {
      calls.push(['markReady', input]);
    },
    async markFailed(saveId, userId) {
      calls.push(['markFailed', saveId, userId]);
    },
  };
}

function request(body, method = 'POST') {
  return new Request('https://example.test/ingest-save', {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

function dependencies(repository, overrides = {}) {
  return {
    repository,
    extractor: { extract: async () => KNOWLEDGE },
    embedder: { embed: async () => UNIT_VECTOR },
    now: () => NOW,
    ...overrides,
  };
}

test('normalizes canonical Reel, TikTok video, and YouTube Shorts identities', () => {
  assert.deepEqual(normalizeSourceUrl('https://instagram.com/reel/Ab_C-12/?utm_source=copy'), {
    platform: 'instagram',
    externalId: 'Ab_C-12',
    url: 'https://www.instagram.com/reel/Ab_C-12/',
  });
  assert.deepEqual(normalizeSourceUrl('https://www.tiktok.com/@Creator/video/123456789?lang=en'), {
    platform: 'tiktok',
    externalId: '123456789',
    url: 'https://www.tiktok.com/@Creator/video/123456789',
  });
  assert.deepEqual(normalizeSourceUrl('https://m.youtube.com/shorts/aBcD_123-xy?feature=share'), {
    platform: 'youtube',
    externalId: 'aBcD_123-xy',
    url: 'https://www.youtube.com/shorts/aBcD_123-xy',
  });
  assert.throws(() => normalizeSourceUrl('http://youtube.com/shorts/aBcD_123-xy'), /source_url_must_be_https/);
  assert.throws(() => normalizeSourceUrl('https://example.com/video/123'), /unsupported_source_url/);
});

test('validates one finite normalized 384-dimensional embedding', () => {
  assert.equal(validateEmbedding(UNIT_VECTOR).length, 384);
  assert.throws(() => validateEmbedding(Array(383).fill(0)), /embedding_invalid/);
  assert.throws(() => validateEmbedding(Array(384).fill(1)), /embedding_not_normalized/);
});

test('rejects untrusted ownership and processor fields from the request body', async () => {
  const repository = makeRepository();
  const response = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/', user_id: 'attacker' }),
    USER_ID,
    dependencies(repository),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { code: 'untrusted_fields_rejected' });
  assert.deepEqual(repository.calls, []);
});

test('derives every write and selected-topic match from the authenticated user', async () => {
  const repository = makeRepository();
  const embeddingInputs = [];
  const response = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/?utm_source=copy' }),
    USER_ID,
    dependencies(repository, {
      embedder: {
        async embed(text) {
          embeddingInputs.push(text);
          return UNIT_VECTOR;
        },
      },
    }),
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { id: SAVE_ID, processing_status: 'ready' });
  assert.equal(repository.calls[0][1], USER_ID);
  assert.equal(repository.calls[0][2].url, 'https://www.instagram.com/reel/AbC123/');
  assert.deepEqual(repository.calls.find(([name]) => name === 'matchSelectedTopic').slice(1, 2), [USER_ID]);
  const ready = repository.calls.find(([name]) => name === 'markReady')[1];
  assert.equal(ready.userId, USER_ID);
  assert.equal(ready.match.similarity, 0.75);
  assert.equal(embeddingInputs.length, 1);
  assert.equal(embeddingInputs[0], buildContentEmbeddingText({
    title: KNOWLEDGE.title,
    thumbnailUrl: KNOWLEDGE.thumbnail_url,
    transcript: KNOWLEDGE.transcript,
    summary: KNOWLEDGE.summary,
    keyTakeaways: KNOWLEDGE.key_takeaways,
    evidence: KNOWLEDGE.evidence,
  }));
});

test('a duplicate ready save is idempotent and skips extraction', async () => {
  const repository = makeRepository('ready');
  let extracted = false;
  const response = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    USER_ID,
    dependencies(repository, { extractor: { extract: async () => { extracted = true; } } }),
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).idempotent, true);
  assert.equal(extracted, false);
  assert.equal(repository.calls.some(([name]) => name === 'claimProcessing'), false);
});

test('a fresh processing save is not claimed twice, while a stale save is retryable', async () => {
  const freshRepository = makeRepository('processing', new Date(NOW.getTime() - PROCESSING_STALE_AFTER_MS + 1).toISOString());
  const freshResponse = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    USER_ID,
    dependencies(freshRepository),
  );
  assert.equal(freshResponse.status, 202);
  assert.equal(freshRepository.calls.some(([name]) => name === 'claimProcessing'), false);

  const staleRepository = makeRepository('processing', new Date(NOW.getTime() - PROCESSING_STALE_AFTER_MS).toISOString());
  const staleResponse = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    USER_ID,
    dependencies(staleRepository),
  );
  assert.equal(staleResponse.status, 201);
  assert.equal(staleRepository.calls.some(([name]) => name === 'claimProcessing'), true);
});

test('no selected topic and extraction failures fail closed and mark the row failed', async () => {
  const noTopicRepository = makeRepository();
  noTopicRepository.matchSelectedTopic = async () => null;
  const noTopicResponse = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    USER_ID,
    dependencies(noTopicRepository),
  );
  assert.equal(noTopicResponse.status, 409);
  assert.equal((await noTopicResponse.json()).code, 'no_selected_topic');
  assert.equal(noTopicRepository.calls.some(([name]) => name === 'markFailed'), true);
  assert.equal(noTopicRepository.calls.some(([name]) => name === 'markReady'), false);

  const extractionRepository = makeRepository('failed');
  const extractionResponse = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    USER_ID,
    dependencies(extractionRepository, {
      extractor: { extract: async () => { throw new Error('provider token must stay private'); } },
    }),
  );
  assert.equal(extractionResponse.status, 502);
  assert.deepEqual(await extractionResponse.json(), { code: 'processing_failed', id: SAVE_ID });
  assert.equal(extractionRepository.calls.some(([name]) => name === 'markFailed'), true);
});

test('missing authenticated ownership is rejected before database access', async () => {
  const repository = makeRepository();
  const response = await ingestSave(
    request({ source_url: 'https://instagram.com/reel/AbC123/' }),
    '',
    dependencies(repository),
  );
  assert.equal(response.status, 401);
  assert.deepEqual(repository.calls, []);
});
