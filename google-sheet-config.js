/*
  google-sheet-config.js contains configuration for the Google Sheet used to create the scrolly story.
*/

// The Google Sheet below is a template. You can copy it to your Google Drive and use it to create your own scroll story.
// You must publish your version of the sheet to the web for it to be accessible by the Google Sheets API
// so it can be read by this app.
// Google Sheet File menu -> Share-> Publish to Web -> Publish Entire Document as Web Page
//     (NOTE: This is the Google Sheet File Menu, not the browser File menu, you may have to expand the
//     Menu bar at the top right up arrow to see the Sheets menus)
// Also, you must Share the sheet so that anyone with a link can access it
//     Share button at top right of sheet -> General Access -> Anyone with the link -> Viewer
// prettier-ignore
export const googleSheetURL = "https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c";

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
export const googleApiKey = "AIzaSyDY8bg45rGLpL4UsIKsDWh0bVec6wueFHs";

export function extractIDFromGoogleSheetURL() {
  try {
    return googleSheetURL.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
  } catch (error) {
    return "InvalidGoogleSheetURL";
  }
}
