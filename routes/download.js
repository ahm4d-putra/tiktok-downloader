// routes/download.js

const express = require("express");
const router = express.Router();
const tiktokService = require("../services/tiktokService");
const axios = require("axios");

// Fungsi untuk mengirim notifikasi ke Discord
async function sendDiscordNotification(videoInfo) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  // Jika webhook URL tidak diatur, jangan lakukan apa-apa
  if (!webhookUrl) {
    console.log("[Discord] Webhook URL not found. Skipping notification.");
    return;
  }

  // Buat pesan embed yang menarik
  const discordPayload = {
    embeds: [
      {
        title: "🎉 Video TikTok Berhasil Diunduh!",
        url: `https://www.tiktok.com/@${videoInfo.author.username}/video/${videoInfo.id}`,
        color: 16711680, // Warna merah TikTok dalam format desimal
        author: {
          name: videoInfo.author.nickname || videoInfo.author.username,
          icon_url: videoInfo.author.avatar,
          url: `https://www.tiktok.com/@${videoInfo.author.username}`,
        },
        description: videoInfo.description || "*Tidak ada deskripsi*",
        thumbnail: {
          url: videoInfo.thumbnail,
        },
        fields: [
          {
            name: "👤 Pengguna",
            value: `@${videoInfo.author.username}`,
            inline: true,
          },
          {
            name: "🎵 Musik",
            value: videoInfo.music || "Tidak diketahui",
            inline: true,
          },
        ],
        footer: {
          text: "TikTok Downloader by Nama Anda",
          icon_url: "https://i.imgur.com/your-logo.png", // Ganti dengan logo Anda jika ada
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, discordPayload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("[Discord] Notification sent successfully!");
  } catch (error) {
    console.error("[Discord] Failed to send notification:", error.message);
  }
}

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

    const filename = `tiktok-${videoInfo.author.username || "video"}-${
      videoInfo.id
    }.mp4`;
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", response.headers["content-length"]);

    // --- PEMANGGILAN NOTIFIKASI DISCORD ---
    // Kirim notifikasi tanpa menunggu (non-blocking)
    sendDiscordNotification(videoInfo);
    // -----------------------------------------

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
