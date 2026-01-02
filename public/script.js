class TikTokDownloader {
  constructor() {
    this.form = document.getElementById("downloadForm");
    this.urlInput = document.getElementById("urlInput");
    this.submitBtn = document.getElementById("submitBtn");
    this.errorMessage = document.getElementById("errorMessage");
    this.resultContainer = document.getElementById("resultContainer");

    this.originalTiktokUrl = "";

    // Elemen untuk fitur baru
    this.shareBtn = document.getElementById("shareBtn");
    this.shareModal = document.getElementById("shareModal");
    this.closeBtn = document.querySelector(".close-btn");
    this.copyLinkBtn = document.getElementById("copyLinkBtn");
    this.historyPanel = document.getElementById("historyPanel");
    this.historyList = document.getElementById("historyList");
    this.clearHistoryBtn = document.getElementById("clearHistoryBtn");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.urlInput.addEventListener("input", this.clearError.bind(this));

    this.urlInput.addEventListener("focus", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (this.isValidTikTokUrl(text) && !this.urlInput.value) {
          this.urlInput.value = text;
        }
      } catch (err) {
        /* Ignore */
      }
    });

    // --- Event Listener untuk Fitur Bagikan ---
    this.shareBtn.addEventListener("click", this.handleShare.bind(this));
    this.closeBtn.addEventListener(
      "click",
      () => (this.shareModal.style.display = "none")
    );
    window.addEventListener("click", (e) => {
      if (e.target === this.shareModal) {
        this.shareModal.style.display = "none";
      }
    });
    this.copyLinkBtn.addEventListener("click", this.copyAppLink.bind(this));

    // --- Event Listener untuk Fitur Riwayat ---
    this.clearHistoryBtn.addEventListener(
      "click",
      this.clearHistory.bind(this)
    );

    // Muat riwayat saat halaman dimuat
    this.loadHistory();
  }

  // --- FITUR BAGIKAN ---
  handleShare() {
    const shareData = {
      title: "TikTok Downloader - Unduh Video Tanpa Watermark",
      text: "Coba aplikasi web ini untuk mengunduh video TikTok dengan mudah dan cepat!",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.log("Error sharing:", err));
    } else {
      // Tampilkan modal jika Web Share API tidak didukung
      this.populateShareLinks(shareData);
      this.shareModal.style.display = "block";
    }
  }

  populateShareLinks(data) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      data.text + " " + data.url
    )}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      data.text + " " + data.url
    )}`;

    document.getElementById("shareTwitter").href = twitterUrl;
    document.getElementById("shareWhatsapp").href = whatsappUrl;
  }

  async copyAppLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copyLinkBtn.textContent = "Tersalin!";
      setTimeout(() => {
        this.copyLinkBtn.innerHTML =
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg> Salin Link';
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  }

  // --- FITUR RIWAYAT ---
  saveToHistory(videoData) {
    let history = JSON.parse(localStorage.getItem("tiktokHistory")) || [];

    // Cek apakah video sudah ada di riwayat
    const existingIndex = history.findIndex((item) => item.id === videoData.id);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1); // Hapus yang lama
    }

    const historyItem = {
      id: videoData.id,
      author: videoData.author,
      thumbnail: videoData.thumbnail,
      description: videoData.description,
      timestamp: new Date().toISOString(),
    };

    history.unshift(historyItem); // Tambahkan ke awal array

    // Batasi riwayat hanya 20 item terakhir
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    localStorage.setItem("tiktokHistory", JSON.stringify(history));
    this.loadHistory(); // Perbarui tampilan
  }

  loadHistory() {
    const history = JSON.parse(localStorage.getItem("tiktokHistory")) || [];
    this.historyList.innerHTML = ""; // Kosongkan dulu

    if (history.length === 0) {
      this.historyList.innerHTML =
        '<p class="empty-history">Belum ada riwayat unduhan.</p>';
      return;
    }

    history.forEach((item) => {
      const historyEl = document.createElement("div");
      historyEl.className = "history-item";
      historyEl.innerHTML = `
                <img src="${item.thumbnail}" alt="Thumbnail">
                <div class="history-item-info">
                    <div class="history-item-author">@${
                      item.author.username
                    }</div>
                    <div class="history-item-desc">${
                      item.description || "Tidak ada deskripsi"
                    }</div>
                </div>
                <button class="remove-history-item" data-id="${
                  item.id
                }">&times;</button>
            `;
      this.historyList.appendChild(historyEl);
    });

    // Tambahkan event listener untuk tombol hapus item
    document.querySelectorAll(".remove-history-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.removeFromHistory(e.target.dataset.id);
      });
    });
  }

  removeFromHistory(id) {
    let history = JSON.parse(localStorage.getItem("tiktokHistory")) || [];
    history = history.filter((item) => item.id !== id);
    localStorage.setItem("tiktokHistory", JSON.stringify(history));
    this.loadHistory(); // Perbarui tampilan
  }

  clearHistory() {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat?")) {
      localStorage.removeItem("tiktokHistory");
      this.loadHistory();
    }
  }

  // --- FUNGSI UTAMA APLIKASI ---
  isValidTikTokUrl(url) {
    const tiktokRegex =
      /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|t\.tiktok\.com|vt\.tiktok\.com)\/.+$/;
    return tiktokRegex.test(url);
  }

  async handleSubmit(e) {
    e.preventDefault();

    const url = this.urlInput.value.trim();
    this.originalTiktokUrl = url;

    if (!url) {
      this.showError("Silakan masukkan URL TikTok");
      return;
    }

    if (!this.isValidTikTokUrl(url)) {
      this.showError("URL TikTok tidak valid. Pastikan URL benar.");
      return;
    }

    this.setLoading(true);
    this.clearError();
    this.hideResult();

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal memproses video");
      }

      this.displayResult(data.data);
      this.saveToHistory(data.data); // SIMPAN KE RIWAYAT
    } catch (error) {
      this.showError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      console.error("Download error:", error);
    } finally {
      this.setLoading(false);
    }
  }

  async handleDownload(videoId, filename) {
    const button = document.getElementById(videoId);
    const originalText = button.innerHTML;

    button.innerHTML =
      '<div class="spinner" style="display: inline-block; width: 16px; height: 16px;"></div> Mengunduh...';
    button.disabled = true;

    try {
      const response = await fetch("/api/download-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: this.originalTiktokUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal memulai unduhan.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      this.showError(`Gagal mengunduh: ${error.message}`);
      console.error("Stream download error:", error);
    } finally {
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn.classList.add("loading");
      this.submitBtn.disabled = true;
      this.urlInput.disabled = true;
    } else {
      this.submitBtn.classList.remove("loading");
      this.submitBtn.disabled = false;
      this.urlInput.disabled = false;
    }
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");
  }

  clearError() {
    this.errorMessage.classList.remove("show");
    this.errorMessage.textContent = "";
  }

  hideResult() {
    this.resultContainer.classList.add("hidden");
  }

  displayResult(videoData) {
    // ... (Kode displayResult tetap sama seperti sebelumnya) ...
    const thumbnail = document.getElementById("thumbnail");
    thumbnail.src = videoData.thumbnail;
    thumbnail.onerror = () => {
      thumbnail.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="355" viewBox="0 0 200 355"%3E%3Crect fill="%23252525" width="200" height="355"/%3E%3Ctext fill="%23A0A0A0" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EThumbnail tidak tersedia%3C/text%3E%3C/svg%3E';
    };

    const authorAvatar = document.getElementById("authorAvatar");
    const authorName = document.getElementById("authorName");
    const authorUsername = document.getElementById("authorUsername");

    authorAvatar.src =
      videoData.author.avatar ||
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"%3E%3Ccircle fill="%23252525" cx="12" cy="12" r="12"/%3E%3Cpath fill="%23A0A0A0" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
    authorAvatar.onerror = () => {
      authorAvatar.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"%3E%3Ccircle fill="%23252525" cx="12" cy="12" r="12"/%3E%3Cpath fill="%23A0A0A0" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
    };

    authorName.textContent =
      videoData.author.nickname || videoData.author.username || "Unknown";
    authorUsername.textContent = "@" + (videoData.author.username || "unknown");

    const description = document.getElementById("videoDescription");
    description.textContent = videoData.description || "Tidak ada deskripsi";

    document.getElementById("playCount").textContent = this.formatNumber(
      videoData.playCount || 0
    );
    document.getElementById("likeCount").textContent = this.formatNumber(
      videoData.likeCount || 0
    );
    document.getElementById("commentCount").textContent = this.formatNumber(
      videoData.commentCount || 0
    );

    const downloadNoWatermark = document.getElementById("downloadNoWatermark");
    const downloadWithWatermark = document.getElementById(
      "downloadWithWatermark"
    );

    const filenameNoWm = `tiktok-${videoData.author.username || "video"}-${
      videoData.id
    }.mp4`;
    const filenameWm = `tiktok-${videoData.author.username || "video"}-${
      videoData.id
    }-wm.mp4`;

    if (videoData.downloadUrls.noWatermark) {
      downloadNoWatermark.style.display = "flex";
      downloadNoWatermark.href = "#";
      downloadNoWatermark.onclick = (e) => {
        e.preventDefault();
        this.handleDownload("downloadNoWatermark", filenameNoWm);
      };
    } else {
      downloadNoWatermark.style.display = "none";
    }

    if (videoData.downloadUrls.withWatermark) {
      downloadWithWatermark.style.display = "flex";
      downloadWithWatermark.href = "#";
      downloadWithWatermark.onclick = (e) => {
        e.preventDefault();
        this.handleDownload("downloadWithWatermark", filenameWm);
      };
    } else {
      downloadWithWatermark.style.display = "none";
    }

    this.resultContainer.classList.remove("hidden");

    setTimeout(() => {
      this.resultContainer.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }
}

// Initialize the app and add utilities when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TikTokDownloader();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.id === "urlInput") {
        document
          .getElementById("downloadForm")
          .dispatchEvent(new Event("submit"));
      }
    }
  });
});
