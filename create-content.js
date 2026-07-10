/*
  create-content.js creates the HTML for a scrolly story from story-level and step-level data 
  imported from elsewhere, like a google sheet.
  See index.html for the expected structure of the HTML 
*/
import { fetchScrollyData } from "./fetch-story-data.js";
import { validateStepDataArray } from "./common.js";
import { displayThenThrowError } from "./common.js";
import { stripHtml } from "./common.js";

let defaultTextHorizontalPercentage = "33.0";

export async function createAllStoryScrollyContentInHTML() {
  try {
    const allScrollyData = await fetchScrollyData();
    allScrollyData.storyData.validate(
      "Reading Story data from file (1st sheet)",
    );
    validateStepDataArray(
      allScrollyData.stepData,
      "Reading Step data from file (in the 'Steps' Tab/Sheet)",
    );

    // set default horizontal percentage from story data, before creating steps
    // so steps can use it if they don't have their own value
    defaultTextHorizontalPercentage = getValidHorizontalPercentage(
      allScrollyData.storyData.textHorizontalPercentage,
    );

    createTimelineInHtml(
      allScrollyData.storyData.timelineStart,
      allScrollyData.storyData.timelineEnd,
      allScrollyData.storyData.timelineTickInterval,
    );

    createStoryContentInHtml(allScrollyData.storyData);
    createStepsContentInHtml(allScrollyData.stepData);

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
    storyData.scrollBoxTextColor,
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
  browserTitle.innerHTML = stripHtml(storyData.title);

  const subtitle = document.getElementById("subtitle");
  subtitle.innerHTML = storyData.subtitle;

  const authors = document.getElementById("authors");
  authors.innerHTML = storyData.authors;

  const endText = document.getElementById("end-text");
  endText.innerHTML = storyData.endText;

  // The horizontal width may be overridden at the step level, but set
  // here first as the default
  setStoryHorizontalWidthOfTextAndStickyContent(
    storyData.textHorizontalPercentage,
  );
}

function setStoryHorizontalWidthOfTextAndStickyContent(horizontalPercentage) {
  let horizontalPercentageNumToUse =
    getValidHorizontalPercentage(horizontalPercentage);

  // There can be multiple steps containers, so set width for each

  // Width is specified as a percentage of the horizontal space for the text
  const stepsContainers = document.querySelectorAll(".steps-container");
  stepsContainers.forEach((stepsContentDiv) => {
    stepsContentDiv.style.width = `${horizontalPercentageNumToUse}%`;
  });

  // Sticky content is the remaining horizontal space
  const stickyContainers = document.querySelectorAll(".sticky-container");
  stickyContainers.forEach((stickyContentDiv) => {
    stickyContentDiv.style.width = `${100 - horizontalPercentageNumToUse}%`;
  });
  console.log(
    "Set all steps containers to ",
    horizontalPercentageNumToUse,
    "%",
  );
}

function getValidHorizontalPercentage(inputPercentage) {
  let horizontalPercentageNum = parseFloat(inputPercentage);

  if (
    isNaN(horizontalPercentageNum) ||
    horizontalPercentageNum > 100.0 ||
    horizontalPercentageNum < 0.0
  ) {
    horizontalPercentageNum = defaultTextHorizontalPercentage;
  }
  return horizontalPercentageNum.toString();
}

function createTimelineInHtml(
  timelineStart,
  timelineEnd,
  timelineTickInterval,
) {
  const timelineSection = document.getElementById("timeline");
  const startDate = parseTimelineDate(timelineStart);
  const endDate = parseTimelineDate(timelineEnd);
  const tickIntervalYears = Number(timelineTickInterval);

  if (
    !validateTimelineInputs(
      timelineSection,
      startDate,
      endDate,
      tickIntervalYears,
    )
  ) {
    return;
  }

  timelineSection.removeAttribute("hidden");
  document.body.classList.add("has-fixed-timeline");

  const tickDates = buildTimelineTickDates(
    startDate,
    endDate,
    tickIntervalYears,
  );
  const totalRangeMs = endDate.getTime() - startDate.getTime();

  const ticksHtml = tickDates
    .map((tickDate) => {
      const leftPercentage =
        totalRangeMs === 0
          ? 0
          : ((tickDate.getTime() - startDate.getTime()) / totalRangeMs) * 100;
      return `<div class="timeline-tick" style="left: ${leftPercentage}%"><span class="timeline-tick-mark" aria-hidden="true"></span><span class="timeline-tick-label">${formatTimelineDate(tickDate)}</span></div>`;
    })
    .join("");

  timelineSection.innerHTML = `
    <div class="timeline-container" aria-label="Timeline from ${formatTimelineDate(startDate)} to ${formatTimelineDate(endDate)}">
      <div class="timeline-track" aria-hidden="true"></div>
      ${ticksHtml}
    </div>
  `;
}

function validateTimelineInputs(
  timelineHTMLSection,
  startDate,
  endDate,
  tickIntervalYears,
) {
  if (!timelineHTMLSection) {
    return false;
  }

  if (
    !startDate ||
    !endDate ||
    !Number.isInteger(tickIntervalYears) ||
    tickIntervalYears <= 0 ||
    startDate > endDate
  ) {
    console.log(
      "Invalid or no timeline inputs specified. Timeline will not be displayed.",
    );
    console.log(
      "Start Date:",
      startDate,
      "End Date:",
      endDate,
      "Tick Interval:",
      tickIntervalYears,
    );
    return false;
  }
  return true;
}

function parseTimelineDate(inputDate) {
  if (!inputDate) {
    return null;
  }
  const trimmedInputDate = inputDate.toString().trim();

  // Year-only string like "1950"
  const yearOnlyMatch = trimmedInputDate.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1]);
    const parsedYearDate = new Date(year, 0, 1);
    return parsedYearDate;
  }

  // ISO date string like "1950-01-01" (local time, no timezone offset)
  const isoDateMatch = trimmedInputDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);
    const parsedDate = new Date(year, month - 1, day);
    return parsedDate;
  }

  const parsedDate = new Date(trimmedInputDate);
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function buildTimelineTickDates(startDate, endDate, tickIntervalYears) {
  const tickDates = [startDate];

  let nextTickDate = new Date(startDate);
  while (true) {
    nextTickDate = new Date(nextTickDate);
    nextTickDate.setFullYear(nextTickDate.getFullYear() + tickIntervalYears);

    if (nextTickDate >= endDate) {
      break;
    }

    tickDates.push(new Date(nextTickDate));
  }

  const lastTick = tickDates[tickDates.length - 1];
  if (lastTick.getTime() !== endDate.getTime()) {
    tickDates.push(endDate);
  }
  return tickDates;
}

