// script.js - JSON to Excel & JSON Converter
let currentData = [];
let originalData = [];

function normalizePhone(phone) {
  if (!phone) return "";
  let p = String(phone).trim();
  // Replace +84 with 0
  if (p.startsWith("+84")) {
    p = "0" + p.substring(3).trim();
  } else if (p.startsWith("84")) {
    p = "0" + p.substring(2).trim();
  }
  return p;
}

function processJSON() {
  const input = document.getElementById("jsonInput").value.trim();
  const statusEl = document.getElementById("status");
  const tableResultEl = document.getElementById("tableResult");
  const jsonResultEl = document.getElementById("jsonResult");
  const tabsContainer = document.getElementById("tabsContainer");
  const downloadBtn = document.getElementById("downloadBtn");
  const downloadJsonBtn = document.getElementById("downloadJsonBtn");
  const saveBtn = document.getElementById("saveBtn");
  const checkDupBtn = document.getElementById("checkDupBtn");
  const removeDupBtn = document.getElementById("removeDupBtn");
  const sortSelect = document.getElementById("sortSelect");

  statusEl.innerHTML = "";
  tableResultEl.innerHTML = "";
  jsonResultEl.textContent = "";
  tabsContainer.style.display = "none";
  downloadBtn.disabled = true;
  downloadJsonBtn.disabled = true;
  saveBtn.disabled = true;
  if (checkDupBtn) checkDupBtn.disabled = true;
  if (removeDupBtn) removeDupBtn.disabled = true;
  currentData = [];
  originalData = [];

  if (!input) {
    statusEl.className = "status error";
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Vui lòng dán JSON vào ô trên!</span>
    `;
    Toastify({
      text: " Vui lòng dán JSON vào ô nhập liệu!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #ef4444, #f87171)"
      }
    }).showToast();
    return;
  }

  try {
    let jsonData = JSON.parse(input);

    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData];
    }

    // Filter valid items first, then map to ensure STT is sequential with no gaps
    originalData = jsonData
      .filter((item) => item && item.title && item.title.trim() !== "")
      .map((item, index) => ({
        stt: index + 1,
        title: item.title || "",
        address: item.address || "",
        phone: normalizePhone(item.phone),
        url: item.url || "",
        totalScore: item.totalScore !== undefined && item.totalScore !== null ? item.totalScore : "",
        website: item.website || "",
      }));

    if (originalData.length === 0) {
      statusEl.className = "status error";
      statusEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Không tìm thấy dữ liệu hợp lệ! Yêu cầu mỗi đối tượng phải có trường "title".</span>
      `;
      Toastify({
        text: "⚠️ Không tìm thấy dữ liệu hợp lệ!",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #f59e0b, #fbbf24)"
        }
      }).showToast();
      return;
    }

    // Reset sort select to default
    if (sortSelect) {
      sortSelect.value = "default";
    }

    currentData = originalData.map(item => ({ ...item }));

    // Render results (Table & JSON)
    renderResults();

    // Show result container & enable download buttons
    tabsContainer.style.display = "block";
    downloadBtn.disabled = false;
    downloadJsonBtn.disabled = false;
    saveBtn.disabled = false;
    if (checkDupBtn) checkDupBtn.disabled = false;
    if (removeDupBtn) removeDupBtn.disabled = false;

    statusEl.className = "status success";
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>Đã xử lý thành công ${currentData.length} dòng dữ liệu! Số điện thoại đã được chuẩn hóa.</span>
    `;

    Toastify({
      text: ` Đã xử lý thành công ${currentData.length} dòng dữ liệu!`,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #10b981, #34d399)"
      }
    }).showToast();
  } catch (e) {
    console.error(e);
    statusEl.className = "status error";
    statusEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Lỗi định dạng JSON: ${e.message}</span>
    `;
    Toastify({
      text: ` Lỗi định dạng JSON: ${e.message}`,
      duration: 4000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #ef4444, #f87171)"
      }
    }).showToast();
  }
}

