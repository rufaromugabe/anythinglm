const { EmbedConfig } = require("../../../models/embedConfig");
const { EmbedChats } = require("../../../models/embedChats");
const { validApiKey } = require("../../../utils/middleware/validApiKey");
const { safeJsonParse } = require("../../../utils/http");
function apiEmbedEndpoints(app) {
  if (!app) return;

  app.get("/v1/embed", [validApiKey], async (request, response) => {
    /*
      #swagger.tags = ['Embed']
      #swagger.description = 'List all active embeds'
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: { // Updated example to include new fields
                embeds: [
                  {
                    "id": 1,
                    "uuid": "embed-uuid-1",
                    "enabled": true,
                    "chat_mode": "query",
                    "createdAt": "2023-04-01T12:00:00Z",
                    "workspace": {
                      "id": 1,
                      "name": "Workspace 1"
                    },
                    "chat_count": 10,
                    "chatIcon": "chatBubble", // New fields
                    "buttonColor": "#FF0000",
                    "userBgColor": "#00FF00",
                    "assistantBgColor": "#0000FF",
                    "brandImageUrl": "https://example.com/logo.png",
                    "assistantName": "Alex",
                    "assistantIcon": "https://example.com/icon.png",
                    "position": "bottom-right",
                    "windowHeight": "500px",
                    "windowWidth": "300px",
                    "textSize": "16",
                    "supportEmail": "support@example.com",
                    "defaultMessages": ["Hello!", "How are you?"] // Now an array
                  },
                  // ... more embed examples
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
      const embeds = await EmbedConfig.whereWithWorkspace();
      const filteredEmbeds = embeds.map((embed) => ({
        id: embed.id,
        uuid: embed.uuid,
        enabled: embed.enabled,
        chat_mode: embed.chat_mode,
        createdAt: embed.createdAt,
        workspace: {
          id: embed.workspace.id,
          name: embed.workspace.name,
        },
        chat_count: embed._count.embed_chats,
        // Include the new properties in the response
        chatIcon: embed.chatIcon,
        buttonColor: embed.buttonColor,
        userBgColor: embed.userBgColor,
        assistantBgColor: embed.assistantBgColor,
        brandImageUrl: embed.brandImageUrl,
        assistantName: embed.assistantName,
        assistantIcon: embed.assistantIcon,
        position: embed.position,
        windowHeight: embed.windowHeight,
        windowWidth: embed.windowWidth,
        textSize: embed.textSize,
        supportEmail: embed.supportEmail,
        // Parse the JSON string back into an array:
        defaultMessages: safeJsonParse(embed.defaultMessages, [])  
      }));
  
      response.status(200).json({ embeds: filteredEmbeds });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });
  app.get("/v1/embed/:uuid", [validApiKey], async (request, response) => { //uuid is used
     /*
    #swagger.tags = ['Embed']
    #swagger.description = 'Get a single embed by UUID'
    #swagger.parameters['uuid'] = { 
      description: 'UUID of the embed', 
      type: 'string', 
      in: 'path', 
      required: true
    }
    #swagger.responses[200] = {
      description: 'Embed configuration',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              embed: {
                id: 1,
                uuid: "embed-uuid",
                enabled: true,
                chat_mode: "query",
                createdAt: "2023-04-01T12:00:00Z",
                workspace: {
                  id: 1,
                  name: "Workspace Name"
                },
                chatIcon: "chatBubble",
                buttonColor: "#FF0000",
                userBgColor: "#00FF00", 
                assistantBgColor: "#0000FF",
                brandImageUrl: "https://example.com/logo.png",
                assistantName: "Assistant",
                assistantIcon: "https://example.com/icon.png",
                position: "bottom-right",
                windowHeight: "500px",
                windowWidth: "300px",
                textSize: "16px",
                supportEmail: "support@example.com",
                defaultMessages: ["Hello!", "How can I help?"]
              }
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
    #swagger.responses[404] = { description: 'Embed not found' }
    #swagger.responses[500] = { description: 'Server Error' } 
  */

    try {
      const { uuid } = request.params;  // Use uuid from params

      const embed = await EmbedConfig.getWithWorkspace({ uuid: uuid }); // Query by UUID

      if (!embed) {
        return response.status(404).json({ message: "Embed not found" });
      }
        // Parse and return all required fields.
      const embedConfig = {
        id: embed.id,
        uuid: embed.uuid,
        enabled: embed.enabled,
        chat_mode: embed.chat_mode,
        createdAt: embed.createdAt,
        workspace: {
          id: embed.workspace.id,
          name: embed.workspace.name,
        },
        // existing embed data
        chatIcon: embed.chatIcon,
        buttonColor: embed.buttonColor,
        userBgColor: embed.userBgColor,
        assistantBgColor: embed.assistantBgColor,
        brandImageUrl: embed.brandImageUrl,
        assistantName: embed.assistantName,
        assistantIcon: embed.assistantIcon,
        position: embed.position,
        windowHeight: embed.windowHeight,
        windowWidth: embed.windowWidth,
        textSize: embed.textSize,
        supportEmail: embed.supportEmail,
        defaultMessages: safeJsonParse(embed.defaultMessages, []),
      };



      response.status(200).json({ embed: embedConfig });
    } catch (e) {
      console.error(e.message, e);
      response.status(500).json({ error: "Failed to fetch embed" });
    }
  });

  app.get(
    "/v1/embed/:embedUuid/chats",
    [validApiKey],
    async (request, response) => {
      /*
      #swagger.tags = ['Embed']
      #swagger.description = 'Get all chats for a specific embed'
      #swagger.parameters['embedUuid'] = {
        in: 'path',
        description: 'UUID of the embed',
        required: true,
        type: 'string'
      }
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                chats: [
                  {
                    "id": 1,
                    "session_id": "session-uuid-1",
                    "prompt": "Hello",
                    "response": "Hi there!",
                    "createdAt": "2023-04-01T12:00:00Z"
                  },
                  {
                    "id": 2,
                    "session_id": "session-uuid-2",
                    "prompt": "How are you?",
                    "response": "I'm doing well, thank you!",
                    "createdAt": "2023-04-02T14:30:00Z"
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
      #swagger.responses[404] = {
        description: "Embed not found",
      }
    */
      try {
        const { embedId } = request.params;
        const embed = await EmbedConfig.getWithWorkspace({ uuid: embedId }); 
        if (!embed) {
          return response.status(404).json({ error: "Embed not found" });
        }

        const chats = await EmbedChats.where({ embed_id: embed.id });
        const formattedChats = chats.map((chat) => ({
          id: chat.id,
          session_id: chat.session_id,
          prompt: chat.prompt,
          response: chat.response,
          createdAt: chat.createdAt,
        }));

        response.status(200).json({ chats: formattedChats });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/v1/embed/:embedUuid/chats/:sessionUuid",
    [validApiKey],
    async (request, response) => {
      /*
      #swagger.tags = ['Embed']
      #swagger.description = 'Get chats for a specific embed and session'
      #swagger.parameters['embedUuid'] = {
        in: 'path',
        description: 'UUID of the embed',
        required: true,
        type: 'string'
      }
      #swagger.parameters['sessionUuid'] = {
        in: 'path',
        description: 'UUID of the session',
        required: true,
        type: 'string'
      }
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                chats: [
                  {
                    "id": 1,
                    "prompt": "Hello",
                    "response": "Hi there!",
                    "createdAt": "2023-04-01T12:00:00Z"
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
      #swagger.responses[404] = {
        description: "Embed or session not found",
      }
    */
      try {
        const { embedUuid, sessionUuid } = request.params;
        const embed = await EmbedConfig.get({ uuid: String(embedUuid) });
        if (!embed) {
          return response.status(404).json({ error: "Embed not found" });
        }

        const chats = await EmbedChats.where({
          embed_id: embed.id,
          session_id: String(sessionUuid),
        });

        if (!chats || chats.length === 0) {
          return response
            .status(404)
            .json({ error: "No chats found for this session" });
        }

        const formattedChats = chats.map((chat) => ({
          id: chat.id,
          prompt: chat.prompt,
          response: chat.response,
          createdAt: chat.createdAt,
        }));

        response.status(200).json({ chats: formattedChats });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { apiEmbedEndpoints };
