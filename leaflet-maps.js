/*
  leaflet-maps.js handles displaying leaflet maps from within a sticky container
*/

let leafletMap = null;
let leafletMapId = null;

function displayStickyMap(id, lat, long, zoom) {
  /* DEBUGGING
  console.log("Displaying map:", { lat, long, zoom });
  const container = document.getElementById("sticky-map-container");
  console.log("Container dimensions:", {
    width: container.clientWidth,
    height: container.clientHeight,
    display: window.getComputedStyle(container).display,
  });
  */
  if (id != leafletMapId) {
    removeCurrentLeafletMap();
  }

  if (zoom > 18) {
    zoom = 18; // max zoom level for leaflet maps
  } else if (zoom < 1) {
    zoom = 1; // min zoom level for leaflet maps
  }

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
  leafletMap = L.map(id, {
    center: [lat, long],
    zoom: zoom,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(leafletMap);

  leafletMap.scrollWheelZoom.disable();

  handleResizeEvents();
}

function handleResizeEvents() {
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
