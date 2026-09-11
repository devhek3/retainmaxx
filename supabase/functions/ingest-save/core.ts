export const EMBEDDING_DIMENSIONS = 384
export const EMBEDDING_MODEL = "gte-small"
export const PROCESSING_STALE_AFTER_MS = 10 * 60 * 1000

export type SourcePlatform = "instagram" | "tiktok" | "youtube"

export interface NormalizedSource {
  platform: SourcePlatform
  externalId: string
  url: string
}

export interface EvidenceItem {
  at: string
  for: string
}

export interface ExtractedKnowledge {
  title: string
  thumbnailUrl: string | null
  transcript: string
  summary: string
  keyTakeaways: string[]
  evidence: EvidenceItem[]
}

export interface SaveState {
  id: string
  processingStatus: "pending" | "processing" | "ready" | "failed"
  updatedAt: string
}

export interface TopicMatch {
  topicId: string
  similarity: number
}

export interface SaveRepository {
  upsertPending(userId: string, source: NormalizedSource): Promise<SaveState>
  claimProcessing(save: SaveState, userId: string, now: string): Promise<boolean>
  matchSelectedTopic(userId: string, embedding: number[]): Promise<TopicMatch | null>
  markReady(input: {
    saveId: string
    userId: string
    knowledge: ExtractedKnowledge
    embedding: number[]
    match: TopicMatch
    now: string
  }): Promise<void>
  markFailed(saveId: string, userId: string, now: string): Promise<void>
}

export interface ExtractionService {
  extract(source: NormalizedSource): Promise<unknown>
}

export interface EmbeddingService {
  embed(text: string): Promise<unknown>
}

export interface IngestDependencies {
  repository: SaveRepository
  extractor: ExtractionService
  embedder: EmbeddingService
  now?: () => Date
}

export class IngestError extends Error {
  code: string
  status: number

  constructor(code: string, status: number, message = code) {
    super(message)
    this.name = "IngestError"
    this.code = code
    this.status = status
  }
}

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "")
}

function requireMatch(value: string | undefined, pattern: RegExp, code: string): string {
  if (!value || !pattern.test(value)) {
    throw new IngestError(code, 400)
  }
  return value
}

export function normalizeSourceUrl(input: unknown): NormalizedSource {
  if (typeof input !== "string" || !input.trim()) {
    throw new IngestError("source_url_required", 400)
  }

  let parsed: URL
  try {
    parsed = new URL(input.trim())
  } catch {
    throw new IngestError("source_url_invalid", 400)
  }

  if (parsed.protocol !== "https:") {
    throw new IngestError("source_url_must_be_https", 400)
  }

  const host = normalizeHost(parsed.hostname)
  const parts = parsed.pathname.split("/").filter(Boolean)

  if (host === "instagram.com") {
    if (parts[0] !== "reel" || parts.length < 2) {
      throw new IngestError("unsupported_instagram_url", 400)
    }
    const externalId = requireMatch(parts[1], /^[A-Za-z0-9_-]+$/, "unsupported_instagram_url")
    return {
      platform: "instagram",
      externalId,
      url: `https://www.instagram.com/reel/${externalId}/`,
    }
  }

  if (host === "tiktok.com") {
    if (!parts[0]?.startsWith("@") || parts[1] !== "video" || parts.length < 3) {
      throw new IngestError("unsupported_tiktok_url", 400)
    }
    const username = requireMatch(parts[0].slice(1), /^[A-Za-z0-9._-]+$/, "unsupported_tiktok_url")
    const externalId = requireMatch(parts[2], /^\d+$/, "unsupported_tiktok_url")
    return {
      platform: "tiktok",
      externalId,
      url: `https://www.tiktok.com/@${username}/video/${externalId}`,
    }
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parts[0] !== "shorts" || parts.length < 2) {
      throw new IngestError("unsupported_youtube_url", 400)
    }
    const externalId = requireMatch(parts[1], /^[A-Za-z0-9_-]{6,20}$/, "unsupported_youtube_url")
    return {
      platform: "youtube",
      externalId,
      url: `https://www.youtube.com/shorts/${externalId}`,
    }
  }

  throw new IngestError("unsupported_source_url", 400)
}

function requireNonblank(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new IngestError("extraction_invalid", 502, `${field} must be a nonblank string`)
  }
  return value.trim()
}

