## Jump To

- [Using the Scrolly Story Generator](#using-the-scrolly-story-generator)
- [What you need to get started](#what-you-need-to-get-started)
- [Step by step set-up guide](#step-by-step-set-up-guide)
- [Editing guide](#editing-guide)
- [Classroom considerations](#classroom-considerations)
- [Credits](#credits)

# Scrolly Story Generator

This project allows you to create a scrollytelling story using data from a spreadsheet.

A scrollytelling story scrolls text down a web page while other content (such as images, maps, or videos), remain "sticky" and stay in the same position on the page. The sticky content changes as the user scrolls, to illustrate the current step in the story being told.

This project contains a sample [Scrolly Story](https://irissiue.github.io/scrolly-story-generator/) that you can use as a starting point to create your own.

This project was designed for classroom use, but it's useful for any number of applications. Below, you'll find instructions for setting up the story, as well as some specific considerations for using it with students. You might also find our [student tutorial](https://www.github.com/IRISSIUE/scrollytelling-tutorial) helpful, both as an in-class resource and as an in-depth guide to creating a story.

## Using the Scrolly Story Generator

**Why scrollytelling?** Scrollytelling is a form of interactive storytelling that pairs text with media. As you scroll through the narrative, the media automatically transforms. Media might include video, images, and clickable maps. The key to good scrollytelling is to think about how your text and media enhance one another. The media isn’t just illustrating the text – it's adding meaning that the text can’t convey effectively or completely on its own. Scrollytelling is a useful tool for teaching multimodal writing, place-based storytelling, community-engaged scholarship, and more.

### What you need to get started

1. **A GitHub account:** GitHub is a place to store and host code and to provide customizable code templates. For our purposes here, it means that you can copy this project and, with a couple small tweaks, have a story up and running. Your interaction with the code is minimal (truly!), and the students only need to interact with a spreadsheet.
2. **A Google account:** You or your students will need to copy the Google Sheet. I recommend keeping all the student spreadsheets in a centralized location so that they don't accidentally get deleted and so that you can control permissions.

That's it!

### Step by step set-up guide

Each scrolly story is contained in its own repository. Repeat these steps for as many stories as you intend to have your students create.

#### 1. Create the GitHub repository.

Click the "Use this Template" button in the top right corner of this page and select "Create a new repository." Give it a **name** when prompted. This should include only letters, numbers, underscores, and dashes. The **description** is optional, and you can change it later if you want. The repository will need to be **public** for the story to work.

#### 2. Create the Google Sheet.

1. Make a copy of this [Google Sheet](https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c/copy).
2. Give it at least a placeholder title so that you can distinguish it from the other stories you'll create.
3. Publish it to the web: Go to File > Share > Publish to the Web. You can leave the default settings (Entire document, web page) as they are. Click the green Publish button when prompted.
4. Share it so that anyone with the link can view the document.
5. Copy the link in the browser bar to be used in the next step. (Important: do not use the Share link or the Publish link!)

#### 3. Update the repository.

1. In your GitHub repository, find the file `google-sheet-config.js` in the list of files for the project and click on it. You should see the contents of the file.
2. Click the down arrow icon in the top right of the file contents and choose _Edit in place_.
3. In the line under `const googleSheetURL = `, replace the URL between the quotes with your Google Sheet URL. (Two warnings: 1. Be sure not to remove the quotes or the semicolon at the end, and 2. Delete the existing URL before pasting yours in, rather than pasting over the highlighted URL. Otherwise GitHub will try to hyperlink the highlighted text with your new URL instead of replacing it.)
4. Press the green _Commit Changes_ button at the top right.

#### 4. Publish your story using GitHub Pages.

Pages is GitHub's built-in hosting tool. When you turn the Pages setting on, GitHub will create a website using the code in the repository. You can and should do this at the outset, rather than after you've finished your website. It will update automatically as your spreadsheet changes, and it's a good way to preview your content and make sure you don't have formatting errors before you're in too deep.

1. In your new repository, click on the _Settings_ tab/button beneath the search bar.
2. Click on the _Pages_ link under "Code and Automation" on the left sidebar.
3. Under "Build and Deployment" change _Branch_ from _None_ to _Main_, and keep the default / (root) setting, then press _Save_.
4. This will publish your site, but it will take a few minutes to complete. Get a cup of coffee, then come back, refresh the browser, and the website URL of your story is displayed at the top of the page. It will be of the form `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`.
5. Go to your new website and verify it matches the example provided by this repository.

### Editing guide

At this point, your set-up is done and you're ready to add your content! Your live story will update as you edit your spreadsheet. You can find a complete guide to creating your scrolly story over in the [student tutorial](https://www.github.com/IRISSIUE/scrollytelling-tutorial), but here are the basics. Your sheet has two tabs: Story, for metadata like title and author, and Steps, for granular story content.

#### Story

| Column                      | Description                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ScrollType               | Ignore this -- this is a setting that's still in development.                                                                                      |
| Title                    | Your primary title is styled as a large heading                                                                                                    |
| Subtitle                 | Your subtitle is styled as paragraph text.                                                                                                         |
| EndText                  | This appears at the end of your story and is optional. By default, it's set as a Creative Commons license.                                         |
| TextHorizontalPercentage | This allows you to customize how much of the page your text takes up in steps with media. The default is 33%, and the recommended range is 30-50%. |
| Authors                  | This appears below your subtitle. It's styled as paragraph text and preceded by "By" in the live story.  | 
| BackgroundColor          | The background color to apply to the entire documents. See below for valid color values  |
| ScrollBoxBackgroundColor | The background color to apply to the scrolling text box. See below for valid color values  |
| ScrollBoxTextColor       | The color to apply to the text of the scrolling text box. See below for valid color values  |

##### Colors
Colors can be specified using one of the following formats:
1. A color name in english. There are 16 basic color names: aqua, black, blue, fuchsia, gray, green, lime, maroon, navy, olive, purple, red, silver, teal, white, and yellow, plus many other additional named colors, available at https://www.w3schools.com/cssref/css_colors.php
2. A Hexdecimal value for a color, of the format "#RRGGBB", where each RR, GG, and BB value is between 00 and FF, corresponding to how much of that color (Red, Green, Blue) makes up the desired color. So "#0000FF" is blue because the blue component is at its highest value and the others are set to 0.
3. An RGB value of the format "rgb(red-value, green-value, blue-value)", where each value is a number between 1 and 255.  So "rgb(0, 0, 255) is blue. 

The named colors are not usually very pleasing to the eye, so it's recommended to use a color picker to find good colors with exact RGB values and use the Hexidecimal or RGB formats to specify a color. There are many color pickers on the web, such as https://www.w3schools.com/colors/colors_picker.asp.


#### Steps

Select your media type in Column A, _ContentType_. For the next few columns, there are some small differences in the information you need depending on step type.

| Media Type |  FilePath                                                             |  AltText                                                                           |  Latitude/Longitude                                                                                                                                                                                           | ZoomLevel                                                                                                                                                                                                                                                                                       | ImageOrientation  |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Maps       | Leave blank                                                             | Describe what's visible on your map and what purpose it's serving in your narrative. | Add the coordinates for the center of your map. Make sure that you separate the coordinates into the two columns and delete the comma between them. Latitude is the first number, and longitude is the second number. | Choose how far in you want to zoom on the map. Zoom levels range from 0 to 18, and the higher the number, the more zoomed in you’ll be. For maps, a zoom level of 4 or 5 will show a whole region of the country. A zoom level of 13 or 14 will show detail at the level of streets and buildings. | Leave Blank |
| Images     | Paste the URL to your image. (See below for details on hosting images.) | Describe the image and what purpose it's serving in your narrative.                  | Leave blank                                                                                                                                                                                                           | Choose how far in you want to zoom on the image. Images don't need as high a zoom level as maps, and your image will get grainy if you zoom in too far. Choose a zoom level of 1 if you just want it to display as is.                                                                             |  Select "Vertical" or "Horizontal" (default is "Horizontal" so don't need to specify for the default). If your image is more vertical than horizontal, choosing "Vertical" will ensure that more of the vertical space of the image will be displayed  |
| Videos     | Paste the URL to your video. (See below for details on hosting videos.) | Describe the video and what purpose it's serving in your narrative.                  | Leave blank                                                                                                                                                                                                           | Leave blank                                                                                                                                                                                                                                                                                        | Leave Blank |
| Text       | Leave blank                                                             | Leave blank                                                                          | Leave blank                                                                                                                                                                                                           | Leave blank                                                                                                                                                                                                                                                                                        | Leave Blank |

All of your steps will require text. For maps, images, and videos, the text will display to the left of the media item. For the text content type, the text will take up the full width of the page.

Text can be formatted using HTML. The simplest way is to use this [HTML editor](https://wysiwyghtml.com/) to format your text and generate the correct HTML. Format your content using the editor on the left side, and you'll see your HTML appear on the right side. Before you copy it over, press the "Compress HTML" button at the bottom of the HTML window. This ensures that there are no line breaks that will mess up the spreadsheet.

**Hosting images:** Images can be hosted in your GitHub repository by uploading them to the **media** folder. If you go this route, your _FilePath_ will be ./media/YOUR-FILE-NAME.jpg. If you don't want to go this route, you can link to images from anywhere on the web. However, be aware that using links that you don't control means that the project is vulnerable to link rot -- if the image you referenced is deleted or moves, it will be replaced with an empty grey box in the story.

**Hosting videos:** Videos can also be hosted on GitHub in the same way, but you may run into file size issues. You can also link from services like YouTube and Vimeo. Make sure that you copy the URL from the _embed code_ rather than from the browser bar or share link.

#### Troubleshooting errors

Sometimes things get a little messy in the spreadsheet, and that generates errors with the tool. Most of the time, the tool will tell you what the problem is. Here are a couple common messages you might see and how to address them.

- AltText: AltText is a required field, because it helps make your stories more accessible. Your story won't load if you don't have alt text for each media item.
- Invalid contentType: Make sure your content type is one of the four drop-down options: map, image, text, or video.

Occasionally, the story might load, but a specific piece of media might not. Here are a couple ways to troubleshoot media errors:

- Maps: If your map box appears as an empty grey box, there's probably a problem with your coordinates. Make sure that you don't have a lingering comma in the latitude box.
- Videos: If your video has a little sad face icon, you probably have the wrong link in there. Make sure to copy the link out of the embed code, not the one from the browser or from the initial Share window.

### Classroom considerations

#### Public scholarship and privacy

For any public-facing student work, there are a few considerations to make sure you're complying with privacy regulations. [Public-facing work isn't inherently a violation of FERPA](https://digitalpedagogy.hcommons.org/introduction/but-ferpa/), but students should still have some agency in whether and how they're presenting themselves online.

1. **Students should have a say in how or whether they identify themselves.** That definitely includes preferred names, but it might also include pennames, usernames, or collective attribution (for instance to a class rather than to individually named students).
2. **Students should have the right to be forgotten.** After a class is over, students should be able to request that their work be anonymized or removed. There shouldn't be a requirement that their work is available in perpetuity.
3. **Student work should have a clear license on it.** Our default is a Creative Commons CC-BY-ND license, which requires that if it's reused, it must be attributed to its original author and no derivative works may be created. You (or your students) might prefer a more restrictive license. By default, the CC-BY-ND license appears in the EndText column in the Story tab.
4. **Student work should be contextualized.** The work that students do in middle school, high school, or college may or may not reflect the character and caliber of work that they do later on. That doesn't mean it's less valuable or that it's unworthy of being shared! But student work should make clear the context in which it was produced.
5. **Student work should never be publicly graded or evaluated.** That's a clear FERPA line. Student work can be shared, with their knowledge and consent, but instructor assessments of it cannot.

#### Mobile responsiveness

Many students -- and indeed, many public audiences -- access the internet primarily on their phones or tablets. This project is moderately responsive (that is, it adjusts its appearance based on screen size), although it's best viewed on a computer screen. On a phone, the text box should narrow so that text and content are both visible, and the interactive scrolling is fully functional. Rotating the phone screen will provide a better experience.

Because the story is created in Google Sheets, students can contribute via a smartphone, although the Google Sheets editing interface in the phone app can be a little bit challenging. Some students are adept at editing on their phones, and others will get frustrated. A possible workaround (with some solid pedagogy behind it) is to have students storyboard on paper and either delegate a group member to input the steps or take turns with any available computers. Much of the creative work of scrollytelling can (and maybe should) happen offline first.

### Classroom resources

Here are some resources you might find helpful in the classroom (or for your own purposes!):

- [Student scrollytelling tutorial](https://www.github.com/IRISSIUE/scrollytelling-tutorial)
- [Finding media licensed for reuse](https://iris.siue.edu/public-domain-and-open-access-media/)
- [Storyboarding guide (by Jessica DeSpain)](https://iris.siue.edu/codes/storyboarding/)

# Credits

This project was developed by Dan Schreiber in Southern Illinois University Edwardsville's IRIS Center for Digital Humanities and Social Sciences, on behalf of the Community-Oriented Digital Engagement Scholars (CODES) program. CODES is generously funded by a grant from the Mellon Foundation.

This project builds from the ["Leaflet Storymaps with Google Sheets"](https://www.github.com/HandsOnDataViz/leaflet-storymaps-with-google-sheets) model developed by Jack Dougherty and Ilia Ilyankou in [_Hands-On Data Visualization: Interactive Storytelling from Spreadsheets to Code_](www.handsondataviz.org) (O'Reilly, last updated 22 Dec. 2024).

This project also uses the following libraries and tools:

- Scrollama: A library for creating scrollytelling experiences.

  - Website: [Scrollama](https://github.com/russellsamora/scrollama)
  - License: MIT

- Intersection Observer: A polyfill for the Intersection Observer API.

  - Website: [Intersection Observer](https://github.com/w3c/IntersectionObserver)
  - License: W3C

- Leaflet: An open-source JavaScript library for interactive maps.

  - Website: [Leaflet](https://leafletjs.com/)
  - License: BSD-2-Clause

- PapaParse: A powerful CSV parser for JavaScript.

  - Website: [PapaParse](https://www.papaparse.com/)
  - License: MIT

- DOMPurify: A DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML, and SVG.

  - Website: [DOMPurify](https://github.com/cure53/DOMPurify)
  - License: Apache-2.0
