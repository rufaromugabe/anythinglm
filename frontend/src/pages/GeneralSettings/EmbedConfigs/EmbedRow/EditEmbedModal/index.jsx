import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import {
  BooleanInput,
  ChatModeSelection,
  NumberInput,
  PermittedDomains,
  WorkspaceSelection,
  enforceSubmissionSchema,
} from "../../NewEmbedModal";
import Embed from "@/models/embed";
import showToast from "@/utils/toast";

export default function EditEmbedModal({ embed, closeModal }) {
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    setError(null);
    e.preventDefault();
    const form = new FormData(e.target);
    const data = enforceSubmissionSchema(form);
    const { success, error } = await Embed.updateEmbed(embed.id, data);
    if (success) {
      showToast("Embed updated successfully.", "success", { clear: true });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
    setError(error);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
        <div className="relative p-6 border-b rounded-t border-theme-modal-border">
          <div className="w-full flex gap-x-2 items-center">
            <h3 className="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
              Update embed #{embed.id}
            </h3>
          </div>
          <button
            onClick={closeModal}
            type="button"
            className="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
          >
            <X size={24} weight="bold" className="text-white" />
          </button>
        </div>
        <div className="px-7 py-6">
          <form onSubmit={handleUpdate}>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <WorkspaceSelection defaultValue={embed.workspace.id} />
              <ChatModeSelection defaultValue={embed.chat_mode} />
              <PermittedDomains
                defaultValue={
                  embed.allowlist_domains
                    ? JSON.parse(embed.allowlist_domains)
                    : []
                }
              />
              <NumberInput
                name="max_chats_per_day"
                title="Max chats per day"
                hint="Limit the amount of chats this embedded chat can process in a 24 hour period. Zero is unlimited."
                defaultValue={embed.max_chats_per_day}
              />
              <NumberInput
                name="max_chats_per_session"
                title="Max chats per session"
                hint="Limit the amount of chats a session user can send with this embed in a 24 hour period. Zero is unlimited."
                defaultValue={embed.max_chats_per_session}
              />
              <BooleanInput
                name="allow_model_override"
                title="Enable dynamic model use"
                hint="Allow setting of the preferred LLM model to override the workspace default."
                defaultValue={embed.allow_model_override}
              />
              <BooleanInput
                name="allow_temperature_override"
                title="Enable dynamic LLM temperature"
                hint="Allow setting of the LLM temperature to override the workspace default."
                defaultValue={embed.allow_temperature_override}
              />
              <BooleanInput
                name="allow_prompt_override"
                title="Enable Prompt Override"
                hint="Allow setting of the system prompt to override the workspace default."
                defaultValue={embed.allow_prompt_override}
              />

              {/* New Appearance & Additional Settings */}
              <fieldset className="border border-theme-modal-border p-4 rounded">
                <legend className="text-white font-semibold mb-2">
                  Appearance & Additional Settings
                </legend>

                <div className="mb-4">
                  <label
                    htmlFor="chatIcon"
                    className="block text-sm font-medium text-white"
                  >
                    Chat Icon URL
                  </label>
                  <input
                    type="text"
                    id="chatIcon"
                    name="chatIcon"
                    defaultValue={
                      embed.chatIcon || "https://example.com/icons/chat.png"
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="buttonColor"
                    className="block text-sm font-medium text-white"
                  >
                    Button Color
                  </label>
                  <input
                    type="color"
                    id="buttonColor"
                    name="buttonColor"
                    defaultValue={embed.buttonColor || "#007BFF"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="userBgColor"
                    className="block text-sm font-medium text-white"
                  >
                    User Background Color
                  </label>
                  <input
                    type="color"
                    id="userBgColor"
                    name="userBgColor"
                    defaultValue={embed.userBgColor || "#F5F5F5"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="assistantBgColor"
                    className="block text-sm font-medium text-white"
                  >
                    Assistant Background Color
                  </label>
                  <input
                    type="color"
                    id="assistantBgColor"
                    name="assistantBgColor"
                    defaultValue={embed.assistantBgColor || "#FFFFFF"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="brandImageUrl"
                    className="block text-sm font-medium text-white"
                  >
                    Brand Image URL
                  </label>
                  <input
                    type="text"
                    id="brandImageUrl"
                    name="brandImageUrl"
                    defaultValue={
                      embed.brandImageUrl ||
                      "https://example.com/images/brand-logo.png"
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="assistantName"
                    className="block text-sm font-medium text-white"
                  >
                    Assistant Name
                  </label>
                  <input
                    type="text"
                    id="assistantName"
                    name="assistantName"
                    defaultValue={embed.assistantName || "HelperBot"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="assistantIcon"
                    className="block text-sm font-medium text-white"
                  >
                    Assistant Icon URL
                  </label>
                  <input
                    type="text"
                    id="assistantIcon"
                    name="assistantIcon"
                    defaultValue={
                      embed.assistantIcon ||
                      "https://example.com/icons/assistant.png"
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-white"
                  >
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    defaultValue={embed.position || "bottom-right"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="windowHeight"
                    className="block text-sm font-medium text-white"
                  >
                    Window Height
                  </label>
                  <input
                    type="text"
                    id="windowHeight"
                    name="windowHeight"
                    defaultValue={embed.windowHeight || "600px"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="windowWidth"
                    className="block text-sm font-medium text-white"
                  >
                    Window Width
                  </label>
                  <input
                    type="text"
                    id="windowWidth"
                    name="windowWidth"
                    defaultValue={embed.windowWidth || "400px"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="textSize"
                    className="block text-sm font-medium text-white"
                  >
                    Text Size
                  </label>
                  <input
                    type="text"
                    id="textSize"
                    name="textSize"
                    defaultValue={embed.textSize || "14px"}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="supportEmail"
                    className="block text-sm font-medium text-white"
                  >
                    Support Email
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    name="supportEmail"
                    defaultValue={
                      embed.supportEmail || "support@example.com"
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="defaultMessages"
                    className="block text-sm font-medium text-white"
                  >
                    Default Messages (one per line)
                  </label>
                  <textarea
                    id="defaultMessages"
                    name="defaultMessages"
                    rows="3"
                    defaultValue={
                      embed.defaultMessages
                        ? embed.defaultMessages.join("\n")
                        : "Hello!\nHow are you?\nNew default message!"
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-theme-bg-secondary text-white"
                  ></textarea>
                </div>
              </fieldset>

              {error && (
                <p className="text-red-400 text-sm">Error: {error}</p>
              )}
              <p className="text-white text-opacity-60 text-xs md:text-sm">
                After creating an embed you will be provided a link that you can
                publish on your website with a simple{" "}
                <code className="border-none bg-theme-settings-input-bg text-white mx-1 px-1 rounded-sm">
                  &lt;script&gt;
                </code>{" "}
                tag.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-theme-modal-border">
              <button
                onClick={closeModal}
                type="button"
                className="transition-all duration-300 text-white hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Update embed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
