
const axios = require("axios");

class TikTokService {
  constructor() {
  //api tikwm
    this.primaryApi = "https://tikwm.com/api/";

    // Realistic User-Agent
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  }

  /**
   * Validasi TikTok URL
   */
  validateUrl(url) {
    const tiktokRegex =
      /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|t\.tiktok\.com)\/.+$/;
    if (!tiktokRegex.test(url)) {
      throw new Error("Invalid TikTok URL format");
    }
    return true;
  }

  /**
   * pecahin tiktok link singkat
   */
  async resolveShortUrl(shortUrl) {
    try {
      // Menggunakan layanan pihak ketiga untuk menghindari redirect loop
      const response = await axios.get(
        `https://nitter.net/tiktok/redirect?url=${encodeURIComponent(
          shortUrl
        )}`,
        {
          timeout: 10000,
          headers: { "User-Agent": this.userAgent },
        }
      );
      const finalUrl = response.request.res.responseUrl || response.data;
      if (this.validateUrl(finalUrl)) {
        return finalUrl;
      }
      throw new Error("Could not resolve final URL");
    } catch (error) {
      console.error("Error resolving short URL:", error.message);
      // fetch langsung
      try {
        const directResponse = await axios.get(shortUrl, {
          maxRedirects: 5,
          timeout: 10000,
        });
        return directResponse.request.res.responseUrl || shortUrl;
      } catch (directError) {
        throw new Error(
          "Failed to resolve short URL. Please use the full TikTok URL (e.g., https://www.tiktok.com/...)."
        );
      }
    }
  }

  /**
   * Get video information from API
   */
  async fetchFromAPI(url) {
    console.log(
      `[TikTokService] Attempting to fetch from API: ${this.primaryApi}`
    );
    try {
      // tikwm.com menggunakan GET request
      const response = await axios.get(this.primaryApi, {
        params: {
          url: url,
          hd: 1, // kualitas HD
        },
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.tiktok.com/",
        },
        timeout: 20000, 
      });

      console.log("[TikTokService] API Response Status:", response.status);
      console.log(
        "[TikTokService] API Response Data (partial):",
        JSON.stringify(response.data, null, 2).substring(0, 500)
      );

      if (response.data && response.data.code === 0 && response.data.data) {
        return this.formatVideoInfo(response.data.data);
      }

      // Jika API memberikan kode error
      if (response.data && response.data.msg) {
        throw new Error(`API Error: ${response.data.msg}`);
      }

      throw new Error(
        "Invalid response from API. The structure might have changed."
      );
    } catch (error) {
      console.error(
        `[TikTokService] Error fetching from ${this.primaryApi}:`,
        error.message
      );
      if (error.response) {
        console.error("[TikTokService] API Error Data:", error.response.data);
        console.error(
          "[TikTokService] API Error Status:",
          error.response.status
        );
      }
      throw error; // Lempar error kembali untuk ditangani di getVideoInfo
    }
  }

  /**
   * vidio format
   */
  formatVideoInfo(data) {
    const author = data.author || {};
    const stats = data.stats || {};

    return {
      id: data.id,
      author: {
        username: author.unique_id || author.username,
        nickname: author.nickname,
        avatar: author.avatar,
      },
      description: data.title || data.desc || "",
      thumbnail: data.thumbnail || data.cover,
      duration: data.duration,
      playCount: stats.play_count || data.play_count,
      likeCount: stats.digg_count || data.digg_count || stats.like_count,
      commentCount: stats.comment_count || data.comment_count,
      shareCount: stats.share_count || data.share_count,
      downloadUrls: {
        noWatermark: data.play || data.hdplay, // Prioritaskan HD
        withWatermark: data.wmplay,
      },
      createdAt: data.create_time,
    };
  }

  /**
   * method utama buat deksripsi vidio
   */
  async getVideoInfo(url) {
    try {
      this.validateUrl(url);

      // kalo url pendek di pecah
      if (url.includes("vm.tiktok.com") || url.includes("t.tiktok.com")) {
        console.log(`[TikTokService] Resolving short URL: ${url}`);
        url = await this.resolveShortUrl(url);
      }

      // scraoing api
      const videoInfo = await this.fetchFromAPI(url);
      return videoInfo;
    } catch (error) {
      console.error(
        "[TikTokService] Final Error in getVideoInfo:",
        error.message
      );

      // clear text error for user
      let userFriendlyMessage = "Failed to fetch video information.";
      if (error.message.includes("API Error:")) {
        userFriendlyMessage = `The API returned an error: ${error.message.replace(
          "API Error: ",
          ""
        )}`;
      } else if (error.message.includes("timeout")) {
        userFriendlyMessage =
          "Request timed out. The server might be busy, please try again.";
      } else if (error.message.includes("Invalid TikTok URL")) {
        userFriendlyMessage = "The TikTok URL you provided is not valid.";
      } else {
        userFriendlyMessage =
          "Could not download the video. It might be private, deleted, or the service is temporarily unavailable. Please check the server logs for more details.";
      }

      const finalError = new Error(userFriendlyMessage);
      finalError.statusCode = 500; // Default ke server error
      if (error.message.includes("Invalid TikTok URL")) {
        finalError.statusCode = 400; // Bad request
      }
      throw finalError;
    }
  }

  async getVideoStream(videoId) {
    throw new Error(
      "Direct streaming is not implemented. Use the download URL from video info."
    );
  }
}

module.exports = new TikTokService();
