export function createStory(storyId) {
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