function formatTimelineDate(date) {
  if (date.getMonth() === 0 && date.getDate() === 1) {
    return date.getFullYear().toString();
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
          closeScrollyContainer(scrollyContainer, storySteps),
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
      closeScrollyContainer(scrollyContainer, storySteps),
    );
  }
}

function createTextContainer(stepData, stepNum) {
  let textContainer = document.createElement("div");
  textContainer.classList.add("text-content");
  textContainer.dataset.step = stepNum;
  textContainer.innerHTML = stepData.text;
  textContainer.tabIndex = 0;
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
  stepElement.dataset.textHorizontalPercentage = getValidHorizontalPercentage(
    stepData.textHorizontalPercentage,
  );

  if (stepData.text && stepData.text !== "") {
    stepElement.innerHTML = `<div class="step-content" tabIndex="0">${stepData.text}</div>`;
  } else {
    stepElement.innerHTML = `<div class="step-content-empty" tabIndex="0">${stepData.text}</div>`;
  }

  return stepElement;
}

function createStickyContainers(uniqueId) {
  let stickyContainer = document.createElement("div");
  stickyContainer.classList.add("sticky-container");
  stickyContainer.tabIndex = "-1";

  let imageContainer = document.createElement("div");
  imageContainer.classList.add("sticky-image-container");
  imageContainer.innerHTML = `<img alt="Empty initial image container">`;

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
