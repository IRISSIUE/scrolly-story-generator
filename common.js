/*
  common.js contains the data structures and validation functions for the scrolly story,
  plus other common functions used by the scrolly story.
*/

// Defines all the data needed for a step

export class ScrollyData {
  constructor(storyData, stepData) {
    this.storyData = storyData;
    this.stepData = stepData;
  }
}

export class StoryData {
  constructor(
    scrollType,
    title,
    subtitle,
    endText,
    textHorizontalPercentage,
    authors,
    backgroundColor,
    scrollBoxBackgroundColor,
    scrollBoxTextColor,
    footer,
    timelineStart,
    timelineEnd,
    timelineTickInterval,
  ) {
    this.scrollType = DOMPurify.sanitize(scrollType);
    this.title = DOMPurify.sanitize(title);
    this.subtitle = DOMPurify.sanitize(subtitle);
    this.endText = DOMPurify.sanitize(endText);
    this.authors = DOMPurify.sanitize(authors);
    // don't sanitize numeric values as that will make "0" become ""
    this.textHorizontalPercentage = stripPercentageCharIfExists(
      textHorizontalPercentage,
    );
    this.backgroundColor = DOMPurify.sanitize(backgroundColor);
    this.scrollBoxBackgroundColor = DOMPurify.sanitize(
      scrollBoxBackgroundColor,
    );
    this.scrollBoxTextColor = DOMPurify.sanitize(scrollBoxTextColor);
    this.footer = DOMPurify.sanitize(footer);
    this.timelineStart = DOMPurify.sanitize(timelineStart);
    this.timelineEnd = DOMPurify.sanitize(timelineEnd);
    this.timelineTickInterval = DOMPurify.sanitize(timelineTickInterval);
  }

  validate(actionTextIfError) {
    this.validateTimelineStart(actionTextIfError);
    this.validateTimelineEnd(actionTextIfError);
    this.validateTimelineTickInterval(actionTextIfError);
    this.validateTimelineDateRange(actionTextIfError);
  }

  validateTimelineStart(actionTextIfError) {
    if (
      doesValueExist(this.timelineStart) &&
      !isValidDate(this.timelineStart)
    ) {
      throw new ScrollyError(
        actionTextIfError,
        `Timeline Start Date "${this.timelineStart}" is invalid`,
        "Timeline Start Date must be a valid date",
      );
    }
  }

  validateTimelineEnd(actionTextIfError) {
    if (doesValueExist(this.timelineEnd) && !isValidDate(this.timelineEnd)) {
      throw new ScrollyError(
        actionTextIfError,
        `Timeline End Date "${this.timelineEnd}" is invalid`,
        "Timeline End Date must be a valid date",
      );
    }
  }

  validateTimelineTickInterval(actionTextIfError) {
    if (!doesValueExist(this.timelineTickInterval)) {
      return;
    }

    const tickInterval = Number(this.timelineTickInterval);
    if (!Number.isInteger(tickInterval) || tickInterval <= 0) {
      throw new ScrollyError(
        actionTextIfError,
        `Timeline Tick Interval of "${this.timelineTickInterval}" is invalid`,
        "Timeline Tick Interval must be a positive integer number of years",
      );
    }
  }

  validateTimelineDateRange(actionTextIfError) {
    if (
      !doesValueExist(this.timelineStart) ||
      !doesValueExist(this.timelineEnd)
    ) {
      return;
    }

    const startDate = new Date(this.timelineStart);
    const endDate = new Date(this.timelineEnd);

    if (startDate > endDate) {
      throw new ScrollyError(
        actionTextIfError,
        "Timeline Start Date must be before Timeline End Date",
        "Choose a start date that is earlier than or equal to the end date",
      );
    }
  }
}

export function isNumber(value) {
  // Check for empty strings or whitespace
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  // check for null or undefined or non-numeric values
  if (
    value == null ||
    value == undefined ||
    Array.isArray(value || typeof value === "object")
  ) {
    return false;
  }

  // Convert to number and check if it's a finite number
  const num = Number(value);
  return !isNaN(num) && Number.isFinite(num);
}

export function doesValueExist(value) {
  return value != null && value != "";
}

export function isValidDate(value) {
  if (!doesValueExist(value)) {
    return false;
  }

  const date = new Date(value);
  return !isNaN(date.getTime());
}

function stripPercentageCharIfExists(str) {
  if (typeof str !== "string") {
    return str;
  }
  return str.endsWith("%") ? str.slice(0, -1) : str;
}

