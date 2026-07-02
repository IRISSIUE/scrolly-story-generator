/*
  export.js handles the ZIP export functionality for packaging rendered stories
  as self-contained archives suitable for ingestion into publishing platforms.
*/

const ZIP_EXPORT_FOLDER = "scrolly-story-export";
const ZIP_EXPORT_PARAM = "zip";

// Scripts only needed in the live app. Excluded from rendered exports.
const EXPORT_EXCLUDED_SCRIPTS = new Set([
  "fetch-story-data.js",
  "create-content.js",
  "google-sheet-config.js",
  "menu.js",
  "export.js",
]);

// Stylesheets belonging to excluded features.
const EXPORT_EXCLUDED_STYLES = new Set(["menu.css", "export.css"]);

// JS modules imported at runtime via import statements rather than explicit
// <script> tags, so they won't be found by scanning the DOM alone.
const EXPORT_TRANSITIVE_JS = ["print-view.js", "common.js"];

function isZipExportRequested() {
  const params = new URLSearchParams(window.location.search);
  return params.get("export") === ZIP_EXPORT_PARAM;
}

function upsertExportStatus(message, isError = false) {
  const intro = document.getElementById("intro");
  if (!intro) {
    return;
  }

  let status = document.getElementById("export-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "export-status";
    status.className = "export-status";
    intro.appendChild(status);
  }

  status.textContent = message;
  status.classList.toggle("export-status-error", isError);
}

function isLocalDependencyUrl(value) {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:")
  ) {
    return false;
  }

  return true;
}

function getPathRelativeToCurrentPageDirectory(pathname) {
  const pagePath = window.location.pathname;
  const pageDir = pagePath.endsWith("/")
    ? pagePath
    : pagePath.substring(0, pagePath.lastIndexOf("/") + 1);

  if (pathname.startsWith(pageDir)) {
    return pathname.slice(pageDir.length);
  }

  return pathname.replace(/^\//, "");
}

function rewriteAndCollectLocalDependencies(clonedDocument) {
  const dependencies = new Map();
  const elementsToInspect = [
    ["link[href]", "href"],
    ["script[src]", "src"],
    ["img[src]", "src"],
    ["video[src]", "src"],
    ["audio[src]", "src"],
    ["source[src]", "src"],
    ["iframe[src]", "src"],
    ["object[data]", "data"],
    [".step[data-file-path]", "data-file-path"],
  ];

  elementsToInspect.forEach(([selector, attrName]) => {
    clonedDocument.querySelectorAll(selector).forEach((element) => {
      const originalValue = element.getAttribute(attrName);
      if (!isLocalDependencyUrl(originalValue)) {
        return;
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(originalValue, window.location.href);
      } catch {
        return;
      }

      if (parsedUrl.origin !== window.location.origin) {
        return;
      }

      let relativePath = getPathRelativeToCurrentPageDirectory(
        parsedUrl.pathname,
      );
      if (!relativePath || relativePath === "") {
        return;
      }

      relativePath = relativePath.replace(/^\.\//, "");

      element.setAttribute(attrName, relativePath);
      dependencies.set(relativePath, parsedUrl.href);
    });
  });

  return dependencies;
}

function buildStaticExportHtmlAndDependencies() {
  const currentDocumentContent = document.cloneNode(true);

  currentDocumentContent.querySelectorAll("#export-status").forEach((node) => {
    node.remove();
  });

  currentDocumentContent.body.classList.remove("export-running");

  // In rendered export mode, scrolly.js uses existing DOM instead of fetching spreadsheet data.
  const renderedExportFlagScript =
    currentDocumentContent.createElement("script");
  renderedExportFlagScript.textContent =
    "window.__SCROLLY_EXPORTED_RENDERED__ = true;";
  currentDocumentContent.head.prepend(renderedExportFlagScript);

  // Remove scripts not needed in the rendered export.
  currentDocumentContent
    .querySelectorAll("script[src]")
    .forEach((scriptNode) => {
      const src = scriptNode.getAttribute("src");
      const basename = src ? src.split("/").pop().split("?")[0] : "";
      if (EXPORT_EXCLUDED_SCRIPTS.has(basename)) {
        scriptNode.remove();
      }
    });

  // Remove stylesheets not needed in the rendered export.
  currentDocumentContent
    .querySelectorAll('link[rel="stylesheet"][href]')
    .forEach((linkNode) => {
      const href = linkNode.getAttribute("href");
      const basename = href ? href.split("/").pop().split("?")[0] : "";
      if (EXPORT_EXCLUDED_STYLES.has(basename)) {
        linkNode.remove();
      }
    });

  // Remove menu UI — not needed in the rendered export.
  currentDocumentContent
    .querySelectorAll(".top-menu, #export-dialog")
    .forEach((el) => el.remove());

  const dependencies = rewriteAndCollectLocalDependencies(
    currentDocumentContent,
  );

  // Add transitive JS dependencies that are loaded via import statements
  // rather than explicit <script> tags, so they won't be found from the DOM alone.
  EXPORT_TRANSITIVE_JS.forEach((jsFile) => {
    if (!dependencies.has(jsFile)) {
      dependencies.set(jsFile, new URL(jsFile, window.location.href).href);
    }
  });

  const doctype = "<!DOCTYPE html>\n";
  const html = `${doctype}${currentDocumentContent.documentElement.outerHTML}`;
  return { html, dependencies };
}

async function loadJSZipLibrary() {
  const jszipModule =
    await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm");
  return jszipModule.default;
}

function downloadBlob(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

export async function buildAndDownloadRenderedZipExport(onStatus) {
  const reportProgress = onStatus ?? upsertExportStatus;
  document.body.classList.add("export-running");
  reportProgress("Preparing rendered export...");

  try {
    const { html, dependencies } = buildStaticExportHtmlAndDependencies();
    reportProgress("Collecting local files for ZIP package...");

    const JSZip = await loadJSZipLibrary();
    const zip = new JSZip();
    const rootFolder = zip.folder(ZIP_EXPORT_FOLDER);

    rootFolder.file("index.html", html);

    const dependencyEntries = Array.from(dependencies.entries());
    for (const [relativePath, fetchUrl] of dependencyEntries) {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Unable to fetch local dependency: ${relativePath}`);
      }

      const bytes = await response.arrayBuffer();
      rootFolder.file(relativePath, bytes);
    }

    reportProgress("Creating ZIP archive...");

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const safeTitle = (document.title || "scrolly-story")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    const baseName = safeTitle || "scrolly-story";
    downloadBlob(zipBlob, `${baseName}-export.zip`);

    const successMessage = `Done. Downloaded ZIP with rendered HTML and ${dependencies.size} local dependencies.`;
    if (!onStatus) {
      upsertExportStatus(successMessage);
    }
    return { success: true, message: successMessage };
  } catch (error) {
    const errorMessage = `Export failed: ${error.message}`;
    if (!onStatus) {
      upsertExportStatus(errorMessage, true);
    }
    return { success: false, message: errorMessage };
  } finally {
    document.body.classList.remove("export-running");
  }
}

export { isZipExportRequested };
