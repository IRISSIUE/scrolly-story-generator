import { fetchStoryDataFromAllGoogleSheets } from "./google-sheet.js";
import { displayThenThrowError } from "./common.js";
import { convertStoryTitleToID } from "./common.js";
import { createStory } from "./create-stories.js";

document.addEventListener("DOMContentLoaded", async function () {
  createStoryIndex();
});

//TODO: Refactor when we add more HTML content to break button creations from listeners from other content creation
async function createStoryIndex() {
  try {
    const indexContainer = document.getElementById("story-index-container");
    const allStoryData = await fetchStoryDataFromAllGoogleSheets();

    console.log("allStoryData: ", allStoryData);

    // TODO: Ensure all story IDs are unique
    const storyIndexHTML = allStoryData
      .map(
        (story) => `
        <p>
        <button class="story-button" id="${convertStoryTitleToID(story.title)}">
            Generate "${story.title}" Story
        </button>
        </p>
    `
      )
      .join("");

    indexContainer.innerHTML = storyIndexHTML;

    createStoryButtonListeners();
  } catch (scrollyError) {
    displayThenThrowError(scrollyError);
  }
}

function createStoryButtonListeners() {
  const buttons = document.querySelectorAll(".story-button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      console.log(`Creating story: ${button.id}`);
      createStory(button.id);
    });
  });
}
