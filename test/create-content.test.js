import { createStoryContentInHtml } from "../create-content.js";
import { StoryData } from "../common.js";

describe("Create Content Test Module", () => {
  describe("createStoryContentInHtml", () => {
    TESTcreateStoryContentInHtml();
  });
});

function TESTcreateStoryContentInHtml() {
  // Create a test container to put the elements that the functions expect
  // and the tests will check that they were changed properly

  const beforeHTML = `
    <title id="browser-title"> </title>
    <main>
      <section id="intro">
        <h1 id="story-title">Scrolly Story</h1>
        <p id="subtitle"></p>
        <p>By <span id="authors"></span></p>
      </section>

        <section id="outro">
        <p id="end-text"></p>
      </section>
    </main>
    `;

  const expectedAfterHtml = `
      <title id="browser-title">Test Title</title>
        <main>
          <section id="intro">
            <h1 id="story-title">Test Title</h1>
            <p id="subtitle">Test Subtitle</p>
            <p>By <span id="authors">Test Author</span></p>
          </section>
          <section id="outro">
            <p id="end-text">Test End Text</p>
          </section>
        </main>
      `;
  let testContainer;
  before(() => {
    // Create a test container
    testContainer = document.createElement("div");
    testContainer.id = "test-container";
    document.body.appendChild(testContainer);

    // Add test HTML structure
    testContainer.innerHTML = beforeHTML;
  });

  // Cleanup after each test
  after(() => {
    testContainer.remove();
  });

  const testStoryData = new StoryData(
    "", // not tested here
    "Test Title",
    "Test Subtitle",
    "Test End Text",
    0, // not tested here
    "Test Author"
  );

  it("create HTML in the right format", () => {
    createStoryContentInHtml(testStoryData);

    const actualHtml = testContainer.innerHTML;

    try {
      expect(actualHtml.replace(/\s+/g, "")).to.equal(
        expectedAfterHtml.replace(/\s+/g, "")
      );
    } catch (error) {
      console.error("Actual HTML:");
      console.log(actualHtml);
      console.error("Expected HTML:");
      console.log(expectedAfterHtml);
      throw error;
    }
  });
}
