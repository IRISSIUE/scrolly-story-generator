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

  exportButton.addEventListener("click", async () => {
    closeMenu(menuList, menuToggleButton);
    await buildAndDownloadRenderedZipExport();
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
