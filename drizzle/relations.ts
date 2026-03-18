import { relations } from "drizzle-orm/relations";
import { user, account, passkey, session, googleCalendarIntegration } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	passkeys: many(passkey),
	sessions: many(session),
	googleCalendarIntegrations: many(googleCalendarIntegration),
}));

export const passkeyRelations = relations(passkey, ({one}) => ({
	user: one(user, {
		fields: [passkey.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const googleCalendarIntegrationRelations = relations(googleCalendarIntegration, ({one}) => ({
	user: one(user, {
		fields: [googleCalendarIntegration.userId],
		references: [user.id]
	}),
}));