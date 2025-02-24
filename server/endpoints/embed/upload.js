const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { assetUploadStorage } = require("../../utils/files/multer");
const Embed = require("../../models/embed");

function getAssetUrl(filename) {
  return `/assets/${filename}`;
}

// Endpoint to update the assistantIcon
router.post(
  "/embed/:id/upload-assistantIcon",
  multer({ storage: assetUploadStorage }).single("assistantIcon"),
  async (req, res) => {
    try {
      const embedId = req.params.id;
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "File upload failed." });
      }
      const filename = req.file.filename;
      await Embed.updateField(embedId, "assistantIcon", filename);
      const imageUrl = getAssetUrl(filename);
      return res.status(200).json({ success: true, imageUrl });
    } catch (error) {
      console.error("Error uploading assistant icon:", error);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

// Endpoint to update the brandImageUrl
router.post(
  "/embed/:id/upload-brandImageUrl",
  multer({ storage: assetUploadStorage }).single("brandImageUrl"),
  async (req, res) => {
    try {
      const embedId = req.params.id;
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "File upload failed." });
      }
      const filename = req.file.filename;
      await Embed.updateField(embedId, "brandImageUrl", filename);
      const imageUrl = getAssetUrl(filename);
      return res.status(200).json({ success: true, imageUrl });
    } catch (error) {
      console.error("Error uploading brand image:", error);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

module.exports = router;
