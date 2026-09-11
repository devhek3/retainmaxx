const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 50;

function assertClient(supabase) {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new TypeError('A configured Supabase client is required');
  }
}

function resultOrThrow(result) {
  if (result.error) {
    throw result.error;
  }
  return result.data;
}

async function listTopics(supabase) {
  assertClient(supabase);
  const result = await supabase
    .from('topics')
    .select('id,slug,name')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return resultOrThrow(result) ?? [];
}

async function listSaves(supabase, options = {}) {
  assertClient(supabase);
  const requestedLimit = Number.isInteger(options.limit) ? options.limit : DEFAULT_PAGE_SIZE;
  const limit = Math.max(1, Math.min(requestedLimit, MAX_PAGE_SIZE));
  let query = supabase
    .from('saves')
    .select('id,title,source_platform,thumbnail_url,topic_id,created_at,topic:topics(id,slug,name)')
    .eq('processing_status', 'ready')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options.topicId) {
    query = query.eq('topic_id', options.topicId);
  }
  if (options.beforeCreatedAt) {
    query = query.lt('created_at', options.beforeCreatedAt);
  }

  const result = await query;
  return resultOrThrow(result) ?? [];
}

async function getSave(supabase, id) {
  assertClient(supabase);
  if (!id) throw new TypeError('A save id is required');

  const result = await supabase
    .from('saves')
    .select('id,title,source_url,source_platform,thumbnail_url,transcript,summary,key_takeaways,evidence,topic_id,topic_similarity,created_at,processed_at,topic:topics(id,slug,name)')
    .eq('id', id)
    .eq('processing_status', 'ready')
    .maybeSingle();
  return resultOrThrow(result) ?? null;
}

async function deleteSave(supabase, id) {
  assertClient(supabase);
  if (!id) throw new TypeError('A save id is required');

  const result = await supabase
    .from('saves')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  return Boolean(resultOrThrow(result));
}

module.exports = {
  deleteSave,
  getSave,
  listSaves,
  listTopics,
};
