/*
  leaflet-maps.js handles displaying leaflet maps from within a sticky container
*/
export {
  displayStickyMap,
  invalidateLeafletMapSize,
  createLeafletMapImageDataUrl,
};

const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 18;

let leafletMap = null;
let leafletMapId = null;

function displayStickyMap(id, lat, long, zoom) {
  console.log("Displaying map:", { leafletMapId, id, lat, long, zoom });
  const container = document.getElementById(id);
  console.log("Container dimensions:", {
    width: container.clientWidth,
    height: container.clientHeight,
    display: window.getComputedStyle(container).display,
  });

  if (id != leafletMapId) {
    removeCurrentLeafletMap();
  }

  zoom = clampMapZoom(zoom);

  if (!leafletMap) {
    leafletMapId = id;
    createStickyMap(id, lat, long, zoom);
  } else {
    moveStickyMapLocation(lat, long, zoom);
  }
  // leafletMap.invalidateSize();
}

function removeCurrentLeafletMap() {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
}

function moveStickyMapLocation(lat, long, zoom) {
  const options = {
    duration: 1.0, // Duration of the animation in seconds
    easeLinearity: 0.1, // How "smooth" the flyTo animation is
    noMoveStart: false, // Whether to trigger movestart event
  };
  leafletMap.flyTo([lat, long], zoom, options);
}

function createStickyMap(id, lat, long, zoom) {
  console.log("Creating new leaflet map in container:", id);
  leafletMap = L.map(id, {
    center: [lat, long],
    zoom: zoom,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(leafletMap);

  leafletMap.scrollWheelZoom.disable();

  handleLeafletResizeEvents();
}

function handleLeafletResizeEvents() {
  // Add event listener to handle display changes
  const mapContainer = document.getElementById(leafletMapId);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        const display = window.getComputedStyle(mapContainer).display;
        if (display !== "none") {
          leafletMap.invalidateSize();
        }
      }
    });
  });

  observer.observe(mapContainer, {
    attributes: true,
    attributeFilter: ["style"],
  });
}

function invalidateLeafletMapSize() {
  if (leafletMap) {
    leafletMap.invalidateSize();
  }
}

function clampMapZoom(zoomValue) {
  if (!Number.isFinite(zoomValue)) {
    return 10;
  }

  if (zoomValue > MAP_MAX_ZOOM) {
    return MAP_MAX_ZOOM;
  }

  if (zoomValue < MAP_MIN_ZOOM) {
    return MAP_MIN_ZOOM;
  }

  return zoomValue;
}

function waitForLeafletTiles(tileLayer, timeoutMs = 6000) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      tileLayer.off("load", finish);
      resolve();
    };

    tileLayer.once("load", finish);
    setTimeout(finish, timeoutMs);
  });
}

function drawLeafletTilesToCanvas(mapContainer, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for map image capture");
  }

  context.fillStyle = "#f5f5f5";
  context.fillRect(0, 0, width, height);

  const containerRect = mapContainer.getBoundingClientRect();
  const tiles = mapContainer.querySelectorAll(
    ".leaflet-tile-pane img.leaflet-tile",
  );

  let drawnTileCount = 0;
  tiles.forEach((tile) => {
    if (!tile.complete || tile.naturalWidth === 0 || tile.naturalHeight === 0) {
      return;
    }

    const tileRect = tile.getBoundingClientRect();
    const x = tileRect.left - containerRect.left;
    const y = tileRect.top - containerRect.top;

    try {
      context.drawImage(tile, x, y, tileRect.width, tileRect.height);
      drawnTileCount += 1;
    } catch {
      // Ignore tile draw failures and let the caller handle fallback behavior.
    }
  });

  if (drawnTileCount === 0) {
    throw new Error("No map tiles were available for image capture");
  }

  context.beginPath();
  context.arc(width / 2, height / 2, 8, 0, Math.PI * 2);
  context.fillStyle = "#e53935";
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = "#ffffff";
  context.stroke();

  return canvas.toDataURL("image/png");
}

async function createLeafletMapImageDataUrl({
  latitude,
  longitude,
  zoomLevel,
  width = 900,
  height = 540,
}) {
  if (typeof window.L === "undefined") {
    throw new Error("Leaflet is not available in this document");
  }

  const normalizedZoom = clampMapZoom(zoomLevel);
  const mapContainer = document.createElement("div");
  mapContainer.style.width = `${width}px`;
  mapContainer.style.height = `${height}px`;
  mapContainer.style.position = "fixed";
  mapContainer.style.left = "-10000px";
  mapContainer.style.top = "0";
  mapContainer.style.visibility = "hidden";
  mapContainer.style.pointerEvents = "none";
  mapContainer.style.zIndex = "-1";
  document.body.appendChild(mapContainer);

  const map = window.L.map(mapContainer, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    scrollWheelZoom: false,
    touchZoom: false,
    tap: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
  });

  const tileLayer = window.L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      crossOrigin: true,
    },
  ).addTo(map);

  try {
    map.setView([latitude, longitude], normalizedZoom, { animate: false });
    await waitForLeafletTiles(tileLayer);
    map.invalidateSize();

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    return drawLeafletTilesToCanvas(mapContainer, width, height);
  } finally {
    map.remove();
    mapContainer.remove();
  }
}
