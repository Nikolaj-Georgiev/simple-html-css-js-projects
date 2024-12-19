(async () => {
  let animationStopped = false;
  let currentSentenceIndex = 0;
  let fadeStartTime = null;
  let animationPhase = 'fadeIn';
  let mediaRecorder;
  let recordedChunks = [];
  let animationRequestId;
  let stream;
  let mimeType;

  /**
   * Checks if an element is visible in the DOM tree.
   * @param {Element} element - The item being checked.
   * @returns {boolean} - True if the element is visible.
   */
  const isVisible = (element) => {
    if (!(element instanceof Element)) return false;
    const style = window.getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity) === 0
    )
      return false;
    if (style.position === 'absolute' || style.position === 'fixed') {
      const rect = element.getBoundingClientRect();

      if (
        rect.left + rect.width < 0 ||
        rect.top + rect.height < 0 ||
        rect.right > 0 ||
        rect.bottom < 0
      )
        return false;
    }

    return true;
  };

  /**
   * Extracts all visible text from the page, ignoring specific tags.
   * @returns {string} - Concatenated visible text nodes.
   */
  const extractVisibleText = () => {
    const ignoredTags = [
      'SCRIPT',
      'STYLE',
      'NOSCRIPT',
      'META',
      'LINK',
      'IFRAME',
      'TEMPLATE',
    ];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (ignoredTags.includes(node.parentElement.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return isVisible(node.parentElement)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );
    let text = '';
    while (walker.nextNode()) {
      const nodeText = walker.currentNode.textContent.trim();
      if (nodeText) text += `${nodeText} `;
    }
    return text.trim();
  };

  const text = extractVisibleText();

  // Initial sentence split based on regex.
  const regex = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.!?])\s+/;
  let rawSentences = text.split(regex).map((sentence) => sentence.trim());

  /**
   * Adjusts sentence grouping based on standalone or trailing numbers.
   * @param {string[]} sentences - Array of split sentences.
   * @returns {string[]} - Correctly grouped sentences.
   */
  const correctedSentences = (sentences) => {
    let correctedSentences = [];
    let currentSentence = '';

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      if (/^\d\.$/.test(sentence)) {
        currentSentence += ` ${sentence}`;
      } else if (/\d\.$/.test(currentSentence)) {
        const [mainPart, trailingNumber] = currentSentence
          .match(/(.*?)(\d\.$)/)
          .slice(1);
        correctedSentences.push(mainPart.trim());
        currentSentence = `${trailingNumber} ${sentence}`;
      } else {
        if (currentSentence) correctedSentences.push(currentSentence.trim());
        currentSentence = sentence;
      }
    }

    if (currentSentence) correctedSentences.push(currentSentence.trim());
    return correctedSentences;
  };

  let sentences = correctedSentences(rawSentences);

  // Create overlay for animation
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'white';
  overlay.style.zIndex = '1500';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  overlay.appendChild(canvas);

  /**
   * Resizes the canvas to match the current window size.
   */
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.font = '24px Helvetica, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Stop button to end animation and recording
  const stopButton = document.createElement('button');
  stopButton.textContent = 'X';
  stopButton.style.position = 'fixed';
  stopButton.style.top = '10px';
  stopButton.style.right = '10px';
  stopButton.style.zIndex = '1900';
  stopButton.style.backgroundColor = 'black';
  stopButton.style.color = 'white';
  stopButton.style.border = 'none';
  stopButton.style.padding = '5px 10px';
  stopButton.style.cursor = 'pointer';
  stopButton.style.fontSize = '16px';

  stopButton.onmouseenter = () => {
    stopButton.style.backgroundColor = 'white';
    stopButton.style.border = '2px solid black';
    stopButton.style.color = 'black';
  };
  stopButton.onmouseleave = () => {
    stopButton.style.backgroundColor = 'black';
    stopButton.style.border = 'none';
    stopButton.style.color = 'white';
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  stopButton.onclick = () => {
    animationStopped = true;
    overlay.remove();
    window.removeEventListener('resize', resizeCanvas);
    if (animationRequestId) cancelAnimationFrame(animationRequestId);
    stopRecording();
    document.body.style.overflow = '';
  };
  overlay.appendChild(stopButton);

  // Configure video recording
  const mimeMap = new Map([
    ['video/webm; codecs=vp9', 1],
    ['video/webm; codecs=vp8', 2],
    ['video/mp4; codecs=avc1.42E01E', 3],
  ]);
  const getSupportedMimeType = () => {
    for (const [type] of mimeMap) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    // you can add some conditional check and send notification if all of those are not supported.
    return null;
  };
  try {
    stream = canvas.captureStream(60); // 60 FPS
    mimeType = getSupportedMimeType();
    mediaRecorder = new MediaRecorder(stream, { mimeType });
  } catch (e) {
    console.error('Error initializing MediaRecorder:', e);
    return;
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const extension = mimeType.split('/')[1].split(';')[0];
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `animation.${extension}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  mediaRecorder.start();

  /**
   * Splits text into lines and draws it centered on the canvas.
   * @param {CanvasRenderingContext2D} context - Canvas rendering context.
   * @param {string} text - Text to render.
   * @param {number} x - X-coordinate of the text.
   * @param {number} y - Y-coordinate of the text.
   * @param {number} maxWidth - Maximum line width.
   * @param {number} lineHeight - Height of each line.
   */
  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let lines = [];
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = `${line}${words[n]} `;
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = `${words[n]} `;
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    y -= ((lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], x, y + i * lineHeight);
    }
  };

  const animate = () => {
    if (animationStopped) {
      stopRecording();
      document.body.style.overflow = '';

      return;
    }

    let now = Date.now();
    const fadeDuration = 500;
    const sentence = sentences[currentSentenceIndex];
    const displayDuration = Math.max(sentence.length / 20, 1) * 1000;

    if (!fadeStartTime) fadeStartTime = now;
    const elapsed = now - fadeStartTime;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';

    if (animationPhase === 'fadeIn') {
      const progress = Math.min(elapsed / fadeDuration, 1);
      context.globalAlpha = progress;
      if (progress >= 1) {
        animationPhase = 'display';
        fadeStartTime = now;
      }
    } else if (animationPhase === 'display') {
      context.globalAlpha = 1;
      if (elapsed >= displayDuration) {
        animationPhase = 'fadeOut';
        fadeStartTime = now;
      }
    } else if (animationPhase === 'fadeOut') {
      const progress = Math.min(elapsed / fadeDuration, 1);
      context.globalAlpha = 1 - progress;
      if (progress >= 1) {
        currentSentenceIndex++;
        if (currentSentenceIndex >= sentences.length) {
          overlay.remove();
          window.removeEventListener('resize', resizeCanvas);
          stopRecording();
          return;
        }
        animationPhase = 'fadeIn';
        fadeStartTime = now;
      }
    }

    wrapText(
      context,
      sentence,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.8,
      30
    );

    context.globalAlpha = 1;
    animationRequestId = requestAnimationFrame(animate);
  };

  animate();
})();
