import { assertEquals } from "https://deno.land/std@0.204.0/assert/assert_equals.ts"
import { tempAppFrom } from "../test_utils.ts"
import { postingController } from "./posting_controller.ts"

const { client } = await tempAppFrom(postingController)

Deno.test(`GET /postings/{id}`, async (t) => {
	await t.step("존재하지 않는 글 요청", async () => {
		const res = await client.postings[":id"].$get({ param: { id: "0" } })
		assertEquals(res.status, 404)
	})
	await t.step("존재하는 글 요청", async () => {
		const res = await client.postings[":id"].$get({ param: { id: "1" } })
		const json = await res.json()

		assertEquals(res.status, 200)
		assertEquals(Object.keys(json), [
			"id",
			"type",
			"title",
			"content",
			"content_id",
			"view_count",
			"like_count",
			"share_count",
			"updated_at",
			"created_at",
			"user_id",
		])
	})
})
