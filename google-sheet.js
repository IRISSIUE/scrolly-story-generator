/*
  google-sheet.js fetches data from a Google Sheet and converts it to ScrollyData,
  so the HTML page can be created with the data.
*/

import { ScrollyData, StoryData, StepData, ScrollyError } from "./common.js";

// The Google Sheet below is a template. You can copy it to your Google Drive and use it to create your own scroll story.
// Use the URL from the browser address bar replacing the one below.
// Note that you must publish this sheet to the web for it to be accessible by the Google Sheets API.
// so it can be read by this app.
// Google Sheet File menu -> Share-> Publish to Web -> Publish Entire Document as Web Page
//     (NOTE: This is the Google Sheet File Menu, not the browser File menu, you may have to expand the
//     Menu bar at the top right up arrow to see the Sheets menus)
// Also, you must Share the sheet so that anyone with a link can access it
//     Share button at top right of sheet -> General Access -> Anyone with the link -> Viewer
const googleSheetURL =
  "https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c";

// An API Key is required to read a google sheet from an application. The one below is for this version
// of the application, you will need to generate your own key if you plan to publish this scrolly story on
// your own standalone site.
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

const spreadsheetId = extractIDFromGoogleSheetURL(googleSheetURL);
function extractIDFromGoogleSheetURL(url) {
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

const excelFilePath = "data/StoryData.xlsx";

export async function fetchScrollyData() {
  let scrollyData = await fetchDataFromServerExcelFile(excelFilePath);

  if (!scrollyData) {
    scrollyData = await fetchDataFromGoogleSheet();
    console.log("Fetched data from Google Sheet");
  } else {
    console.log("Fetched data from Excel file on server");
  }

  return scrollyData;
}

// Look for an excel file on the server from which to read story data
async function fetchDataFromServerExcelFile(excelFilePath) {
  try {
    const response = await fetch(excelFilePath);

    // if File doesn't exist, return null and we'll look for the Google Sheet instead
    if (!response.ok && response.status === 404) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const storySheet = workbook.Sheets["Story"];
    const stepsSheet = workbook.Sheets["Steps"];
    if (!storySheet || !stepsSheet) {
      throw new ScrollyError(
        "Processing Excel file",
        "Excel file must contain both 'Story' and 'Steps' sheets"
      );
    }

    const storyData = XLSX.utils.sheet_to_json(storySheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });
    const stepsData = XLSX.utils.sheet_to_json(stepsSheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    // Create structure similar to Google Sheets API response
    const sheetsArray = {
      valueRanges: [{ values: storyData }, { values: stepsData }],
    };

    return convertGoogleSheetDataToScrollyData(sheetsArray);
  } catch (error) {
    console.error("Error loading Excel file:", error);
    throw new ScrollyError(
      "Loading Excel file from server",
      `Error: ${error.message}`
    );
  }
}

async function fetchDataFromGoogleSheet() {
  try {
    const response = await fetch(apiEndpoint);
    const responseJson = await response.json();

    throwErrorIfGoogleSheetError(!response.ok, responseJson);
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

export function throwErrorIfGoogleSheetError(hasError, responseJson) {
  const error = responseJson.error;

  // Check missing sheet name first so a message specific to that can be
  // thrown before more generic error messages
  throwErrorIfSpreadsheetIsMissingSheetNames(error, sheetNames);

  if (hasError) {
    let errorMessage = error.message;
    if (error.code === 404) {
      errorMessage = "Could not find the data file";
    }
    throw new ScrollyError(
      "Fetching data from Google Sheet " + googleSheetURL,
      errorMessage
    );
  }
}

function throwErrorIfSpreadsheetIsMissingSheetNames(responseError, sheetNames) {
  if (responseError) {
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
