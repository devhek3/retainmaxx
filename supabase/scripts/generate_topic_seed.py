#!/usr/bin/env python3
"""Generate the canonical topic seed with real, normalized gte-small vectors."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer


MODEL_ID = "Supabase/gte-small"
MODEL_REVISION = "93b36ff09519291b77d6000d2e86bd8565378086"
MODEL_FILENAME = "model_quantized.onnx"
MODEL_SHA256 = "18dec105109b6004369799ca4761fb8fb413c64172c02147bcfac186b5c5f6cb"
MODEL_FILES = {
    MODEL_FILENAME: MODEL_SHA256,
    "tokenizer.json": None,
}
EXPECTED_TOPICS = 45
EXPECTED_DIMENSIONS = 384
NORM_TOLERANCE = 1e-4


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    supabase_dir = script_dir.parent
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, default=supabase_dir / "seed" / "topics.json")
    parser.add_argument("--output", type=Path, default=supabase_dir / "seed.sql")
    parser.add_argument("--cache-dir", type=Path, default=supabase_dir / ".cache" / "gte-small")
    return parser.parse_args()


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"invalid generated slug for {name!r}: {slug!r}")
    return slug


def topic_text(topic: dict[str, object]) -> str:
    examples = "\n".join(f"- {example}" for example in topic["examples"])
    return f"Topic: {topic['name']}\nDefinition: {topic['definition']}\nExamples:\n{examples}"


def download_model_file(cache_dir: Path, filename: str, expected_sha256: str | None) -> Path:
    destination = cache_dir / filename
    cache_dir.mkdir(parents=True, exist_ok=True)
    if not destination.exists():
        url = f"https://huggingface.co/{MODEL_ID}/resolve/{MODEL_REVISION}/onnx/{filename}" if filename.endswith(".onnx") else f"https://huggingface.co/{MODEL_ID}/resolve/{MODEL_REVISION}/{filename}"
        with urllib.request.urlopen(url) as response, destination.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)

    if expected_sha256:
        digest = hashlib.sha256(destination.read_bytes()).hexdigest()
        if digest != expected_sha256:
            destination.unlink(missing_ok=True)
            raise ValueError(f"sha256 mismatch for {filename}: expected {expected_sha256}, got {digest}")
    return destination


def load_catalog(path: Path) -> list[dict[str, object]]:
    topics = json.loads(path.read_text())
    if not isinstance(topics, list) or len(topics) != EXPECTED_TOPICS:
        raise ValueError(f"catalog must contain exactly {EXPECTED_TOPICS} topics")

    names: set[str] = set()
    slugs: set[str] = set()
    for topic in topics:
        name = topic.get("name")
        definition = topic.get("definition")
        examples = topic.get("examples")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("every topic needs a nonblank name")
        if not isinstance(definition, str) or not definition.strip():
            raise ValueError(f"{name}: definition must be nonblank")
        if not isinstance(examples, list) or not 3 <= len(examples) <= 5:
            raise ValueError(f"{name}: expected 3 to 5 examples")
        if any(not isinstance(example, str) or not example.strip() for example in examples):
            raise ValueError(f"{name}: examples must be nonblank strings")
        slug = slugify(name)
        if name in names or slug in slugs:
            raise ValueError(f"duplicate topic name or slug: {name}")
        names.add(name)
        slugs.add(slug)
    return topics


def embed_topics(topics: list[dict[str, object]], cache_dir: Path) -> np.ndarray:
    model_path = download_model_file(cache_dir, MODEL_FILENAME, MODEL_FILES[MODEL_FILENAME])
    tokenizer_path = download_model_file(cache_dir, "tokenizer.json", MODEL_FILES["tokenizer.json"])
    tokenizer = Tokenizer.from_file(str(tokenizer_path))
    tokenizer.enable_truncation(max_length=512)
    tokenizer.enable_padding()
    encoded = tokenizer.encode_batch([topic_text(topic) for topic in topics])

    input_ids = np.asarray([item.ids for item in encoded], dtype=np.int64)
    attention_mask = np.asarray([item.attention_mask for item in encoded], dtype=np.int64)
    token_type_ids = np.asarray([item.type_ids for item in encoded], dtype=np.int64)
    session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    available_inputs = {item.name for item in session.get_inputs()}
    inputs = {"input_ids": input_ids, "attention_mask": attention_mask}
    if "token_type_ids" in available_inputs:
        inputs["token_type_ids"] = token_type_ids

    token_embeddings = session.run(None, inputs)[0]
    mask = attention_mask[:, :, None].astype(np.float32)
    vectors = (token_embeddings * mask).sum(axis=1) / mask.sum(axis=1)
    vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)

    if vectors.shape != (EXPECTED_TOPICS, EXPECTED_DIMENSIONS):
        raise ValueError(f"expected vectors shaped ({EXPECTED_TOPICS}, {EXPECTED_DIMENSIONS}), got {vectors.shape}")
    if not np.isfinite(vectors).all():
        raise ValueError("model returned a non-finite vector value")
    norms = np.linalg.norm(vectors, axis=1)
    if np.max(np.abs(norms - 1.0)) > NORM_TOLERANCE:
        raise ValueError(f"vectors are not normalized; norm range is {norms.min()} to {norms.max()}")
    return vectors


def sql_text(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    return "array[" + ", ".join(sql_text(value) for value in values) + "]::text[]"


def vector_literal(vector: np.ndarray) -> str:
    values = ",".join(format(float(value), ".9g") for value in vector)
    return sql_text(f"[{values}]") + "::extensions.vector(384)"


def build_seed(topics: list[dict[str, object]], vectors: np.ndarray) -> str:
    rows = []
    for display_order, (topic, vector) in enumerate(zip(topics, vectors, strict=True)):
        rows.append(
            "  ("
            + ", ".join(
                [
                    sql_text(slugify(str(topic["name"]))),
                    sql_text(str(topic["name"])),
                    sql_text(str(topic["definition"])),
                    sql_array(list(topic["examples"])),
                    vector_literal(vector),
                    str(display_order),
                    "true",
                ]
            )
            + ")"
        )

    slugs = ", ".join(sql_text(slugify(str(topic["name"]))) for topic in topics)
    return f"""-- Generated by supabase/scripts/generate_topic_seed.py.
