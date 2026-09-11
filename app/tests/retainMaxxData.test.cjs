const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  deleteSave,
  getSave,
  listSaves,
  listTopics,
} = require('../src/data/retainMaxxData.cjs');

function createClient(result = { data: [] }) {
  const calls = [];
  const builder = {
    delete() { calls.push(['delete']); return builder; },
    eq(column, value) { calls.push(['eq', column, value]); return builder; },
    limit(value) { calls.push(['limit', value]); return builder; },
    lt(column, value) { calls.push(['lt', column, value]); return builder; },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result); },
    order(column, options) { calls.push(['order', column, options]); return builder; },
    select(columns) { calls.push(['select', columns]); return builder; },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
  };
  return {
    calls,
    from(table) { calls.push(['from', table]); return builder; },
  };
}

test('listTopics reads only the ordered active catalogue', async () => {
  const topics = [{ id: 'topic-1', slug: 'fitness', name: 'Fitness' }];
  const client = createClient({ data: topics });

  assert.deepEqual(await listTopics(client), topics);
  assert.deepEqual(client.calls, [
    ['from', 'topics'],
    ['select', 'id,slug,name'],
    ['eq', 'is_active', true],
    ['order', 'display_order', { ascending: true }],
  ]);
});

test('listSaves keeps ready-state, topic, keyset, order, and page bounds in one query', async () => {
  const saves = [{ id: 'save-1', title: 'Ready item' }];
  const client = createClient({ data: saves });

  assert.deepEqual(await listSaves(client, {
    topicId: 'topic-1',
    beforeCreatedAt: '2026-09-11T10:00:00Z',
    limit: 500,
  }), saves);
  assert.ok(client.calls.some((call) => call[0] === 'eq' && call[1] === 'processing_status' && call[2] === 'ready'));
  assert.ok(client.calls.some((call) => call[0] === 'eq' && call[1] === 'topic_id' && call[2] === 'topic-1'));
  assert.ok(client.calls.some((call) => call[0] === 'lt' && call[1] === 'created_at'));
  assert.ok(client.calls.some((call) => call[0] === 'limit' && call[1] === 50));
  assert.ok(client.calls.some((call) => call[0] === 'order' && call[1] === 'created_at' && call[2].ascending === false));
});

test('getSave returns null for both missing and RLS-hidden rows', async () => {
  const client = createClient({ data: null });
  assert.equal(await getSave(client, 'save-not-visible'), null);
  assert.ok(client.calls.some((call) => call[0] === 'eq' && call[1] === 'processing_status' && call[2] === 'ready'));
  assert.ok(client.calls.some((call) => call[0] === 'maybeSingle'));
});

test('deleteSave reports whether an owned row was deleted', async () => {
  assert.equal(await deleteSave(createClient({ data: { id: 'save-1' } }), 'save-1'), true);
  assert.equal(await deleteSave(createClient({ data: null }), 'other-users-save'), false);
});

test('data errors are exposed to the screen state boundary', async () => {
  const expected = new Error('offline');
  await assert.rejects(() => listSaves(createClient({ data: null, error: expected })), expected);
  await assert.rejects(() => getSave(createClient({ data: null, error: expected }), 'save-1'), expected);
  await assert.rejects(() => deleteSave(createClient({ data: null, error: expected }), 'save-1'), expected);
});

test('the mobile configuration contains publishable values only', () => {
  const appRoot = path.resolve(__dirname, '..');
  const files = [
    path.join(appRoot, '.env.example'),
    path.join(appRoot, 'src', 'data', 'supabaseClient.js'),
  ];
  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert.match(source, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(source, /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(source, /service[_-]?role|SUPABASE_SECRET_KEY|EXPO_PUBLIC_.*SECRET/i);
});