function renderResults() {
  const tableResultEl = document.getElementById("tableResult");
  const jsonResultEl = document.getElementById("jsonResult");

  if (currentData.length === 0) return;

  // Update STT based on current array order
  currentData.forEach((row, index) => {
    row.stt = index + 1;
  });

  // Render Table View
  let html = `
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Title</th>
          <th>Address</th>
          <th>Phone</th>
          <th>URL</th>
          <th>Total Score</th>
          <th>Website</th>
        </tr>
      </thead>
      <tbody>
  `;

  currentData.forEach((row) => {
    const displayUrl = row.url ? `<a href="${row.url}" target="_blank" class="hotel-link">Link</a>` : "";
    const displayWebsite = row.website ? `<a href="${row.website}" target="_blank" class="hotel-link">Website</a>` : "";
    const trClass = row.isDuplicate ? 'class="row-duplicate"' : "";
    const sttDisplay = row.isDuplicate ? `⚠️ ${row.stt}` : row.stt;
    html += `
      <tr ${trClass}>
        <td><strong>${sttDisplay}</strong></td>
        <td>${row.title}</td>
        <td>${row.address}</td>
        <td>${row.phone}</td>
        <td>${displayUrl}</td>
        <td>${row.totalScore}</td>
        <td>${displayWebsite}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  tableResultEl.innerHTML = html;

  // Render JSON View
  jsonResultEl.textContent = JSON.stringify(currentData, null, 2);
}

function handleSortChange(order) {
  if (originalData.length === 0) return;

  if (order === "default") {
    // Restore original order
    currentData = originalData.map(item => ({ ...item }));
  } else {
    // Sort currentData by totalScore
    currentData.sort((a, b) => {
      const scoreA = parseFloat(a.totalScore);
      const scoreB = parseFloat(b.totalScore);
      const hasA = !isNaN(scoreA);
      const hasB = !isNaN(scoreB);

      if (!hasA && !hasB) return 0;
      if (!hasA) return 1;  // Keep items without scores at the bottom
      if (!hasB) return -1; // Keep items without scores at the bottom

      return order === "desc" ? scoreB - scoreA : scoreA - scoreB;
    });
  }

  // Show Toastify notification
  const sortTexts = {
    "default": "Khôi phục thứ tự mặc định",
    "desc": "Đã sắp xếp điểm từ Cao → Thấp",
    "asc": "Đã sắp xếp điểm từ Thấp → Cao"
  };
  Toastify({
    text: `⚡ ${sortTexts[order]}`,
    duration: 2000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #4f46e5, #6366f1)"
    }
  }).showToast();

  // Re-render
  renderResults();
}

function switchTab(tabId) {
  // Update buttons
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick").includes(tabId)) {
      btn.classList.add("active");
    }
  });

  // Update content divs
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");
}

function copyToClipboard() {
  if (currentData.length === 0) return;
  
  const jsonText = JSON.stringify(currentData, null, 2);
  navigator.clipboard.writeText(jsonText).then(() => {
    const copyBtn = document.getElementById("copyBtn");
    const originalHTML = copyBtn.innerHTML;
    
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Đã sao chép!
    `;
    
    Toastify({
      text: "📋 Đã sao chép dữ liệu JSON!",
      duration: 2000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #3b82f6, #60a5fa)"
      }
    }).showToast();
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error("Lỗi khi sao chép: ", err);
    Toastify({
      text: "❌ Lỗi sao chép bộ nhớ tạm!",
      duration: 2000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #ef4444, #f87171)"
      }
    }).showToast();
  });
}

function downloadJSON() {
  if (currentData.length === 0) {
    alert("Chưa có dữ liệu để xuất!");
    return;
  }

  Toastify({
    text: "📥 Đang tải xuống file JSON...",
    duration: 2000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #64748b, #94a3b8)"
    }
  }).showToast();

  const jsonString = JSON.stringify(currentData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `hotels_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadExcel() {
  if (currentData.length === 0) {
    alert("Chưa có dữ liệu để xuất!");
    return;
  }

  // Load SheetJS dynamically
  if (typeof XLSX !== "undefined") {
    exportToExcel();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = function () {
      exportToExcel();
    };
    script.onerror = function () {
      alert("Không thể tải thư viện Excel. Vui lòng kiểm tra kết nối mạng.");
    };
    document.head.appendChild(script);
  }
}

function exportToExcel() {
  Toastify({
    text: "📥 Đang tải xuống file Excel...",
    duration: 2000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #10b981, #34d399)"
    }
  }).showToast();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(currentData);

  // Rename headers to look professional
  XLSX.utils.sheet_add_aoa(ws, [["STT", "Title", "Address", "Phone", "URL", "Total Score", "Website"]], { origin: "A1" });

  // Auto column width
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 45 }, // Title
    { wch: 55 }, // Address
    { wch: 20 }, // Phone
    { wch: 70 }, // URL
    { wch: 12 }, // Total Score
    { wch: 45 }, // Website
  ];
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Hotels");
  XLSX.writeFile(wb, `hotels_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Ctrl+Enter support
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    processJSON();
  }
});