-- Model: {MODEL_ID}@{MODEL_REVISION}; quantized ONNX sha256: {MODEL_SHA256}
-- Do not hand-edit vectors. Regenerate and let validation fail closed on drift.

begin;

update public.topics
set is_active = false, updated_at = now()
where slug not in ({slugs});

insert into public.topics
  (slug, name, definition, example_texts, embedding, display_order, is_active)
values
{',\n'.join(rows)}
on conflict (slug) do update
set name = excluded.name,
    definition = excluded.definition,
    example_texts = excluded.example_texts,
    embedding = excluded.embedding,
    display_order = excluded.display_order,
    is_active = true,
    updated_at = now();

do $$
begin
  if (select count(*) from public.topics where is_active) <> {EXPECTED_TOPICS} then
    raise exception 'topic seed must produce exactly {EXPECTED_TOPICS} active topics';
  end if;

  if exists (
    select 1
    from public.topics
    where extensions.vector_dims(embedding) <> {EXPECTED_DIMENSIONS}
       or abs(extensions.vector_norm(embedding) - 1.0) > {NORM_TOLERANCE}
  ) then
    raise exception 'topic seed contains an invalid dimension or non-normalized embedding';
  end if;
end
$$;

commit;
"""


def main() -> None:
    args = parse_args()
    topics = load_catalog(args.catalog)
    vectors = embed_topics(topics, args.cache_dir)
    seed = build_seed(topics, vectors)
    args.output.write_text(seed)
    print(f"wrote {len(topics)} validated {EXPECTED_DIMENSIONS}-dimension vectors to {args.output}")


if __name__ == "__main__":
    main()
