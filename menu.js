import { buildAndDownloadRenderedZipExport } from "./export.js";
import { isPrintView } from "./common.js";

const printView = isPrintView();

function setToggleActionLabel(toggleActionButton) {
  if (!toggleActionButton) {
    return;
  }

  toggleActionButton.textContent = printView
    ? "Switch to Scrolly View"
    : "Switch to Print View";
}

function toggleViewMode() {
  const params = new URLSearchParams(window.location.search);

  if (printView) {
    params.delete("view");
    params.delete("autoprint");
  } else {
    params.set("view", "print");
  }

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  window.location.assign(nextUrl);
}

function closeMenu(menuList, menuToggleButton) {
  menuList.hidden = true;
  menuToggleButton.setAttribute("aria-expanded", "false");
}

function openMenu(menuList, menuToggleButton) {
  menuList.hidden = false;
  menuToggleButton.setAttribute("aria-expanded", "true");
}

function showExportDialog() {
  document.getElementById("export-dialog-heading").textContent =
    "Export to ZIP";
  const body = document.getElementById("export-dialog-body");
  body.textContent =
    "This will package the rendered story as a self-contained ZIP archive.";
  body.className = "";
  document.getElementById("export-dialog-cancel").hidden = false;
  const runBtn = document.getElementById("export-dialog-run");
  runBtn.hidden = false;
  runBtn.disabled = false;
  runBtn.textContent = "Export";
  document.getElementById("export-dialog-close").hidden = true;
  document.getElementById("export-dialog").showModal();
}

function setExportRunning() {
  document.getElementById("export-dialog-heading").textContent =
    "Exporting\u2026";
  document.getElementById("export-dialog-cancel").hidden = true;
  const runBtn = document.getElementById("export-dialog-run");
  runBtn.disabled = true;
  runBtn.textContent = "Exporting\u2026";
}

function updateExportDialogStatus(message) {
  document.getElementById("export-dialog-body").textContent = message;
}

function setExportComplete(message) {
  document.getElementById("export-dialog-heading").textContent =
    "Export Complete";
  const body = document.getElementById("export-dialog-body");
  body.textContent = message;
  body.className = "";
  document.getElementById("export-dialog-run").hidden = true;
  document.getElementById("export-dialog-close").hidden = false;
}

function setExportFailed(message) {
  document.getElementById("export-dialog-heading").textContent =
    "Export Failed";
  const body = document.getElementById("export-dialog-body");
  body.textContent = message;
  body.className = "export-dialog-error";
  document.getElementById("export-dialog-run").hidden = true;
  document.getElementById("export-dialog-close").hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const menuRoot = document.getElementById("top-menu");
  const menuToggleButton = document.getElementById("top-menu-toggle");
  const menuList = document.getElementById("top-menu-list");
  const toggleViewButton = document.getElementById("toggle-view-action");
  const exportButton = document.getElementById("export-action");

  if (
    !menuRoot ||
    !menuToggleButton ||
    !menuList ||
    !toggleViewButton ||
    !exportButton
  ) {
    return;
  }

  setToggleActionLabel(toggleViewButton);

  menuToggleButton.addEventListener("click", () => {
    if (menuList.hidden) {
      openMenu(menuList, menuToggleButton);
    } else {
      closeMenu(menuList, menuToggleButton);
    }
  });

  toggleViewButton.addEventListener("click", () => {
    closeMenu(menuList, menuToggleButton);
    toggleViewMode();
  });

  exportButton.addEventListener("click", () => {
    closeMenu(menuList, menuToggleButton);
    showExportDialog();
  });

  const exportDialog = document.getElementById("export-dialog");
  document
    .getElementById("export-dialog-cancel")
    .addEventListener("click", () => {
      exportDialog.close();
    });

  document
    .getElementById("export-dialog-run")
    .addEventListener("click", async () => {
      setExportRunning();
      const result = await buildAndDownloadRenderedZipExport(
        updateExportDialogStatus,
      );
      if (result.success) {
        setExportComplete(result.message);
      } else {
        setExportFailed(result.message);
      }
    });

  document
    .getElementById("export-dialog-close")
    .addEventListener("click", () => {
      exportDialog.close();
    });

  document.addEventListener("click", (event) => {
    if (!menuRoot.contains(event.target)) {
      closeMenu(menuList, menuToggleButton);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu(menuList, menuToggleButton);
    }
  });
});
