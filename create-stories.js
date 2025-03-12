import { fetchStoryDataFromAllGoogleSheets } from "./google-sheet.js";
import { displayThenThrowError } from "./common.js";

document.addEventListener("DOMContentLoaded", async function () {
  createStoryIndex();
});

async function createStoryIndex() {
  try {
    const indexContainer = document.getElementById("story-index-container");
    const allStoryData = await fetchStoryDataFromAllGoogleSheets();

    console.log("allStoryData: ", allStoryData);

    const storyIndexHTML = allStoryData
      .map(
        (story) => `
        <p>
        <button id="story${story.id}" 
                data-story-id="${convertStoryTitleToID(story.title)}">
            Generate ${story.title}
        </button>
        </p>
    `
      )
      .join("");

    indexContainer.innerHTML = storyIndexHTML;
  } catch (scrollyError) {
    displayThenThrowError(scrollyError);
  }
}

function convertStoryTitleToID(title) {
  return title.replace(/\s+/g, "-").toLowerCase();
}

function createStory(storyId) {
  const storyData = {
    title: "My Story " + storyId,
    // ...existing code...
  };

  // Create directory if it doesn't exist
  const storiesDir = "./stories";
  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir);
  }

  // Create story-specific directory
  const storyDir = `${storiesDir}/${storyData.title.replace(/\s+/g, "-")}`;
  if (!fs.existsSync(storyDir)) {
    fs.mkdirSync(storyDir);
  }

  // Create files
  createStoryFiles(storyDir, storyData);
}

function createStoryFiles(storyDir, storyData) {
  // Create main HTML file
  const htmlContent = generateHTMLContent(storyData);
  fs.writeFileSync(`${storyDir}/index.html`, htmlContent);

  // Create CSS file
  const cssContent = generateCSSContent();
  fs.writeFileSync(`${storyDir}/style.css`, cssContent);

  // Create JS file
  const jsContent = generateJSContent();
  fs.writeFileSync(`${storyDir}/story.js`, jsContent);

  // Create assets directory
  const assetsDir = `${storyDir}/assets`;
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
}