// File Upload & Drag and Drop Handling
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  readFileContent(file);
}

function readFileContent(file) {
  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    Toastify({
      text: "❌ Vui lòng chỉ chọn tệp tin định dạng .json!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #ef4444, #f87171)"
      }
    }).showToast();
    return;
  }

  Toastify({
    text: `📂 Đang đọc tệp tin: ${file.name}...`,
    duration: 2000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #3b82f6, #60a5fa)"
    }
  }).showToast();

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    document.getElementById("jsonInput").value = text;
    // Automatically trigger processing
    processJSON();
    
    // Clear file input so the same file can be uploaded again
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };
  reader.onerror = function () {
    Toastify({
      text: "❌ Lỗi xảy ra khi đọc tệp tin!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #ef4444, #f87171)"
      }
    }).showToast();
  };
  reader.readAsText(file);
}

// Setup Drag & Drop Event Listeners
function initDragAndDrop() {
  const wrapper = document.getElementById("textareaWrapper");
  if (!wrapper) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    wrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    wrapper.addEventListener(eventName, () => {
      wrapper.classList.add("drag-over");
    }, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    wrapper.addEventListener(eventName, () => {
      wrapper.classList.remove("drag-over");
    }, false);
  });

  wrapper.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      readFileContent(file);
    }
  }, false);
}

// Call on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initDragAndDrop();
    initStorage();
  });
} else {
  initDragAndDrop();
  initStorage();
}

// LocalStorage Persistence Handling
function updateStorageStats() {
  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  const storageCountEl = document.getElementById("storageCount");
  const loadStorageBtn = document.getElementById("loadStorageBtn");
  const clearStorageBtn = document.getElementById("clearStorageBtn");

  if (storageCountEl) {
    storageCountEl.textContent = savedData.length;
  }

  const hasData = savedData.length > 0;
  if (loadStorageBtn) loadStorageBtn.disabled = !hasData;
  if (clearStorageBtn) clearStorageBtn.disabled = !hasData;
}

function saveToLocalStorage() {
  if (currentData.length === 0) {
    Toastify({
      text: "⚠️ Không có dữ liệu đã xử lý để lưu!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #f59e0b, #fbbf24)"
      }
    }).showToast();
    return;
  }

  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  const existingUrls = new Set(savedData.map(item => item.url.trim().toLowerCase()).filter(u => u !== ""));
  const batchUrls = new Set();
  const mergedData = [...savedData];
  let duplicateCount = 0;
  let newAddedCount = 0;

  currentData.forEach(item => {
    const urlVal = item.url ? item.url.trim().toLowerCase() : "";
    if (urlVal !== "") {
      if (existingUrls.has(urlVal) || batchUrls.has(urlVal)) {
        duplicateCount++;
        return; // Discard duplicate URL
      }
      batchUrls.add(urlVal);
    }
    const cleanItem = { ...item };
    delete cleanItem.isDuplicate; // Ensure we don't persist transient visual warning state
    mergedData.push(cleanItem);
    newAddedCount++;
  });

  // Re-index all items in storage
  mergedData.forEach((row, index) => {
    row.stt = index + 1;
  });

  localStorage.setItem("hotel_data", JSON.stringify(mergedData));
  updateStorageStats();

  if (duplicateCount > 0) {
    Toastify({
      text: `💾 Đã lưu! Thêm ${newAddedCount} mục mới. Loại bỏ ${duplicateCount} mục trùng URL. Tổng kho: ${mergedData.length} mục.`,
      duration: 5000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #10b981, #34d399)"
      }
    }).showToast();
  } else {
    Toastify({
      text: `💾 Đã lưu thành công ${newAddedCount} mục mới! Tổng kho: ${mergedData.length} mục.`,
      duration: 4000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #10b981, #34d399)"
      }
    }).showToast();
  }
}

