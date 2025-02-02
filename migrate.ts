import { ColumnDefinitionBuilder as CDB, Kysely, sql } from "kysely"
import { DB as Database } from "sqlite"
import { DenoSqliteDialect } from "kysely_sqlite"

const primaryKey = (col: CDB) => col.notNull().primaryKey().autoIncrement()
const text = (name: string) => [name, "text", (col: CDB) => col.notNull()] as const
const count = (name: string) => [name, "integer", (col: CDB) => col.notNull().defaultTo(0)] as const
const timestamp = (name: "created_at" | "updated_at") =>
	[name, "text", (col: CDB) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)] as const

const id = ["id", "integer", primaryKey] as const

export const tables = {
	user: "user",
	hashtag: "hashtag",
	posting: "posting",
	postingToHashtag: "posting_to_hashtag",
} as const

export const upUser = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.user)
		.addColumn(...id)
		.addColumn(...text("email"))
		.addColumn(...text("password"))
		.addColumn(...timestamp("created_at"))

export const upHashTag = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.hashtag)
		.addColumn(...id)
		.addColumn(...text("content"))

export const upPosting = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.posting)
		.addColumn(...id)
		.addColumn("type", "text", (col) =>
			col.notNull()
				.check(sql`type IN ('facebook', 'twitter', 'instagram', 'threads')`))
		.addColumn(...text("title"))
		.addColumn(...text("content"))
		.addColumn(...text("content_id"))
		.addColumn(...count("view_count"))
		.addColumn(...count("like_count"))
		.addColumn(...count("share_count"))
		.addColumn(...timestamp("updated_at"))
		.addColumn(...timestamp("created_at"))
		.addColumn("user_id", "integer", (col) =>
			col.references(`${tables.user}.id`).notNull().onDelete("cascade"))

export const upPostingHashTag = (db: Kysely<unknown>) =>
	db.schema
		.createTable(tables.postingToHashtag)
		.addColumn("posting_id", "integer", (col) => col.references(`${tables.user}.id`).notNull())
		.addColumn("hashtag_id", "integer", (col) => col.references(`${tables.hashtag}.id`).notNull())
		.addPrimaryKeyConstraint("primary_key", ["posting_id", "hashtag_id"])

export const ups = [upUser, upHashTag, upPosting, upPostingHashTag]

export const up = async (db: Kysely<unknown>) =>
	await Promise.all(ups.map((up) => up(db).execute()))

export const down = async (db: Kysely<unknown>) => {
	await db.schema.dropTable(tables.postingToHashtag).execute()
	await db.schema.dropTable(tables.posting).execute()
	await db.schema.dropTable(tables.hashtag).execute()
	await db.schema.dropTable(tables.user).execute()
}

if (import.meta.main) {
	const sqlite = new Database("test.db")
	const db = new Kysely<unknown>({
		dialect: new DenoSqliteDialect({ database: sqlite }),
	})

	await down(db)
	await up(db)
}
