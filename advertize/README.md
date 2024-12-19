# Text Animation with Recording

This project showcases an interactive JavaScript script that extracts visible text from a webpage, animates it on a canvas, and records the animation as a video file.

## Features

- Extracts visible text dynamically from any webpage.
- Animates text with smooth transitions (fade-in, display, fade-out).
- Records the animation and saves it as a video file.
- Fully responsive, resizing the canvas dynamically to fit the browser window.
- Allows stopping the animation and recording at any time.

## How to Use

### Option 1: Using as a Standalone Script

1. Clone the repository or copy the script.
2. Include the script in your HTML file:

   ```html
   <script src="text-animation-with-recording.js"></script>
   ```

3. Open the HTML file in a browser.
4. The script will start automatically, displaying the animation.
5. Use the stop button (`X`) to end the animation and download the video.

### Option 2: Running in Browser Developer Tools

1. Copy the script into the browser's developer tools console.
2. Run the script.
3. The animation will start automatically, replacing the current content with a canvas overlay.
4. A stop button (`X`) is available to stop the animation and recording.
5. Once the animation completes or is stopped, a video file (`animation.webm` or another supported format) is automatically downloaded.

## How It Works

1. **Extracting Text:**

   - The script traverses the DOM using a `TreeWalker` to collect all visible text nodes, ignoring hidden or irrelevant elements (e.g., `<script>`, `<style>`, etc.).

2. **Text Splitting:**

   - Sentences are identified and split using a regular expression that handles standard sentence-ending punctuation.

3. **Canvas Rendering:**

   - Text is rendered onto a canvas element with configurable fonts, alignment, and line breaks for readability.

4. **Animation Logic:**

   - Each sentence goes through three phases:
     - Fade-in
     - Display
     - Fade-out

5. **Recording:**
   - The canvas content is captured as a video stream using the `captureStream` method.
   - A `MediaRecorder` instance records the stream and saves it to a file once stopped.

## Running on Any Webpage

You can copy and paste this script into the browser's developer tools console (accessible via `F12` or `Ctrl+Shift+I`) on any webpage to extract and animate its visible text.

## Technical Details

- **Technologies Used:**
  - JavaScript
  - HTML5 Canvas API
  - `TreeWalker` for DOM traversal
  - `MediaRecorder` for video capture
- **Browser Compatibility:**
  - Supports modern browsers with `MediaRecorder` and `captureStream` capabilities (e.g., Chrome, Firefox, Edge).
  - Developed mainly for Safari v.17 or higher and Chrome v.121 or higher.

## Known Limitations

- Complex pages with heavy DOM manipulations or dynamic content may not extract text accurately.
- May not work in older browsers that lack `MediaRecorder` or `captureStream` support.

## License

This project is licensed under the MIT License.

---