export class StepData {
  constructor(
    contentType,
    filePath,
    altText,
    latitude,
    longitude,
    zoomLevel,
    imageOrientation,
    textHorizontalPercentage,
    text,
  ) {
    this.contentType = DOMPurify.sanitize(contentType);
    this.filePath = DOMPurify.sanitize(filePath);
    this.altText = DOMPurify.sanitize(altText);
    this.latitude = DOMPurify.sanitize(latitude);
    this.longitude = DOMPurify.sanitize(longitude);
    this.zoomLevel = DOMPurify.sanitize(zoomLevel);
    this.imageOrientation = DOMPurify.sanitize(imageOrientation);
    // don't sanitize numeric values as that will make "0" become ""
    this.textHorizontalPercentage = stripPercentageCharIfExists(
      textHorizontalPercentage,
    );

    this.text = DOMPurify.sanitize(text);
  }

  validate(actionTextIfError) {
    this.validateContentType(actionTextIfError);

    this.validateAltText(actionTextIfError);

    this.validateLatitude(actionTextIfError);
    this.validateLongitude(actionTextIfError);

    this.validateZoomLevel(actionTextIfError);
  }

  validateText(actionTextIfError) {
    if (!doesValueExist(this.text)) {
      throw new ScrollyError(actionTextIfError, "Text is a required field");
    }
  }

  validateContentType(actionTextIfError) {
    const validContentTypes = ["image", "map", "video", "text"];
    if (!validContentTypes.includes(this.contentType)) {
      let invalidContentTypeString = `Invalid contentType: "${this.contentType}"`;
      if (this.contentType === "") {
        invalidContentTypeString = "No Content Type specified";
      }
      throw new ScrollyError(
        actionTextIfError,
        invalidContentTypeString,
        `You must enter a valid value in the Content Type field, one of: ${validContentTypes.join(
          ", ",
        )}`,
      );
    }
  }

  validateAltText(actionTextIfError) {
    if (
      this.contentType !== "text" &&
      (!this.altText || this.altText.length === 0)
    ) {
      throw new ScrollyError(
        actionTextIfError,
        `AltText is a required field`,
        `AltText is needed to explain what an image, video, or map is displaying, for those with visual impairments`,
      );
    }
  }

  validateLatitude(actionTextIfError) {
    if (
      this.contentType === "map" &&
      (!isNumber(this.latitude) ||
        this.latitude < -90.0 ||
        this.latitude > 90.0)
    ) {
      throw new ScrollyError(
        actionTextIfError,
        `Latitude of ${this.latitude} is invalid`,
        'Latitude must be between -90.0 and 90.0 for content type "map"',
      );
    }
  }

  validateLongitude(actionTextIfError) {
    if (
      this.contentType === "map" &&
      (!isNumber(this.longitude) ||
        this.longitude < -180.0 ||
        this.longitude > 180.0)
    ) {
      throw new ScrollyError(
        actionTextIfError,
        `Longitude of ${this.longitude} is invalid`,
        'Longitude must be between -180.0 and 180.0 for content type "map"',
      );
    }
  }

  validateZoomLevel(actionTextIfError) {
    if (
      this.contentType === "map" &&
      (!doesValueExist(this.zoomLevel) || !isNumber(this.zoomLevel))
    ) {
      throw new ScrollyError(
        actionTextIfError,
        `ZoomLevel of "${this.zoomLevel}" is invalid`,
        "ZoomLevel must be a number",
      );
    }
  }
}

export function validateStepDataArray(stepDataArray, actionTextIfError) {
  var step = 1;
  stepDataArray.forEach((stepData) => {
    stepData.validate(
      actionTextIfError + ", step " + step + " (line " + (step + 1) + ")",
    );
    step++;
  });
}

export function stripHtml(html) {
  // create a temporary DOM element and add our
  // html to it, then get the text content, which
  // is the html stripped out
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

export class ScrollyError extends Error {
  constructor(Action, Message, Hint) {
    super(Message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScrollyError);
    }
    // use Error.message for the error message
    this.action = Action;
    this.hint = Hint;
  }
}

export function displayThenThrowError(stepError) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.innerHTML = stepError.message;

  const errorAction = document.getElementById("error-action");
  errorAction.innerHTML = stepError.action;

  const errorHint = document.getElementById("error-hint");
  if (stepError.hint) {
    errorHint.innerHTML = stepError.hint;
    errorHint.style.display = "block";
  } else {
    errorHint.style.display = "none";
  }

  const errorContainer = document.getElementById("error-container");
  errorContainer.style.display = "flex"; // Show the error container

  // Since stepError a subclass of Error, we want to throw it after
  // we display the error in HTML so that the full stack trace is available
  // to the user in the console
  throw stepError;
}

export function isPrintView() {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "print";
}
