import "@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "@supabase/supabase-js/cors"
import { withSupabase } from "@supabase/server"

import {
  EMBEDDING_MODEL,
  IngestError,
  ingestSave,
  type ExtractedKnowledge,
  type NormalizedSource,
  type SaveRepository,
  type SaveState,
} from "./core.ts"

type SupabaseAdminClient = any

class SupabaseSaveRepository implements SaveRepository {
  client: SupabaseAdminClient

  constructor(client: SupabaseAdminClient) {
    this.client = client
  }

  async upsertPending(userId: string, source: NormalizedSource): Promise<SaveState> {
    const { data, error } = await this.client
      .from("saves")
      .upsert(
        {
          user_id: userId,
          source_platform: source.platform,
          source_external_id: source.externalId,
          source_url: source.url,
        },
        { onConflict: "user_id,source_platform,source_external_id" },
      )
      .select("id,processing_status,updated_at")
      .single()
    if (error || !data) throw new Error("save upsert failed")
    return {
      id: data.id,
      processingStatus: data.processing_status,
      updatedAt: data.updated_at,
    }
  }

  async claimProcessing(save: SaveState, userId: string, now: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("saves")
      .update({ processing_status: "processing", updated_at: now })
      .eq("id", save.id)
      .eq("user_id", userId)
      .eq("updated_at", save.updatedAt)
      .in("processing_status", ["pending", "failed", "processing"])
      .select("id")
      .maybeSingle()
    if (error) throw new Error("save claim failed")
    return Boolean(data)
  }

  async matchSelectedTopic(userId: string, embedding: number[]) {
    const { data, error } = await this.client.rpc("match_selected_topic", {
      p_user_id: userId,
      p_embedding: embedding,
    })
    if (error) throw new Error("topic match failed")
    const match = data?.[0]
    return match ? { topicId: match.topic_id, similarity: match.similarity } : null
  }

  async markReady(input: {
    saveId: string
    userId: string
    knowledge: ExtractedKnowledge
    embedding: number[]
    match: { topicId: string; similarity: number }
    now: string
  }): Promise<void> {
    const { data, error } = await this.client
      .from("saves")
      .update({
        title: input.knowledge.title,
        thumbnail_url: input.knowledge.thumbnailUrl,
        transcript: input.knowledge.transcript,
        summary: input.knowledge.summary,
        key_takeaways: input.knowledge.keyTakeaways,
        evidence: input.knowledge.evidence,
        content_embedding: input.embedding,
        topic_id: input.match.topicId,
        topic_similarity: input.match.similarity,
        processing_status: "ready",
        processed_at: input.now,
        updated_at: input.now,
      })
      .eq("id", input.saveId)
      .eq("user_id", input.userId)
      .eq("processing_status", "processing")
      .select("id")
      .single()
    if (error || !data) throw new Error("ready update failed")
  }

  async markFailed(saveId: string, userId: string, now: string): Promise<void> {
    const { error } = await this.client
      .from("saves")
      .update({ processing_status: "failed", updated_at: now })
      .eq("id", saveId)
      .eq("user_id", userId)
      .eq("processing_status", "processing")
    if (error) throw new Error("failed-state update failed")
  }
}

class ConfiguredExtractionService {
  endpoint: string
  token: string

  constructor() {
    this.endpoint = Deno.env.get("EXTRACTION_API_URL") ?? ""
    this.token = Deno.env.get("EXTRACTION_API_TOKEN") ?? ""
  }

  async extract(source: NormalizedSource): Promise<unknown> {
    if (!this.endpoint || !this.token) {
      throw new IngestError("extraction_unconfigured", 503)
    }
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ source }),
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) throw new IngestError("extraction_failed", 502)
    return response.json()
  }
}

declare const Supabase: {
  ai: {
    Session: new (model: string) => {
      run: (text: string, options: { mean_pool: boolean; normalize: boolean }) => Promise<unknown>
    }
  }
}

class GteSmallEmbeddingService {
  constructor() {
    const configuredModel = Deno.env.get("EMBEDDING_MODEL") ?? EMBEDDING_MODEL
    if (configuredModel !== EMBEDDING_MODEL) {
      throw new IngestError("embedding_model_mismatch", 503)
    }
  }

  embed(text: string): Promise<unknown> {
    gteSmallSession ??= new Supabase.ai.Session(EMBEDDING_MODEL)
    return gteSmallSession.run(text, { mean_pool: true, normalize: true })
  }
}

let gteSmallSession: InstanceType<typeof Supabase.ai.Session> | undefined

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

const authenticatedFetch = withSupabase({ auth: "user" }, async (req, ctx) => {
  const { data, error } = await ctx.supabase.auth.getUser()
  if (error || !data.user) {
    return Response.json({ code: "unauthorized" }, { status: 401 })
  }

  return ingestSave(req, data.user.id, {
    repository: new SupabaseSaveRepository(ctx.supabaseAdmin),
    extractor: new ConfiguredExtractionService(),
    embedder: new GteSmallEmbeddingService(),
  })
})

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders })
    }
    return withCors(await authenticatedFetch(request))
  },
}
