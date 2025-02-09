-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_embed_configs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "chat_mode" TEXT NOT NULL DEFAULT 'query',
    "allowlist_domains" TEXT,
    "allow_model_override" BOOLEAN NOT NULL DEFAULT false,
    "allow_temperature_override" BOOLEAN NOT NULL DEFAULT false,
    "allow_prompt_override" BOOLEAN NOT NULL DEFAULT false,
    "max_chats_per_day" INTEGER,
    "max_chats_per_session" INTEGER,
    "createdBy" INTEGER,
    "usersId" INTEGER,
    "workspace_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatIcon" TEXT DEFAULT 'plus',
    "buttonColor" TEXT DEFAULT '#262626',
    "userBgColor" TEXT DEFAULT '#2C2F35',
    "assistantBgColor" TEXT DEFAULT '#2563eb',
    "assistantName" TEXT DEFAULT 'AnythingLLM Chat Assistant',
    "assistantIcon" TEXT,
    "windowHeight" TEXT DEFAULT '700px',
    "windowWidth" TEXT DEFAULT '400px',
    "textSize" TEXT DEFAULT '14',
    "openOnLoad" BOOLEAN DEFAULT false,
    "supportEmail" TEXT,
    "defaultMessages" TEXT,
    CONSTRAINT "embed_configs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "embed_configs_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_embed_configs" ("allow_model_override", "allow_prompt_override", "allow_temperature_override", "allowlist_domains", "chat_mode", "createdAt", "createdBy", "enabled", "id", "max_chats_per_day", "max_chats_per_session", "usersId", "uuid", "workspace_id") SELECT "allow_model_override", "allow_prompt_override", "allow_temperature_override", "allowlist_domains", "chat_mode", "createdAt", "createdBy", "enabled", "id", "max_chats_per_day", "max_chats_per_session", "usersId", "uuid", "workspace_id" FROM "embed_configs";
DROP TABLE "embed_configs";
ALTER TABLE "new_embed_configs" RENAME TO "embed_configs";
CREATE UNIQUE INDEX "embed_configs_uuid_key" ON "embed_configs"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
