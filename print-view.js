/*
  print-view.js adds a static print-friendly rendering mode.
  In print mode, scrolly containers are flattened into a linear sequence of
  text + media blocks so the page can be printed without sticky interactions.
*/

function isPrintViewRequested() {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "print";
}

function withPrintParams(autoPrint) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "print");

  if (autoPrint) {
    url.searchParams.set("autoprint", "1");
  } else {
    url.searchParams.delete("autoprint");
  }

  return url.toString();
}

function withInteractiveParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("autoprint");
  return url.toString();
}

function createActionLink(text, href, className) {
  const link = document.createElement("a");
  link.textContent = text;
  link.href = href;
  link.className = className;
  return link;
}

function createPrintMediaBlock(stepElement) {
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
    const mapFallback = document.createElement("div");
    mapFallback.className = "print-map-fallback";

    const summary = document.createElement("p");
    summary.textContent = dataset.altText || "Map content";

    const coordinates = document.createElement("p");
    coordinates.textContent = `Coordinates: ${dataset.latitude || "?"}, ${dataset.longitude || "?"} (zoom ${dataset.zoomLevel || "?"})`;

    mapFallback.appendChild(summary);
    mapFallback.appendChild(coordinates);

    if (dataset.latitude && dataset.longitude) {
      const osmLink = document.createElement("a");
      osmLink.href = `https://www.openstreetmap.org/?mlat=${dataset.latitude}&mlon=${dataset.longitude}#map=${dataset.zoomLevel || 10}/${dataset.latitude}/${dataset.longitude}`;
      osmLink.textContent = "Open location in OpenStreetMap";
      osmLink.target = "_blank";
      osmLink.rel = "noopener noreferrer";
      mapFallback.appendChild(osmLink);
    }

    media.appendChild(mapFallback);
  }

  return media;
}

function createPrintStep(stepElement) {
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
    printStep.appendChild(createPrintMediaBlock(stepElement));
  }

  return printStep;
}

function buildPrintableContentSection() {
  const contentSection = document.getElementById("content-section");
  if (!contentSection) {
    return;
  }

  const printableContainer = document.createElement("div");
  printableContainer.id = "print-content";

  Array.from(contentSection.children).forEach((node) => {
    if (node.classList.contains("text-content")) {
      const textOnly = document.createElement("article");
      textOnly.className = "print-step print-text-only";
      textOnly.innerHTML = node.innerHTML;
      printableContainer.appendChild(textOnly);
      return;
    }

    if (node.classList.contains("scrolly-container")) {
      const steps = node.querySelectorAll(".step");
      steps.forEach((step) => {
        printableContainer.appendChild(createPrintStep(step));
      });
    }
  });

  contentSection.innerHTML = "";
  contentSection.appendChild(printableContainer);
}

function convertPageToPrintView() {
  document.body.classList.add("print-view");
  buildPrintableContentSection();

  const mobileWarning = document.getElementById("mobile-warning");
  if (mobileWarning) {
    mobileWarning.style.display = "none";
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("autoprint") === "1") {
    setTimeout(() => window.print(), 200);
  }
}

export function initializePrintControlsAndView() {
  const printView = isPrintViewRequested();

  if (printView) {
    convertPageToPrintView();
  }

  return printView;
}
