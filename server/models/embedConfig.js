const { v4 } = require("uuid");
const prisma = require("../utils/prisma");
const { VALID_CHAT_MODE } = require("../utils/chats/stream");

const EmbedConfig = {
  writable: [
    // Used for generic updates so we can validate keys in request body
    "enabled",
    "allowlist_domains",
    "allow_model_override",
    "allow_temperature_override",
    "allow_prompt_override",
    "max_chats_per_day",
    "max_chats_per_session",
    "chat_mode",
    "workspace_id",
    "chatIcon",
    "buttonColor",
    "userBgColor",
    "assistantBgColor",
    "brandImageUrl",
    "assistantName",
    "assistantIcon",
    "position",
    "windowHeight",
    "windowWidth",
    "textSize",
    "supportEmail",
    "defaultMessages",
  ],
  validations: { //Add validations for the new fields
    chatIcon: (value) => typeof value === "string" ? value : null,
    buttonColor: (value) => typeof value === "string" ? value : null,
    userBgColor: (value) => typeof value === "string" ? value : null,
    assistantBgColor: (value) => typeof value === "string" ? value : null,
    brandImageUrl: (value) => typeof value === "string" ? value : null,
    assistantName: (value) => typeof value === "string" ? value : null,
    assistantIcon: (value) => typeof value === "string" ? value : null,
    position: (value) => typeof value === "string" ? value : null,
    windowHeight: (value) => typeof value === "string" ? value : null,
    windowWidth: (value) => typeof value === "string" ? value : null,
    textSize: (value) => typeof value === "string" ? value : null,
    supportEmail: (value) => typeof value === "string" ? value : null,

  },
  validateFields: function(data) {
    const validatedFields = {};
    
    // Only process fields that are in the writable array
    Object.keys(data).forEach(field => {
      if (!this.writable.includes(field)) return;

      // If field has a specific validation function, use it
      if (this.validations[field]) {
        const validatedValue = this.validations[field](data[field]);
        if (validatedValue !== null) {
          validatedFields[field] = validatedValue;
        }
        return;
      }

      // For fields without specific validation, use the validatedCreationData helper
      const validatedValue = validatedCreationData(data[field], field);
      if (validatedValue !== null) {
        validatedFields[field] = validatedValue;
      }
    });

    return validatedFields;
  },
  new: async function (data, creatorId = null) {
    const validatedData = this.validateFields(data);
    try {
      const embed = await prisma.embed_configs.create({
        data: {
          uuid: v4(),
          enabled: true,
          ...validatedData,
          workspace: {
            connect: { id: Number(data.workspace_id) },
          },
          chat_mode: validatedCreationData(data?.chat_mode, "chat_mode"),
          allowlist_domains: validatedCreationData(
            data?.allowlist_domains,
            "allowlist_domains"
          ),
          allow_model_override: validatedCreationData(
            data?.allow_model_override,
            "allow_model_override"
          ),
          allow_temperature_override: validatedCreationData(
            data?.allow_temperature_override,
            "allow_temperature_override"
          ),
          allow_prompt_override: validatedCreationData(
            data?.allow_prompt_override,
            "allow_prompt_override"
          ),
          max_chats_per_day: validatedCreationData(
            data?.max_chats_per_day,
            "max_chats_per_day"
          ),
          max_chats_per_session: validatedCreationData(
            data?.max_chats_per_session,
            "max_chats_per_session"
          ),
          createdBy: Number(creatorId) ?? null,
          workspace: {
            connect: { id: Number(data.workspace_id) },
          },
        },
      });
      return { embed, message: null };
    } catch (error) {
      console.error(error.message);
      return { embed: null, message: error.message };
    }
  },

  update: async function (embedId = null, data = {}) {
    if (!embedId) throw new Error("No embed id provided for update");

    const validatedUpdates = this.validateFields(data); // Validate data
    if (Object.keys(validatedUpdates).length === 0)
      return { success: false, error: "No valid fields to update!" };

    try {
      const updatedEmbed = await prisma.embed_configs.update({
        where: { id: Number(embedId) },
        data: validatedUpdates, // Update database with validated data
      });
      return { success: true, error: null, updatedEmbed };
    } catch (error) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const embedConfig = await prisma.embed_configs.findFirst({
        where: clause,
      });

      return embedConfig || null;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  },

  getWithWorkspace: async function (clause = {}) {
    try {
      const embedConfig = await prisma.embed_configs.findFirst({
        where: clause,
        include: {
          workspace: true,
        },
      });

      return embedConfig || null;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.embed_configs.delete({
        where: clause,
      });
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  },

  where: async function (clause = {}, limit = null, orderBy = null) {
    try {
      const results = await prisma.embed_configs.findMany({
        where: clause,
        ...(limit !== null ? { take: limit } : {}),
        ...(orderBy !== null ? { orderBy } : {}),
      });
      return results;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  whereWithWorkspace: async function (
    clause = {},
    limit = null,
    orderBy = null
  ) {
    try {
      const results = await prisma.embed_configs.findMany({
        where: clause,
        include: {
          workspace: true,
          _count: {
            select: { embed_chats: true },
          },
        },
        ...(limit !== null ? { take: limit } : {}),
        ...(orderBy !== null ? { orderBy } : {}),
      });
      return results;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  // Will return null if process should be skipped
  // an empty array means the system will check. This
  // prevents a bad parse from allowing all requests
  parseAllowedHosts: function (embed) {
    if (!embed.allowlist_domains) return null;

    try {
      return JSON.parse(embed.allowlist_domains);
    } catch {
      console.error(`Failed to parse allowlist_domains for Embed ${embed.id}!`);
      return [];
    }
  },
};




const BOOLEAN_KEYS = [
  "allow_model_override",
  "allow_temperature_override",
  "allow_prompt_override",
  "enabled",
];

const NUMBER_KEYS = [
  "max_chats_per_day",
  "max_chats_per_session",
  "workspace_id",
];

// Helper to validate a data object strictly into the proper format
function validatedCreationData(value, field) {
  if (field === "chat_mode") {
    if (!value || !VALID_CHAT_MODE.includes(value)) return "query";
    return value;
  }
if (field === "defaultMessages") {  // Validate and stringify defaultMessages
    try {
      if (!value) return null; // Handle null or empty values
      const parsedMessages = JSON.parse(value);
      if (!Array.isArray(parsedMessages) || !parsedMessages.every(item => typeof item === 'string')) {
        throw new Error("Invalid defaultMessages format. Must be an array of strings.");
      }
      return JSON.stringify(parsedMessages); // Store as JSON string
    } catch (e) {
      console.error("Failed to parse defaultMessages", e);
      return null; // Or handle the error as needed (e.g., return an empty array)
    }
  }
  if (field === "allowlist_domains") {
    try {
      if (!value) return null;
      return JSON.stringify(
        // Iterate and force all domains to URL object
        // and stringify the result.
        value
          .split(",")
          .map((input) => {
            let url = input;
            if (!url.includes("http://") && !url.includes("https://"))
              url = `https://${url}`;
            try {
              new URL(url);
              return url;
            } catch {
              return null;
            }
          })
          .filter((u) => !!u)
      );
    } catch {
      return null;
    }
  }

  if (BOOLEAN_KEYS.includes(field)) {
    return value === true || value === false ? value : false;
  }

  if (NUMBER_KEYS.includes(field)) {
    return isNaN(value) || Number(value) <= 0 ? null : Number(value);
  }

  return null;
}

module.exports = { EmbedConfig };
