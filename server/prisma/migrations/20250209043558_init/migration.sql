/*
  Warnings:

  - You are about to drop the column `assistantBgColor` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `assistantIcon` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `assistantName` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `buttonColor` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `chatIcon` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `defaultMessages` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `openOnLoad` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `supportEmail` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `textSize` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `userBgColor` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `windowHeight` on the `embed_configs` table. All the data in the column will be lost.
  - You are about to drop the column `windowWidth` on the `embed_configs` table. All the data in the column will be lost.

*/
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
    "workspace_id" INTEGER NOT NULL,
    "createdBy" INTEGER,
    "usersId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "embed_configs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "embed_configs_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_embed_configs" ("allow_model_override", "allow_prompt_override", "allow_temperature_override", "allowlist_domains", "chat_mode", "createdAt", "createdBy", "enabled", "id", "max_chats_per_day", "max_chats_per_session", "usersId", "uuid", "workspace_id") SELECT "allow_model_override", "allow_prompt_override", "allow_temperature_override", "allowlist_domains", "chat_mode", "createdAt", "createdBy", "enabled", "id", "max_chats_per_day", "max_chats_per_session", "usersId", "uuid", "workspace_id" FROM "embed_configs";
DROP TABLE "embed_configs";
ALTER TABLE "new_embed_configs" RENAME TO "embed_configs";
CREATE UNIQUE INDEX "embed_configs_uuid_key" ON "embed_configs"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
