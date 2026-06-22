import { pgTable, serial, text, timestamp, boolean, numeric, integer } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content").notNull(),
	excerpt: text("excerpt"),
	published: boolean("published").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const news = pgTable("news", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content").notNull(),
	excerpt: text("excerpt"),
	sourceUrl: text("source_url"),
	sourceName: text("source_name"),
	imageUrl: text("image_url"),
	category: text("category").default("general").notNull(),
	publishedAt: timestamp("published_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull()
});

export const ihsgData = pgTable("ihsg_data", {
	id: serial("id").primaryKey(),
	ihsg: numeric("ihsg"),
	ihsgChange: numeric("ihsg_change"),
	ihsgChangePercent: numeric("ihsg_change_percent"),
	high: numeric("high"),
	low: numeric("low"),
	usdIdr: numeric("usd_idr"),
	usdIdrChange: numeric("usd_idr_change"),
	usdIdrChangePercent: numeric("usd_idr_change_percent"),
	gold: numeric("gold"),
	goldChange: numeric("gold_change"),
	goldChangePercent: numeric("gold_change_percent"),
	upCount: integer("up_count"),
	downCount: integer("down_count"),
	flatCount: integer("flat_count"),
	totalCount: integer("total_count"),
	createdAt: timestamp("created_at").defaultNow().notNull()
});
