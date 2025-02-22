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

// New reusable ColorPickerInput component
function ColorPickerInput({ label, name, defaultValue }) {
  const [color, setColor] = useState(defaultValue);

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleTextChange = (e) => {
    let value = e.target.value;
    // If the user forgets the "#", add it automatically
    if (value && !value.startsWith("#")) {
      value = "#" + value;
    }
    setColor(value);
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
      </label>
      <div className="flex items-center mt-1 space-x-2">
        {/* Color swatch */}
        <input
          type="color"
          id={`${name}-color`}
          value={color}
          onChange={handleColorChange}
          className="w-10 h-10 border border-gray-300 rounded"
        />
        {/* Text input for manual hex code entry */}
        <input
          type="text"
          id={name}
          name={name}
          value={color}
          onChange={handleTextChange}
          className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
          placeholder="#XXXXXX"
        />
      </div>
    </div>
  );
}
function ChipInput({ messages, onMessagesChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onMessagesChange([...messages, inputValue.trim()]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && messages.length > 0) {
      e.preventDefault();
      onMessagesChange(messages.slice(0, -1));
    }
  };

  const removeMessage = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    onMessagesChange(newMessages);
  };

  return (
    <div className="border-none bg-theme-settings-input-bg text-white rounded-lg p-2 min-h-[100px] w-[35rem]">
      <div className="flex flex-wrap gap-2 mb-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-zinc-700 px-2 py-1 rounded-full"
          >
            <span className="text-sm">{message}</span>
            <button
              type="button"
              onClick={() => removeMessage(index)}
              className="text-white hover:text-red-400 focus:outline-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message and press Enter"
        className="bg-transparent border-none outline-none text-sm w-full"
      />
    </div>
  );
}


export default function EditEmbedModal({ embed, closeModal }) {
  const [error, setError] = useState(null);
  const [brandImage, setBrandImage] = useState(null);
  const [assistantIcon, setAssistantIcon] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleUpdate = async (e) => {
    setError(null);
    e.preventDefault();
    const form = new FormData(e.target);
    const data = enforceSubmissionSchema(form);

    // Replace URL with uploaded base64 images if present
    if (brandImage) data.brandImageUrl = brandImage;
    if (assistantIcon) data.assistantIcon = assistantIcon;

    data.defaultMessages = defaultMessages;

    const { success, error } = await Embed.updateEmbed(embed.id, data);
    if (success) {
      showToast("Embed updated successfully.", "success", { clear: true });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
    setError(error);
  };
  const [defaultMessages, setDefaultMessages] = useState(
    embed.defaultMessages || ["Hello!", "How are you?", "New default message!"]
  );

  const handleMessagesChange = (e) => {
    const messages = e.target.value.split('\n').filter(msg => msg.trim());
    setDefaultMessages(messages);
  };

  const handleBrandImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast("File size exceeds 5MB.", "error");
      return;
    }
    const base64 = await fileToBase64(file);
    setBrandImage(base64);
  };

  const handleAssistantIconUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast("File size exceeds 5MB.", "error");
      return;
    }
    const base64 = await fileToBase64(file);
    setAssistantIcon(base64);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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
                    Chat Icon
                  </label>
                  <select
                    id="chatIcon"
                    name="chatIcon"
                    defaultValue={embed.chatIcon || "chatBubble"}
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
                  >
                    <option value="chatBubble">Chat Bubble</option>
                    <option value="support">Support</option>
                    <option value="search2">Search 2</option>
                    <option value="search">Search</option>
                    <option value="magic">Magic</option>
                  </select>
                </div>
                {/* Replace the plain color inputs with the new component */}
                <ColorPickerInput
                  label="Button Color"
                  name="buttonColor"
                  defaultValue={embed.buttonColor || "#007BFF"}
                />

                <ColorPickerInput
                  label="User Background Color"
                  name="userBgColor"
                  defaultValue={embed.userBgColor || "#F5F5F5"}
                />

                <ColorPickerInput
                  label="Assistant Background Color"
                  name="assistantBgColor"
                  defaultValue={embed.assistantBgColor || "#FFFFFF"}
                />

               
                <div className="mb-4">
                  <label
                    htmlFor="brandImage"
                    className="block text-sm font-medium text-white"
                  >
                    Brand Image
                  </label>
                  <input
                    type="file"
                    id="brandImage"
                    name="brandImage"
                    onChange={handleBrandImageUpload}
                    className="hidden"
                  />
                  <div>
                    {(brandImage || embed.brandImageUrl) && (
                      <img
                        src={brandImage || embed.brandImageUrl}
                        alt="Brand Preview"
                        className="w-20 h-20 rounded mt-2 mb-2"
                      />
                    )}
                    <label htmlFor="brandImage" className="cursor-pointer">
                      <div className="w-full py-4 bg-theme-bg-primary hover:bg-theme-bg-secondary rounded-2xl border-2 border-dashed border-white transition-colors duration-300 p-3">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 text-white/80">+</div>
                          <div className="text-white text-opacity-80 text-sm font-semibold py-1">Click to upload</div>
                          <div className="text-white text-opacity-60 text-xs font-medium py-1">Supports images</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

               
                <div className="mb-4">
                  <label
                    htmlFor="assistantIcon"
                    className="block text-sm font-medium text-white"
                  >
                    Assistant Icon
                  </label>
                  <input
                    type="file"
                    id="assistantIcon"
                    name="assistantIcon"
                    onChange={handleAssistantIconUpload}
                    className="hidden"
                  />
                  <div>
                    {(assistantIcon || embed.assistantIcon) && (
                      <img
                        src={assistantIcon || embed.assistantIcon}
                        alt="Assistant Preview"
                        className="w-20 h-20 rounded mt-2 mb-2"
                      />
                    )}
                    <label htmlFor="assistantIcon" className="cursor-pointer">
                      <div className="w-full py-4 bg-theme-bg-primary hover:bg-theme-bg-secondary rounded-2xl border-2 border-dashed border-white transition-colors duration-300 p-3">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 text-white/80">+</div>
                          <div className="text-white text-opacity-80 text-sm font-semibold py-1">Click to upload</div>
                          <div className="text-white text-opacity-60 text-xs font-medium py-1">Supports images</div>
                        </div>
                      </div>
                    </label>
                  </div>
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
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[35rem] p-2.5"
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
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
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
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
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
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
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
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[15rem] p-2.5"
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
                    defaultValue={embed.supportEmail || "support@example.com"}
                    className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-[35rem] p-2.5"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="defaultMessages"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Default Messages (press Enter to add)
                  </label>
                  <ChipInput
                    messages={defaultMessages}
                    onMessagesChange={setDefaultMessages}
                  />
                  <input
                    type="hidden"
                    name="defaultMessages"
                    value={JSON.stringify(defaultMessages)}
                  />
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
