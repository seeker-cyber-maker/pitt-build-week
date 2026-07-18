import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const load = async (name) => JSON.parse(await readFile(new URL(`../CONTROL/fixtures/${name}`, import.meta.url), "utf8"));

test("seeded report input carries only the bounded demo contract", async () => {
  const input = await load("report-input.seeded-demo.v1.json");
  assert.equal(input.schema_version, "pitt.report-input.v1");
  assert.equal(input.scenario.mode, "seeded_demo");
  assert.equal(input.proposed_decision.driver_review_required, true);
  assert.equal(input.data_handling.outbound_provider_authorized, false);
  assert.equal(JSON.stringify(input).match(/vin|license|latitude|longitude|api[_-]?key/i), null);
});

test("fallback report keeps provenance and driver review visible", async () => {
  const output = await load("report-output.fallback.v1.json");
  assert.equal(output.schema_version, "pitt.report-draft.v1");
  assert.equal(output.status, "fallback_ready");
  assert.equal(output.provenance.kind, "deterministic_fallback");
  assert.equal(output.review.required, true);
  assert.equal(output.review.confirmed, false);
});
