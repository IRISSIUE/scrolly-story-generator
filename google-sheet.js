/*
  google-sheet.js fetches data from a Google Sheet and converts it to ScrollyData,
  so the HTML page can be created with the data.
*/

import { ScrollyData, StoryData, StepData, ScrollyError } from "./common.js";

// The Google Sheet below is a template. You can copy it to your Google Drive and use it to create your own scroll story.
// Use the URL from the browser address bar replacing the one below.
// Note that you must publish this sheet to the web for it to be accessible by the Google Sheets API.
// Google Sheet File menu -> Share-> Publish to Web -> Publish Entire Document as Web Page
//     (NOTE: This the Google Sheet File Menu, not the browser File menu, you may have to expand the
//     Menu bar at the top right up arrow to see the Sheets menus)
// Also, you must Share the sheet so that anyone with a link can access it
//     Share button at top right of sheet -> General Access -> Anyone with the link -> Viewer
const googleSheetURL =
  "https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c";

// An API Key is required to read a google sheet from an application. It is generated at https://console.developers.google.com
// and if you plan to publish this scrolly story on your own standalone site, you will need to generate your own key.
// To generate your own key:
// 1. Go to https://console.developers.google.com
// 2. Create a new project with unique name (don't need a Parent Organization)
// 3. Enable APIs and Services
// 4. Search for Google Sheets API, click on it and then enable it
// 5. Choose Credentials from the left menu
// 6. Click on Create Credentials at the top menu bar then API Key
// 7. Restrict the key under API restrictions and restrict to Google Sheets API
// 7. Copy the key and replace the one below
const googleApiKey = "AIzaSyDY8bg45rGLpL4UsIKsDWh0bVec6wueFHs";

const sheetNames = ["Story", "Steps"];
const storyIndex = 0;
const stepsIndex = 1;

const spreadsheetId = extractSpreadsheetIDFromURL(googleSheetURL);
function extractSpreadsheetIDFromURL(url) {
  try {
    return url.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
  } catch (error) {
    return "InvalidGoogleSheetURL";
  }
}

const apiEndpoint = createGoogleSheetsAPIEndpoint(spreadsheetId, googleApiKey);
function createGoogleSheetsAPIEndpoint() {
  var rangesParameter = ""; // each range in a google sheet is a sheet (tab) name
  sheetNames.map((sheetName, i) => {
    rangesParameter += `ranges=${sheetName}`;
    if (i < sheetNames.length - 1) {
      rangesParameter += "&";
    }
  });

  return `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesParameter}&key=${googleApiKey}`;
}

// Function to fetch data from Google Sheets
export async function fetchAllDataFromGoogleSheet() {
  try {
    const response = await fetch(apiEndpoint);
    const responseJson = await response.json();
    if (!response.ok) {
      throwErrorFromGoogleSheetResponse(responseJson.error);
    }

    return convertGoogleSheetDataToScrollyData(responseJson);
  } catch (error) {
    // Convert error to ScrollyError if it is not already
    if (!(error instanceof ScrollyError)) {
      error = new ScrollyError(
        "Fetching data from Google Sheet " + googleSheetURL,
        error.toString()
      );
    }
    throw error;
  }
}

function throwErrorFromGoogleSheetResponse(responseError) {
  throwMissingSheetNameErrorIfExists(responseError);

  throw new ScrollyError(
    "Fetching data from Google Sheet " + googleSheetURL,
    responseError.message
  );
}

function throwMissingSheetNameErrorIfExists(responseError) {
  sheetNames.forEach((sheetName) => {
    if (
      responseError.message.includes(sheetName) &&
      responseError.message.includes("Unable to parse range")
    ) {
      throw new ScrollyError(
        "Fetching data from Google Sheet " + googleSheetURL,
        `Sheet name "${sheetName}" not found in the Google Sheet.`
      );
    }
  });
}

function convertGoogleSheetDataToScrollyData(sheetsArray) {
  const storyData = convertGoogleSheetDataToStoryData(
    sheetsArray.valueRanges[storyIndex].values
  );
  //console.log(JSON.stringify(storyData));

  const stepDataArray = convertGoogleSheetDataToStepDataArray(
    sheetsArray.valueRanges[stepsIndex].values
  );
  return new ScrollyData(storyData, stepDataArray);
}

function convertGoogleSheetDataToStoryData(values) {
  // There's only one (valid) row of data in the Story sheet, on the 2nd row (first row is header)
  const headers = values[0];
  const data = values[1];

  // Create a mapping from header name to column index
  const colIndex = {};
  headers.forEach((header, i) => {
    colIndex[header.trim().toLowerCase()] = i;
  });

  // Use header names to extract values
  return new StoryData(
    data[colIndex["scrolltype"]],
    data[colIndex["title"]],
    data[colIndex["subtitle"]],
    data[colIndex["endtext"]],
    data[colIndex["texthorizontalpercentage"]],
    data[colIndex["authors"]],
    data[colIndex["backgroundcolor"]],
    data[colIndex["scrollboxbackgroundcolor"]],
    data[colIndex["scrollboxtextcolor"]],
    data[colIndex["footer"]]
  );
}

function convertGoogleSheetDataToStepDataArray(values) {
  const headers = values.shift();
  const colIndex = {};
  headers.forEach((header, i) => {
    colIndex[header.trim().toLowerCase()] = i;
  });

  const stepDataArray = values.map((row) => {
    return new StepData(
      row[colIndex["contenttype"]],
      row[colIndex["filepath"]],
      row[colIndex["alttext"]],
      row[colIndex["latitude"]],
      row[colIndex["longitude"]],
      row[colIndex["zoomlevel"]],
      row[colIndex["imageorientation"]],
      row[colIndex["text"]]
    );
  });
  return stepDataArray;
}