function loadFromLocalStorage() {
  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  if (savedData.length === 0) {
    Toastify({
      text: "⚠️ Kho lưu trữ trống!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #f59e0b, #fbbf24)"
      }
    }).showToast();
    return;
  }

  // Load into active workspace
  originalData = savedData.map(item => ({ ...item }));
  currentData = savedData.map(item => ({ ...item }));

  // Reset sort selection to default
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = "default";
  }

  // Render
  renderResults();

  // Show views & enable buttons
  document.getElementById("tabsContainer").style.display = "block";
  document.getElementById("downloadBtn").disabled = false;
  document.getElementById("downloadJsonBtn").disabled = false;
  document.getElementById("saveBtn").disabled = false; // Keep save button enabled so they can save on top

  Toastify({
    text: `📂 Đã tải ${savedData.length} mục từ kho lưu trữ!`,
    duration: 3500,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #3b82f6, #60a5fa)"
    }
  }).showToast();
}

function clearLocalStorage() {
  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  if (savedData.length === 0) return;

  const conf = confirm(`Bạn có chắc chắn muốn xóa sạch toàn bộ ${savedData.length} khách sạn đã lưu trong kho lưu trữ của trình duyệt?`);
  if (!conf) return;

  localStorage.removeItem("hotel_data");
  updateStorageStats();

  Toastify({
    text: "🗑️ Đã xóa sạch dữ liệu lưu trữ trong kho!",
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #64748b, #94a3b8)"
    }
  }).showToast();
}

function checkDuplicates() {
  if (currentData.length === 0) return;

  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  const savedUrls = new Set(savedData.map(item => item.url.trim().toLowerCase()).filter(u => u !== ""));
  
  // Count url frequencies in currentData (batch) to find duplicates within the current list
  const currentUrlCounts = {};
  currentData.forEach(item => {
    const urlVal = item.url ? item.url.trim().toLowerCase() : "";
    if (urlVal !== "") {
      currentUrlCounts[urlVal] = (currentUrlCounts[urlVal] || 0) + 1;
    }
  });

  let duplicateCount = 0;
  currentData.forEach(item => {
    const urlVal = item.url ? item.url.trim().toLowerCase() : "";
    if (urlVal !== "") {
      const isSavedDup = savedUrls.has(urlVal);
      const isBatchDup = currentUrlCounts[urlVal] > 1;
      
      if (isSavedDup || isBatchDup) {
        item.isDuplicate = true;
        duplicateCount++;
      } else {
        item.isDuplicate = false;
      }
    } else {
      item.isDuplicate = false;
    }
  });

  // Re-render
  renderResults();

  if (duplicateCount > 0) {
    Toastify({
      text: `⚠️ Phát hiện ${duplicateCount} dòng trùng lặp URL! Các dòng này đã được tô màu vàng và gắn biểu tượng cảnh báo trong bảng.`,
      duration: 5000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #f59e0b, #d97706)"
      }
    }).showToast();
  } else {
    Toastify({
      text: "✅ Tuyệt vời! Không phát hiện trùng lặp URL nào trong danh sách.",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #10b981, #059669)"
      }
    }).showToast();
  }
}

function removeDuplicates() {
  if (currentData.length === 0) return;

  const savedData = JSON.parse(localStorage.getItem("hotel_data")) || [];
  const savedUrls = new Set(savedData.map(item => item.url.trim().toLowerCase()).filter(u => u !== ""));
  
  const uniqueData = [];
  const seenUrls = new Set();
  let removedCount = 0;

  currentData.forEach(item => {
    const urlVal = item.url ? item.url.trim().toLowerCase() : "";
    if (urlVal !== "") {
      const isSavedDup = savedUrls.has(urlVal);
      const isBatchDup = seenUrls.has(urlVal);
      
      if (isSavedDup || isBatchDup) {
        removedCount++;
        return; // Discard duplicate URL
      }
      seenUrls.add(urlVal);
    }
    // Keep unique record and clear duplicate visual warning flag
    const cleanItem = { ...item };
    delete cleanItem.isDuplicate;
    uniqueData.push(cleanItem);
  });

  if (removedCount === 0) {
    Toastify({
      text: "ℹ️ Không phát hiện bản ghi trùng lặp nào để xóa!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #64748b, #94a3b8)"
      }
    }).showToast();
    return;
  }

  // Update active data
  originalData = uniqueData.map(item => ({ ...item }));
  currentData = uniqueData.map(item => ({ ...item }));

  // Re-render results
  renderResults();

  Toastify({
    text: `🗑️ Đã xóa ${removedCount} dòng trùng lặp! Giữ lại ${currentData.length} bản ghi độc nhất.`,
    duration: 4000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #ef4444, #f87171)"
    }
  }).showToast();
}

function initStorage() {
  updateStorageStats();
}
