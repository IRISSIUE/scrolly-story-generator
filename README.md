# Scrolly Story Generator

This project allows you to create a scrollytelling story using data from a spreadsheet.

A scrollytelling story scrolls text down a web page while other content (such as images, maps, or videos), remain "sticky" and stay in the same position on the page. The sticky content changes as the user scrolls, to illustrate the current step in the story being told.

This project contains a sample [Scrolly Story](https://irissiue.github.io/scrolly-story-generator/) that you can use as a starting point to create your own.

# How to Create Your Own Scrolly Story

Scrolly Stories can be created from a [Google Sheet](https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c) linked to your project (and eventually, from a CSV file uploaded to GitHub). Editing the google sheet allows you to refresh the web page and see your changes right away.

## Overview

The main steps

1. Copy this template GitHub repository to your own account
2. Setup a GitHub Page for your repository to host your story
3. Copy the example Google Sheet to your Google Drive
4. Link your Google Sheet to your repository
5. Develop your story by editing the Google Sheet
6. Upload any images, videos, or audio you use in the story into your GitHub repository
7. After you've created your story and want to share it widely, you'll need to generate your own Google Sheet API key

### Detailed Steps

#### Copy GitHub Repository

1. Sign into GitHub using your account credentials
2. Open [this GitHub repository](https://github.com/irissiue/scrolly-story-generator) in a new tab
3. In the upper right corner, click _Use this template_ the "Create a new repository"
4. Create a repository name and description specific to your story and press the green _Create Repository_ button at the bottom right

Your new repository will have a URL like `https://github.com/YOUR_GITHUB_NAME/YOUR_REPOSITORY_NAME`

#### Create a GitHub Pages website to host your story

GitHub Pages is a free service that allows you to publish a website directly from a GitHub repository. Your scrollytelling story will be published and accessible on this site.

1. In your new repository, click on the _Settings_ tab/button beneath the search bar
2. Click on the _Pages_ link under "Code and Automation" on the left sidebar
3. Under "Build and Deployment" change _Source_ from _None_ to _Main_, and keep the default / (root) setting, then press _Save_
4. This will publish your site, but it will take a few minutes to complete. Get a cup of coffee, then come back, refresh the browser, and the website URL of your story is displayed at the top of the page. It will be of the form `https://YOUR_GITHUB_NAME.github.io/YOUR_REPOSITORY_NAME/`
5. Go to your new website and verify it matches the example provided by this repository

#### Copy the example Google Sheet

1. Open the [template Google Sheet](https://docs.google.com/spreadsheets/d/17sHlHcOilG9UmRju8YDGx4bRMIDpQ5Bpfzc0QI-Np6c) in a new tab
2. Sign into your Google account and select _File -> Make a Copy_ to save a version of the template to your Google Drive
3. Click the blue _Share_ button and then _Change to anyone with the link_, then _Done_.
4. Go to _File -> Publish to the Web_ , then the green _Publish_ button. Publicly sharing the link is needed for the app to read the spreadsheet. You can close this dialog via the upper right _X_ symbol.

#### Link your Google Sheet to your repository

You need your repository to read your version of the Google Sheet, so that changes you make in your Google Sheet are displayed in your story.

1. At the top of your browser, copy your Google Sheet URL address (it will end in _/edit#gid=0_). Don't copy the URL from the _Published to the web_ address, which will not work with this project.
2. In your GitHub Repository, find the file `google-sheet.js` in the list of files for the project.
3. Click on `google-sheet.js` and it will show the contents of the file.
4. Click the pencil icon in the top right of the file contents and choose _Edit in place_.
5. In the line under `const googleSheetURL = `, replace the URL between the single quotes with your Google Sheet URL. Be sure not to remove the single quotes or the semicolon at the end.
6. Press the green _Commit Changes_ button at the top right

Now you can begin editing your Google Sheet to create your story. After you make an edit, refresh the browser on Pages URL and your changes should appear in your story

# Editing the Google Sheet to Create Your Story

The spreadsheet contains all the data that you'll use to create your scrollytelly story. Updating the data in the Google Sheet will automatically update your Pages site (after you've set it up, above).

The data available to you is broken down into separate tabs of the spreadsheet

## Story Tab

This contains all the data you can change about the story as a whole. It is a single line of content (below the header line), and includes the following:

- **ScrollType** -- The type of ScrollyStory
  - left-side - the scroll text is displayed on the left and the sticky images are on the right
  - center-overlap (Not yet available) - the text scroll ups the center on top of the sticky content, which fills the full width of the screen.
- **Title** - the title of the page, displayed as Header (H1) at the top of the page
- **Subtitle** - an optional subtitle, displayed below the title
- **EndText** - text that can go at the end of page, after the scrolly content has ended, if you to wrap up the story.
- **TextHorizontalPercentage** - determines how wide the text box is compared to the media in your story. The value here is the percentage of the width the text should have, so a value of 33 will give the text 1/3 of the width and the media 2/3 of the width.
- **Authors** - optionally displays the author(s) of the page below the subtitle

All of the fields that display text can have HTML tags with inline CSS styles within them, and the code will display it, as long as it doesn't conflict with an existing CSS style.

## Steps Tab

This contains the data for each step in the story. Each block of text that scrolls up the page is considered a "step".

Each row in this tab is one step, displayed in the order it appears in the tab.

Values are:

- **ContentType** - The kind of sticky content displayed to the right
  - Image
  - Map
  - Video
  - Text
- **FilePath** - The path to the image, video, or audio file being used in the step, either relative to the GitHub project, or a URL to external media. Note that for videos from services like youtube or vimeo, you have to use the URL from the embed code, not the brower's URL.
  - Example: ./media/my-image.jpg
  - Example: http://www.siue.edu/some_image.jpeg
  - Example: https://www.youtube.com/embed/zp488Cfivm4?si=OCq0xL0Fd9s96irZ
  - Example: https://player.vimeo.com/video/851328188
  - Example: ./media/my-video.mp4
- **AltText** - Alternate text to help those vision loss to understand what is being displayed for this step
  - Example: Map of Edwardsville, Illinois
  - Example: President Abraham Lincoln (for an image of Lincoln, where his being president is relevant to the text)
- **Latitude** - Used for Map content, to specify the Latitude of the center of the map
  - A floating point number between -90.0 and 90.0
- **Longitude** - Used for Map content, to specify the Longitue of the center of the map
  - A floating point number between -180.0 and 180.0
- **ZoomLevel** - Zoom levels allow you to change the size of what's viewable in the window, which functionally works as the ability to zoom in or out of a map or image.
  - Maps have valid ZoomLevels between 0 (the whole world) and 18 (max zoom)
  - Image ZoomLevels
    - the default 1, so specifying 1 doesn't change the zoom
    - Positive numbers scale the image up or down (zoom in or out)
      - Numbers between 0 and 1 scale an image down, which zooms it out. A value of 0.5 makes the image half as big, and 0 will make the image disappear as it scales the image down to 0 size.
      - Numbers above 1 scale the image up that many times. A value 2 will make the image twice ts original size, which zooms in.
      - Negative numbers flip the element as well as scale it. A value of -1.5 will flip the image horizontally and zoom in by a factor of 1.5
- **Text** - The text that scrolls up for this step. HTML and CSS can be included here and th code will display it, as long as it doesn't conflict with an existing CSS style.

# Credits

This project uses the following libraries and tools:

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