export function validateExtractedKnowledge(value: unknown): ExtractedKnowledge {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new IngestError("extraction_invalid", 502)
  }

  const input = value as Record<string, unknown>
  const keyTakeaways = input.key_takeaways
  if (!Array.isArray(keyTakeaways) || keyTakeaways.length < 1 || keyTakeaways.length > 3) {
    throw new IngestError("extraction_invalid", 502, "key_takeaways must contain 1 to 3 items")
  }

  const evidence = input.evidence
  if (!Array.isArray(evidence) || evidence.length > 12) {
    throw new IngestError("extraction_invalid", 502, "evidence must be a bounded array")
  }

  const thumbnailUrl = input.thumbnail_url
  if (thumbnailUrl !== null && thumbnailUrl !== undefined) {
    const normalizedThumbnail = requireNonblank(thumbnailUrl, "thumbnail_url")
    let parsedThumbnail: URL
    try {
      parsedThumbnail = new URL(normalizedThumbnail)
    } catch {
      throw new IngestError("extraction_invalid", 502, "thumbnail_url must be a valid URL")
    }
    if (parsedThumbnail.protocol !== "https:") {
      throw new IngestError("extraction_invalid", 502, "thumbnail_url must use HTTPS")
    }
  }

  return {
    title: requireNonblank(input.title, "title"),
    thumbnailUrl: thumbnailUrl == null ? null : String(thumbnailUrl).trim(),
    transcript: requireNonblank(input.transcript, "transcript"),
    summary: requireNonblank(input.summary, "summary"),
    keyTakeaways: keyTakeaways.map((item) => requireNonblank(item, "key_takeaways item")),
    evidence: evidence.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new IngestError("extraction_invalid", 502, "evidence entries must be objects")
      }
      const entry = item as Record<string, unknown>
      return {
        at: requireNonblank(entry.at, "evidence.at"),
        for: requireNonblank(entry.for, "evidence.for"),
      }
    }),
  }
}

export function buildContentEmbeddingText(knowledge: ExtractedKnowledge): string {
  return [
    `Title: ${knowledge.title}`,
    `Summary: ${knowledge.summary}`,
    "Takeaways:",
    ...knowledge.keyTakeaways.map((takeaway) => `- ${takeaway}`),
  ].join("\n")
}

export function validateEmbedding(value: unknown): number[] {
  const vector = ArrayBuffer.isView(value)
    ? Array.from(value as unknown as ArrayLike<number>)
    : value

  if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new IngestError("embedding_invalid", 502)
  }
  if (vector.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
    throw new IngestError("embedding_invalid", 502)
  }

  const norm = Math.sqrt(vector.reduce((total, item) => total + item * item, 0))
  if (Math.abs(norm - 1) > 1e-3) {
    throw new IngestError("embedding_not_normalized", 502)
  }
  return vector
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status })
}

function isFreshProcessing(save: SaveState, now: Date): boolean {
  if (save.processingStatus !== "processing") return false
  const updatedAt = new Date(save.updatedAt).getTime()
  return Number.isFinite(updatedAt) && now.getTime() - updatedAt < PROCESSING_STALE_AFTER_MS
}

export async function ingestSave(
  request: Request,
  authenticatedUserId: string,
  dependencies: IngestDependencies,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, { code: "method_not_allowed" })
  }
  if (!authenticatedUserId) {
    return jsonResponse(401, { code: "unauthorized" })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse(400, { code: "invalid_json" })
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse(400, { code: "invalid_request" })
  }
  const bodyKeys = Object.keys(body as Record<string, unknown>)
  if (bodyKeys.some((key) => key !== "source_url")) {
    return jsonResponse(400, { code: "untrusted_fields_rejected" })
  }

  let source: NormalizedSource
  try {
    source = normalizeSourceUrl((body as Record<string, unknown>).source_url)
  } catch (error) {
    if (error instanceof IngestError) return jsonResponse(error.status, { code: error.code })
    return jsonResponse(400, { code: "source_url_invalid" })
  }

  const now = dependencies.now?.() ?? new Date()
  const nowIso = now.toISOString()
  let save: SaveState
  try {
    save = await dependencies.repository.upsertPending(authenticatedUserId, source)
  } catch {
    return jsonResponse(503, { code: "save_unavailable" })
  }

  if (save.processingStatus === "ready") {
    return jsonResponse(200, { id: save.id, processing_status: "ready", idempotent: true })
  }
  if (isFreshProcessing(save, now)) {
    return jsonResponse(202, { id: save.id, processing_status: "processing", idempotent: true })
  }

  try {
    const claimed = await dependencies.repository.claimProcessing(save, authenticatedUserId, nowIso)
    if (!claimed) {
      return jsonResponse(202, { id: save.id, processing_status: "processing", idempotent: true })
    }

    const knowledge = validateExtractedKnowledge(await dependencies.extractor.extract(source))
    const contentText = buildContentEmbeddingText(knowledge)
    const embedding = validateEmbedding(await dependencies.embedder.embed(contentText))
    const match = await dependencies.repository.matchSelectedTopic(authenticatedUserId, embedding)
    if (!match) {
      throw new IngestError("no_selected_topic", 409)
    }
    if (!Number.isFinite(match.similarity) || match.similarity < -1 || match.similarity > 1) {
      throw new IngestError("topic_match_invalid", 502)
    }

    await dependencies.repository.markReady({
      saveId: save.id,
      userId: authenticatedUserId,
      knowledge,
      embedding,
      match,
      now: nowIso,
    })
    return jsonResponse(201, { id: save.id, processing_status: "ready" })
  } catch (error) {
    try {
      await dependencies.repository.markFailed(save.id, authenticatedUserId, nowIso)
    } catch {
      // The response stays generic; database diagnostics remain in protected logs.
    }
    if (error instanceof IngestError) return jsonResponse(error.status, { code: error.code, id: save.id })
    return jsonResponse(502, { code: "processing_failed", id: save.id })
  }
}
