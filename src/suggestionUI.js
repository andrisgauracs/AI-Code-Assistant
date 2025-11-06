/**
 * Create and manage the suggestion popup element
 */
export function createSuggestionElement() {
  const element = document.createElement("div");
  element.style.cssText = `
    position: fixed;
    background: rgba(45, 45, 45, 0.95);
    color: #64b5f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    pointer-events: none;
    z-index: 10000;
    display: none;
    max-width: 400px;
    word-wrap: break-word;
    border: 1px solid #404040;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(element);
  return element;
}

/**
 * Show suggestion popup next to cursor
 * @param {string} suggestion - The suggestion text to display
 * @param {HTMLTextAreaElement} textarea - The textarea element
 * @param {HTMLElement} suggestionElement - The suggestion popup element
 */
export function showSuggestion(suggestion, textarea, suggestionElement) {
  if (!suggestion) {
    suggestionElement.style.display = "none";
    return;
  }

  // Get cursor position
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = textarea.value.substring(0, cursorPos);
  const lines = textBeforeCursor.split("\n");
  const currentLine = lines[lines.length - 1];
  const lineNumber = lines.length - 1;

  // Calculate approximate position
  const textarea_rect = textarea.getBoundingClientRect();
  const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
  const charWidth = 8.4; // Average char width for monospace font at 14px

  const left = textarea_rect.left + 15 + currentLine.length * charWidth;
  const top = textarea_rect.top + 15 + lineNumber * lineHeight + lineHeight;

  suggestionElement.textContent = suggestion;
  suggestionElement.style.display = "block";
  suggestionElement.style.left = Math.min(left, window.innerWidth - 420) + "px";
  suggestionElement.style.top = top + "px";
}

/**
 * Hide suggestion popup
 * @param {HTMLElement} suggestionElement - The suggestion popup element
 */
export function hideSuggestion(suggestionElement) {
  suggestionElement.style.display = "none";
}
