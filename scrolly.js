/*
  Scrolly.js handles all the scrolling. It uses the Scrollama library to detect when a step
  is entered, and then replaces the content in the sticky container with the content associated with
  that step. It also handles transitions between different types of content (images, maps, videos). 
*/

import { StepData } from "./common.js";
import { createAllStoryScrollyContentInHTML } from "./create-content.js";

let _stickyImageContainer = null;
let _stickyMapContainer = null;
let _stickyVideoContainer = null;
let _prevStepData = null;

const transitionInMilliseconds = 500;

// scrollama notifies us when a step is entered/scrolled to
let scroller = scrollama();

document.addEventListener("DOMContentLoaded", async function () {
  await createAllStoryScrollyContentInHTML();

  // initialize scrollama after the scrolly content has been created
  initScrollama();
});

// scrollama event handlers
function handleStepEnter(response) {
  var stepElement = response.element;

  // Set active step state to is-active and all othe steps not active
  const steps = document.querySelectorAll(".step");
  steps.forEach((step) => step.classList.remove("is-active"));
  stepElement.classList.add("is-active");
  console.log("Step " + stepElement.dataset.step + " entered");

  replaceStepStickyContent(stepElement);
}

/* As we enter a step in the story, replace or modify the sticky content
   in HTML based on the step data
*/
function replaceStepStickyContent(stepElement) {
  let stepData = stepElement.dataset;

  // ensure we have the sticky containers associated with the current step
  setCurrentStickyContainers(stepElement);

  // display different sticky container if needed
  if (doesRequireStickyTransition(stepData)) {
    transitionToNewStickyContentContainer(stepData.contentType);
  }

  // Replace the content in the sticky container
  if (stepData.contentType === "image") {
    displayStickyImage(stepData);
  } else if (stepData.contentType === "video") {
    displayStickyVideo(stepData);
  } else if (stepData.contentType === "map") {
    displayStickyMap(
      _stickyMapContainer.id,
      stepData.latitude,
      stepData.longitude,
      stepData.zoomLevel
    );
    addAltTextToMap(_stickyMapContainer, stepData.altText);
  }
  _prevStepData = stepData;
}

function doesRequireStickyTransition(stepData) {
  // Transition to a new sticky container if the content type is different
  // or if the step number is not sequential
  return (
    _prevStepData == null ||
    _prevStepData.contentType != stepData.contentType ||
    Math.abs(parseInt(_prevStepData.step) - parseInt(stepData.step)) > 1
  );
}

function setCurrentStickyContainers(stepElement) {
  // Since there are multiple scrolly containers, find the sticky container
  // that is associated with the current scrolly container

  // Find the scrolly container of the currrent step
  const scrollyContainer = stepElement.closest(".scrolly-container");
  const stickyContainer = scrollyContainer.querySelector(".sticky-container");

  // search for each of the corrsponding sticky containers within this scrolly container
  _stickyImageContainer = stickyContainer.querySelector(
    ".sticky-image-container"
  );
  _stickyMapContainer = stickyContainer.querySelector(".sticky-map-container");
  _stickyVideoContainer = stickyContainer.querySelector(
    ".sticky-video-container"
  );
}

function transitionToNewStickyContentContainer(activateContentType) {
  // Start fading out the old container (just do all of them).
  // We've set up a transition on opacity, so setting it to 0 or 1 will take
  // as long as specified in CSS. We can fade in the new content after that
  _stickyMapContainer.style.opacity = 0;
  _stickyImageContainer.style.opacity = 0;
  _stickyVideoContainer.style.opacity = 0;

  stopPlayingVideo(); // in case video is playing, don't want to hear it after it scrolls off page

  // Fade in the new container after the opacity transition
  setTimeout(() => {
    switch (activateContentType) {
      case "image":
        _stickyImageContainer.style.opacity = 1;
        _stickyImageContainer.style.display = "flex";
        _stickyVideoContainer.style.display = "none";
        _stickyMapContainer.style.display = "none";
        break;
      case "map":
        _stickyMapContainer.style.opacity = 1;
        _stickyMapContainer.style.display = "block";
        _stickyImageContainer.style.display = "none";
        _stickyVideoContainer.style.display = "none";
        break;
      case "video":
        _stickyVideoContainer.style.opacity = 1;
        _stickyVideoContainer.style.display = "block";
        _stickyImageContainer.style.display = "none";
        _stickyMapContainer.style.display = "none";
        break;
    }
  }, transitionInMilliseconds);
}

function displayStickyImage(stepData) {
  let img = _stickyImageContainer.querySelector("img");

  // only replace sticky image if it has changed, to avoid flickering
  if (
    !_prevStepData ||
    (stepData.filePath && _prevStepData.filePath != stepData.filePath)
  ) {
    // Fade out the current image before changing the source
    // Note that this will double the transition when we are switching from
    // an image to a different content type because the containers also fade in/out
    // in that case, but that's ok, a longer transition is appropriate in that case
    img.style.opacity = 0;

    // fade in the image after the opacity transition
    setTimeout(() => {
      // Change the image source
      img.src = stepData.filePath;
      img.alt = stepData.altText;
      img.style.opacity = 1;

      setImageOrientation(img, stepData.imageOrientation);
    }, transitionInMilliseconds);
  }
  if (stepData.zoomLevel) {
    img.style.transform = `scale(${stepData.zoomLevel})`;
  }
}

function setImageOrientation(img, imageOrientation) {
  if (imageOrientation && imageOrientation.toLowerCase() === "vertical") {
    img.style.objectFit = "contain"; // display more of the vertical space of the image
  } else {
    img.style.objectFit = "cover"; // display more of the horizontal space of the image
  }
}

function displayStickyVideo(stepData) {
  _stickyVideoContainer.innerHTML = `<iframe 
                id="the-iframe-video"
                src="${stepData.filePath}"
                frameborder="0"
                referrerpolicy="strict-origin-when-cross-origin"
                >
            </iframe>`;
  _stickyVideoContainer.ariaLabel = stepData.altText;
  _stickyVideoContainer.role = "tooltip";

  _prevStepData = stepData.filePath;
}

function stopPlayingVideo() {
  // To properly do this, we'd have to know which streaming service, if any, is currently
  // playing and call a different API for each service to stop their player.
  // Instead, we'll just blank out the source of the video -- it will get loaded again the
  // next time a step is invoked.
  const iframe = document.getElementById("the-iframe-video");
  if (iframe != null) {
    iframe.src = "";
  }
}

function addAltTextToMap(mapElement, altText) {
  mapElement.setAttribute("aria-label", altText);
}

function initScrollama() {
  scroller
    .setup({
      step: ".scrolly-container .step",
      offset: 0.65, // what % from the top of the viewport the step should be considered "entered"
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  // setup resize event
  window.addEventListener("resize", scroller.resize);
}
