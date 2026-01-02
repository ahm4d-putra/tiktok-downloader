// routes/download.js

const express = require("express");
const router = express.Router();
const tiktokService = require("../services/tiktokService");
const axios = require("axios");

// POST /api/download - Get video info (untuk ditampilkan di UI)
router.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const videoInfo = await tiktokService.getVideoInfo(url);

    res.json({
      success: true,
      data: videoInfo,
    });
  } catch (error) {
    console.error("Download route error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Failed to process video",
    });
  }
});

// POST /api/download-stream - Stream video secara real-time
router.post("/download-stream", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    console.log(`[Download Stream] Fetching fresh video info for: ${url}`);

    // 1. Ambil info video sekali lagi untuk mendapatkan URL yang segar
    const videoInfo = await tiktokService.getVideoInfo(url);
    const downloadUrl =
      videoInfo.downloadUrls.noWatermark ||
      videoInfo.downloadUrls.withWatermark;

    if (!downloadUrl) {
      return res
        .status(404)
        .send("Could not find a valid download URL for this video.");
    }

    console.log(`[Download Stream] Streaming from fresh URL: ${downloadUrl}`);

    // 2. Lakukan proxy request ke URL video dan stream ke klien
    const response = await axios({
      method: "GET",
      url: downloadUrl,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/",
        Accept: "*/*",
      },
      timeout: 30000,
    });

    // 3. Set header untuk response ke klien
    const filename = `tiktok-${videoInfo.author.username || "video"}-${
      videoInfo.id
    }.mp4`;
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", response.headers["content-length"]);

    // 4. Alirkan (pipe) video dari server TikTok ke browser user
    response.data.pipe(res);

    response.data.on("error", (err) => {
      console.error("[Download Stream] Stream error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error streaming video.");
      }
    });
  } catch (error) {
    console.error("[Download Stream] Error:", error.message);
    if (!res.headersSent) {
      res.status(500).send(`Failed to stream video: ${error.message}`);
    }
  }
});

module.exports = router;
