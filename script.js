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
  const sortSelect = document.getElementById("sortSelect");

  statusEl.innerHTML = "";
  tableResultEl.innerHTML = "";
  jsonResultEl.textContent = "";
  tabsContainer.style.display = "none";
  downloadBtn.disabled = true;
  downloadJsonBtn.disabled = true;
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
    html += `
      <tr>
        <td><strong>${row.stt}</strong></td>
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
  document.addEventListener("DOMContentLoaded", initDragAndDrop);
} else {
  initDragAndDrop();
}
