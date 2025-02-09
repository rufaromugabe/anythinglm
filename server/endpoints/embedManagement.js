const { EmbedChats } = require("../models/embedChats");
const { EmbedConfig } = require("../models/embedConfig");
const { EventLogs } = require("../models/eventLogs");
const { reqBody, userFromSession, safeJsonParse } = require("../utils/http");
const {
  validEmbedConfigId,
} = require("../utils/middleware/embedMiddleware");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  chatHistoryViewable,
} = require("../utils/middleware/chatHistoryViewable");

function embedManagementEndpoints(app) {
  if (!app) return;

  app.get(
    "/embeds",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      /*
      #swagger.tags = ['Embed']
      #swagger.description = 'List all active embeds'
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                embeds: [
                  {
                    // ... embed properties
                  }
                ]
              }
            }
          }
        }
      }
      #swagger.responses[403] = {
        schema: {
          "$ref": "#/definitions/InvalidAPIKey"
        }
      }
    */
      try {
        const embeds = await EmbedConfig.whereWithWorkspace({}, null, {
          createdAt: "desc",
        });

        const filteredEmbeds = embeds.map((embed) => ({
          ...embed,
          defaultMessages: safeJsonParse(embed.defaultMessages, []), // parse JSON string
          _count: { embed_chats: embed._count.embed_chats },          // rename for frontend compatibility
          workspace: {                                               // include only relevant workspace info
            id: embed.workspace.id,
            name: embed.workspace.name,
          },
          
        }));
        
        response.status(200).json({ embeds: filteredEmbeds });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/embeds/new",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      /* ... swagger docs ... */
      try {
        const user = await userFromSession(request, response);
        const data = reqBody(request);
        const { embed, message: error } = await EmbedConfig.new(data, user?.id);
        if (error) {  // Return error if embed creation failed
          console.error(error);
          return response.status(500).json({ error }); 
        }
        await EventLogs.logEvent("embed_created", { embedId: embed.id }, user?.id);
        response.status(200).json({ embed, error: null }); // Success response
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );


  app.post(
    "/embed/update/:embedId",
    [validatedRequest, flexUserRoleValid([ROLES.admin]), validEmbedConfigId],
    async (request, response) => {
      /* ... swagger docs ... */
      try {
        const { embedId } = request.params;
        const data = reqBody(request);

        // Stringify defaultMessages if it's an array
        if (Array.isArray(data.defaultMessages)) {
          data.defaultMessages = JSON.stringify(data.defaultMessages);
        }

        // Sanitize string inputs (keep this too)
        const stringKeys = [
          "position",
          "chatIcon",
          "windowHeight",
          "windowWidth",
          "textSize",
          "supportEmail",
          "assistantName",
          "assistantIcon",
          "brandImageUrl",
          "buttonColor",
          "userBgColor",
          "assistantBgColor"
        ];
        for (const key of stringKeys) {
          if (data[key]?.length > 255) {
            data[key] = data[key].substring(0, 255);
          }
        }

        const embedRecord = await EmbedConfig.get({ id: Number(embedId) });
        if (!embedRecord) {
          return response.status(404).json({ success: false, error: "Embed not found" });
        }

        // Create updates object with validated and sanitized values
        const updates = {};
        for (const key in data) {
          if (EmbedConfig.writable.includes(key)) {
            updates[key] = data[key];
          }
        }
        
        const { success, error } = await EmbedConfig.update(embedId, updates);
        if (!success) throw new Error(error); // Throw error if update fails

        const user = await userFromSession(request, response); // Get user for logging
        await EventLogs.logEvent("embed_updated", { embedId }, user?.id);
        response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.status(500).json({ success: false, error: e.message }); // Error response
      }
    }
  );


  app.delete(
    "/embed/:embedId",
    [validatedRequest, flexUserRoleValid([ROLES.admin]), validEmbedConfigId],
    async (request, response) => {
      /* ... swagger docs ... */
      try {
        const user = await userFromSession(request, response);
        const { embedId } = request.params;
        await EmbedConfig.delete({ id: Number(embedId) });
        await EventLogs.logEvent("embed_deleted", { embedId }, user?.id);
        response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/embed/chats",
    [chatHistoryViewable, validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      /* ... swagger docs ... */
      try {
        const { offset = 0, limit = 20 } = reqBody(request);
        const embedChats = await EmbedChats.whereWithEmbedAndWorkspace(
          {},
          limit,
          { id: "desc" },
          offset * limit
        );
        const totalChats = await EmbedChats.count();
        const hasPages = totalChats > (offset + 1) * limit;
        response.status(200).json({ chats: embedChats, hasPages, totalChats });
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );


  app.delete(
    "/embed/chats/:chatId",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      /* ... swagger docs ... */
      try {
        const { chatId } = request.params;
        const { success, error } = await EmbedChats.delete({ id: Number(chatId) }); // return success/error
        response.status(200).json({ success, error }); // Respond with success/error
      } catch (e) {
        console.error(e);
        response.status(500).json({ success: false, error: e.message });
      }
    }
  );

}

module.exports = { embedManagementEndpoints };