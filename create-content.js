/*
  create-content.js creates the HTML for a scrolly story from story-level and step-level data 
  imported from elsewhere, like a google sheet.
  See index.html for the expected structure of the HTML 
*/
import { fetchScrollyData } from "./fetch-story-data.js";
import { validateStepDataArray } from "./common.js";
import { displayThenThrowError } from "./common.js";

export async function createAllStoryScrollyContentInHTML() {
  try {
    const allScrollyData = await fetchScrollyData();
    allScrollyData.storyData.validate(
      "Reading Story data from file (1st sheet)"
    );
    validateStepDataArray(
      allScrollyData.stepData,
      "Reading Step data from file (2nd sheet)"
    );
    createStoryContentInHtml(allScrollyData.storyData);
    createStepsContentInHtml(allScrollyData.stepData);

    // horizontalPercentage has to be set after Steps are created
    // because that's when the sticky containers (that get their
    // width set) are created
    setHorizontalWidthOfTextAndStickyContent(
      allScrollyData.storyData.textHorizontalPercentage
    );

    applyGlobalStyles(allScrollyData.storyData);
  } catch (scrollyError) {
    displayThenThrowError(scrollyError);
  }
}

/*
    Story Level content
*/

function applyGlobalStyles(storyData) {
  if (storyData.backgroundColor && storyData.backgroundColor !== "") {
    const body = document.querySelector("body");
    body.style.backgroundColor = storyData.backgroundColor;
  }

  applyTextBoxStyles(
    storyData.scrollBoxBackgroundColor,
    storyData.scrollBoxTextColor
  );
}

function applyTextBoxStyles(bgColor, textColor) {
  const stepContents = document.querySelectorAll(".step-content");
  if (bgColor && bgColor !== "") {
    stepContents.forEach((el) => {
      el.style.backgroundColor = bgColor;
    });
  }
  if (textColor && textColor !== "") {
    stepContents.forEach((el) => {
      el.style.color = textColor;
    });
  }
}

// export for testing only
export function createStoryContentInHtml(storyData) {
  const storyTitle = document.getElementById("story-title");
  storyTitle.innerHTML = storyData.title;

  const browserTitle = document.getElementById("browser-title");
  browserTitle.innerHTML = storyData.title;

  const subtitle = document.getElementById("subtitle");
  subtitle.innerHTML = storyData.subtitle;

  const authors = document.getElementById("authors");
  authors.innerHTML = storyData.authors;

  const endText = document.getElementById("end-text");
  endText.innerHTML = storyData.endText;
}

function setHorizontalWidthOfTextAndStickyContent(horizontalPercentage) {
  if (horizontalPercentage < 99 && horizontalPercentage > 1) {
    // There can be multiple steps containers, so set width for each

    // Width is specified as a percentage of the horizontal space for the text
    const stepsContainers = document.querySelectorAll(".steps-container");
    stepsContainers.forEach((stepsContentDiv) => {
      stepsContentDiv.style.width = `${horizontalPercentage}%`;
    });

    // Sticky content is the remaining horizontal space, but we have to account
    // for each kind of sticky content
    const stickyContainers = document.querySelectorAll(".sticky-container");
    stickyContainers.forEach((stickyContentDiv) => {
      stickyContentDiv.style.width = `${100 - horizontalPercentage}%`;
    });
  }
}

/* 
    Step Level content
*/
function createStepsContentInHtml(stepDataArray) {
  var stepNumber = 1;
  var isPrevStepScrolly = false;
  let contentSection = document.querySelector("#content-section");

  let scrollyContainer = createScrollyContainer();
  let storySteps = document.createElement("div");
  storySteps.classList.add("steps-container");

  contentSection.innerHTML = "";

  stepDataArray.forEach((stepData) => {
    if (stepData.contentType === "text") {
      // Text steps are not scrolly, so we have to close our scrolly container
      // and start a new section
      if (isPrevStepScrolly) {
        contentSection.appendChild(
          closeScrollyContainer(scrollyContainer, storySteps)
        );
      }

      // create and add a text container
      const textContainer = createTextContainer(stepData, stepNumber);
      contentSection.appendChild(textContainer);

      // start a new scrolly container for subsequent steps
      scrollyContainer = createScrollyContainer();
      storySteps = document.createElement("div");
      storySteps.classList.add("steps-container");
      isPrevStepScrolly = false;
    } else {
      // Create next step in the scrolly story
      const stepElement = createStepElement(stepData, stepNumber);
      storySteps.appendChild(stepElement);
      isPrevStepScrolly = true;
    }
    stepNumber++;
  });

  if (isPrevStepScrolly) {
    contentSection.appendChild(
      closeScrollyContainer(scrollyContainer, storySteps)
    );
  }
}

function createTextContainer(stepData, stepNum) {
  let textContainer = document.createElement("div");
  textContainer.classList.add("text-content");
  textContainer.dataset.step = stepNum;
  textContainer.innerHTML = stepData.text;
  return textContainer;
}

function createScrollyContainer() {
  let scrollyContainer = document.createElement("div");
  scrollyContainer.classList.add("scrolly-container");
  return scrollyContainer;
}

function createStepElement(stepData, stepNumber) {
  const stepElement = document.createElement("div");
  stepElement.classList.add("step");
  stepElement.dataset.step = stepNumber;
  stepElement.dataset.contentType = stepData.contentType;
  if (stepData.filePath) {
    stepElement.dataset.filePath = stepData.filePath;
  }
  if (stepData.altText) {
    stepElement.dataset.altText = stepData.altText;
  }
  if (stepData.latitude) {
    stepElement.dataset.latitude = stepData.latitude;
  }
  if (stepData.longitude) {
    stepElement.dataset.longitude = stepData.longitude;
  }
  if (stepData.zoomLevel) {
    stepElement.dataset.zoomLevel = stepData.zoomLevel;
  }
  if (stepData.imageOrientation) {
    stepElement.dataset.imageOrientation = stepData.imageOrientation;
  }
  stepElement.innerHTML = `<div class="step-content">${stepData.text}</div>`;

  return stepElement;
}

function createStickyContainers(uniqueId) {
  let stickyContainer = document.createElement("div");
  stickyContainer.classList.add("sticky-container");

  let imageContainer = document.createElement("div");
  imageContainer.classList.add("sticky-image-container");
  imageContainer.innerHTML = `<img>`;

  let mapContainer = document.createElement("div");
  mapContainer.classList.add("sticky-map-container");
  mapContainer.id = "sticky-map-container-" + uniqueId;

  let videoContainer = document.createElement("div");
  videoContainer.classList.add("sticky-video-container");

  stickyContainer.appendChild(imageContainer);
  stickyContainer.appendChild(mapContainer);
  stickyContainer.appendChild(videoContainer);

  return stickyContainer;
}

// Add the steps and sticky containers to the scrolly container
// and return the scrolly container to be added to the content section
function closeScrollyContainer(scrollyContainer, storySteps) {
  scrollyContainer.appendChild(storySteps);

  // sticky containers need a unique id, so just grab the first step
  // number of this container, which will be unique to all the scrolly content
  const uniqStickyId = getScrollyConatainerFirstStepNum(scrollyContainer);
  const stickyContainer = createStickyContainers(uniqStickyId);
  scrollyContainer.appendChild(stickyContainer);

  return scrollyContainer;
}

function getScrollyConatainerFirstStepNum(scrollyContainer) {
  return scrollyContainer.querySelector(".step").dataset.step;
}
