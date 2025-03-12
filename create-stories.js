import { mkdirSync, writeFile, existsSync } from "node:fs";

export function createStory(storyId) {
  // get story data from Google
  // Copy template files to story folder
  // update template files with story data to create story

  copyTemplateFilesToStoryFolder(storyId);
}

function copyTemplateFilesToStoryFolder(storyId) {
  createStoryFolderIfNotExists(storyId);
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

function createStoryFolderIfNotExists(storyId) {
  const storyDir = `./stories/${storyId}`;
  if (!fs.existsSync(storyDir)) {
    fs.mkdirSync(storyDir);
  }
}
