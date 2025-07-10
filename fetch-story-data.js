/*
  fetch-story-data.js fetches data from a spreadsheet, currently either an excel spreadsheet on the
  server in /data/StoryData.xlsx, or if that doesn't exist, the Google sheet defined in google-sheet-config.js

  It converts the data to ScrollyData, so the HTML page can be created with the data.
*/

import { ScrollyData, StoryData, StepData, ScrollyError } from "./common.js";
import {
  googleSheetURL,
  googleApiKey,
  extractIDFromGoogleSheetURL,
} from "./google-sheet-config.js";

const excelFilePath = "data/StoryData.xlsx";

const sheetNames = ["Story", "Steps"];
const storyIndex = 0;
const stepsIndex = 1;

export async function fetchScrollyData() {
  let scrollyData = await fetchDataFromServerExcelFile(excelFilePath);

  if (scrollyData) {
    console.log("Fetched data from Excel file on server");
  } else {
    scrollyData = await fetchDataFromGoogleSheet();
    console.log("Fetched data from Google Sheet");
  }

  return scrollyData;
}

// Fetch data from an an excel file on the server
// Return null if the fetch fails (e.g., file not found)
// But throw error if the fetch succeeds and the file is invalid
async function fetchDataFromServerExcelFile(excelFilePath) {
  try {
    const response = await fetch(excelFilePath);
    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    throwErrorIfExcelSheetIsMissingSheetNames(workbook, sheetNames);

    return convertExcelDataToScrollyData(workbook, sheetNames);
  } catch (error) {
    throw new ScrollyError(
      `Loading "${excelFilePath}" file from server`,
      `Error: ${error.message}`
    );
  }
}

export function convertExcelDataToScrollyData(workbook, sheetsArray) {
  const storySheet = workbook.Sheets[sheetsArray[storyIndex]];
  const stepsSheet = workbook.Sheets[sheetsArray[stepsIndex]];

  const excelStoryData = XLSX.utils.sheet_to_json(storySheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });
  const excelStepsData = XLSX.utils.sheet_to_json(stepsSheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  const story = convertSheetDataToStoryData(excelStoryData);
  const steps = convertSheetDataToStepDataArray(excelStepsData);
  return new ScrollyData(story, steps);
}

export function throwErrorIfExcelSheetIsMissingSheetNames(
  workbook,
  expectedSheetNames
) {
  expectedSheetNames.forEach((sheetName) => {
    if (workbook.SheetNames.indexOf(sheetName) === -1) {
      throw new ScrollyError(
        "Processing Excel file " + excelFilePath,
        `Spreadsheet must contain a "${sheetName}" sheet.`
      );
    }
  });
}

/*-------------  Google Sheets Functions --------------*/

function createGoogleSheetsAPIEndpoint() {
  const spreadsheetId = extractIDFromGoogleSheetURL();

  // Ranges parameter is used to specify which sheets (tabs) to fetch data from
  var rangesParameter = "";
  sheetNames.map((sheetName, i) => {
    rangesParameter += `ranges=${sheetName}`;
    if (i < sheetNames.length - 1) {
      rangesParameter += "&";
    }
  });

  return `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesParameter}&key=${googleApiKey}`;
}

async function fetchDataFromGoogleSheet() {
  try {
    const apiEndpoint = createGoogleSheetsAPIEndpoint();

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
  throwErrorIfGoogleSheetIsMissingSheetNames(error, sheetNames);

  if (hasError) {
    let errorMessage = "";
    if (error.code === 404) {
      errorMessage = "Could not find the data file";
    } else {
      errorMessage = error.message;
    }

    throw new ScrollyError(
      "Fetching data from Google Sheet " + googleSheetURL,
      errorMessage
    );
  }
}

function throwErrorIfGoogleSheetIsMissingSheetNames(responseError, sheetNames) {
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
  const storyData = convertSheetDataToStoryData(
    sheetsArray.valueRanges[storyIndex].values
  );
  //console.log(JSON.stringify(storyData));

  const stepDataArray = convertSheetDataToStepDataArray(
    sheetsArray.valueRanges[stepsIndex].values
  );
  return new ScrollyData(storyData, stepDataArray);
}

/*------------ Common Data Conversion Functions --------------*/

function convertSheetDataToStoryData(rows) {
  // There's only one (valid) row of data in the Story sheet, on the 2nd row (first row is header)
  const headers = rows[0];
  const data = rows[1];

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

function convertSheetDataToStepDataArray(rows) {
  const headers = rows.shift();
  const colIndex = {};
  headers.forEach((header, i) => {
    colIndex[header.trim().toLowerCase()] = i;
  });

  const stepDataArray = rows.map((row) => {
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
