import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  serial,
  json,
  timestamp,
  primaryKey,
  index
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
})

export const roles = pgTable('roles', {
  userId: varchar('userId', { length: 256 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  canDelete: boolean('canDelete').notNull()
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey().notNull(),
  page: varchar('page', { length: 256 }).notNull(),
  thread: integer('thread'),
  author: varchar('author', { length: 256 }).notNull(),
  content: json('content').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull()
})

export const rates = pgTable(
  'rates',
  {
    userId: varchar('userId', { length: 256 }).notNull(),
    commentId: integer('commentId').notNull(),
    like: boolean('like').notNull()
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] }), index('comment_idx').on(table.commentId)]
)
