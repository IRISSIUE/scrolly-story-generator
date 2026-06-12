/*
  print-view.js adds a static print-friendly rendering mode.
  In print mode, scrolly containers are flattened into a linear sequence of
  text + media blocks so the page can be printed without sticky interactions.
*/

import {
  isZipExportRequested,
  buildAndDownloadRenderedZipExport,
} from "./export.js";
import { createLeafletMapImageDataUrl } from "./leaflet-maps.js";

const PRINT_MAP_IMAGE_WIDTH = 900;
const PRINT_MAP_IMAGE_HEIGHT = 540;

function isPrintViewRequested() {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "print";
}

function buildOpenStreetMapLink(latitude, longitude, zoomLevel) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoomLevel}/${latitude}/${longitude}`;
}

function createMapFallback(dataset) {
  const mapFallback = document.createElement("div");
  mapFallback.className = "print-map-fallback";

  const summary = document.createElement("p");
  summary.textContent = dataset.altText || "Map content";

  const coordinates = document.createElement("p");
  coordinates.textContent = `Coordinates: ${dataset.latitude || "?"}, ${dataset.longitude || "?"} (zoom ${dataset.zoomLevel || "?"})`;

  mapFallback.appendChild(summary);
  mapFallback.appendChild(coordinates);

  return mapFallback;
}

async function createPrintMediaBlock(stepElement) {
  const dataset = stepElement.dataset;
  const media = document.createElement("div");
  media.className = "print-step-media";

  if (dataset.contentType === "image") {
    const img = document.createElement("img");
    img.src = dataset.filePath || "";
    img.alt = dataset.altText || "";
    img.loading = "lazy";
    img.decoding = "async";

    const zoom = parseFloat(dataset.zoomLevel);
    if (!isNaN(zoom) && zoom > 0) {
      // Keep zoom support in print mode while preserving page flow.
      img.style.transform = `scale(${zoom})`;
    }

    media.appendChild(img);
  } else if (dataset.contentType === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = dataset.filePath || "";
    iframe.title = dataset.altText || "Embedded video";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    media.appendChild(iframe);

    if (dataset.filePath) {
      const link = document.createElement("p");
      link.className = "print-fallback-link";
      link.innerHTML = `Video link: <a href="${dataset.filePath}" target="_blank" rel="noopener noreferrer">${dataset.filePath}</a>`;
      media.appendChild(link);
    }
  } else if (dataset.contentType === "map") {
    const latitude = Number.parseFloat(dataset.latitude);
    const longitude = Number.parseFloat(dataset.longitude);
    const parsedZoomLevel = Number.parseFloat(dataset.zoomLevel);
    const zoomLevel = Number.isFinite(parsedZoomLevel) ? parsedZoomLevel : 10;
    const hasValidCoordinates =
      Number.isFinite(latitude) && Number.isFinite(longitude);

    if (hasValidCoordinates) {
      const mapLinkContainer = document.createElement("a");
      mapLinkContainer.href = buildOpenStreetMapLink(
        latitude,
        longitude,
        zoomLevel,
      );
      mapLinkContainer.target = "_blank";
      mapLinkContainer.rel = "noopener noreferrer";
      mapLinkContainer.title = "Click to open interactive map on OpenStreetMap";

      const mapImage = document.createElement("img");
      mapImage.alt = dataset.altText || "Map content";
      mapImage.loading = "lazy";
      mapImage.decoding = "async";
      mapImage.style.width = "100%";
      mapImage.style.border = "1px solid #d6d6d6";
      mapImage.style.cursor = "pointer";

      try {
        mapImage.src = await createLeafletMapImageDataUrl({
          latitude,
          longitude,
          zoomLevel,
          width: PRINT_MAP_IMAGE_WIDTH,
          height: PRINT_MAP_IMAGE_HEIGHT,
        });
      } catch {
        media.appendChild(createMapFallback(dataset));
        return media;
      }

      mapLinkContainer.appendChild(mapImage);
      media.appendChild(mapLinkContainer);
    } else {
      media.appendChild(createMapFallback(dataset));
    }
  }

  return media;
}

async function createPrintStep(stepElement) {
  const printStep = document.createElement("article");
  printStep.className = "print-step";

  const stepBody = stepElement.querySelector(
    ".step-content, .step-content-empty",
  );
  const textBlock = document.createElement("div");
  textBlock.className = "print-step-text";
  textBlock.innerHTML = stepBody ? stepBody.innerHTML : "";

  printStep.appendChild(textBlock);

  if (stepElement.dataset.contentType !== "text") {
    printStep.appendChild(await createPrintMediaBlock(stepElement));
  }

  return printStep;
}

async function buildPrintableContentSection() {
  const contentSection = document.getElementById("content-section");
  if (!contentSection) {
    return;
  }

  const printableContainer = document.createElement("div");
  printableContainer.id = "print-content";

  const nodes = Array.from(contentSection.children);
  for (const node of nodes) {
    if (node.classList.contains("text-content")) {
      const textOnly = document.createElement("article");
      textOnly.className = "print-step print-text-only";
      textOnly.innerHTML = node.innerHTML;
      printableContainer.appendChild(textOnly);
      continue;
    }

    if (node.classList.contains("scrolly-container")) {
      const steps = node.querySelectorAll(".step");
      for (const step of steps) {
        printableContainer.appendChild(await createPrintStep(step));
      }
    }
  }

  contentSection.innerHTML = "";
  contentSection.appendChild(printableContainer);
}

async function convertPageToPrintView() {
  document.body.classList.add("print-view");
  await buildPrintableContentSection();

  const mobileWarning = document.getElementById("mobile-warning");
  if (mobileWarning) {
    mobileWarning.style.display = "none";
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("autoprint") === "1") {
    setTimeout(() => window.print(), 200);
  }
}

export async function initializePrintControlsAndView() {
  const printView = isPrintViewRequested();
  const zipExportRequested = isZipExportRequested();

  if (printView) {
    await convertPageToPrintView();
  }

  if (zipExportRequested) {
    await buildAndDownloadRenderedZipExport();
    return true;
  }

  return printView;
}
