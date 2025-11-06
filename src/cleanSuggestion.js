/**
 * Clean suggestion by removing duplicate parts from original code
 * @param {string} suggestion - The AI-generated suggestion
 * @param {string} originalCode - The original code written by the user
 * @returns {string} Cleaned suggestion with duplicates removed
 */
export function cleanSuggestion(suggestion, originalCode) {
  if (!suggestion || !originalCode) {
    return suggestion;
  }

  // Normalize whitespace for better comparison
  const normalizeForComparison = (text) => text.replace(/\s+/g, " ").trim();

  const normalizedOriginal = normalizeForComparison(originalCode);
  const normalizedSuggestion = normalizeForComparison(suggestion);

  // Case 1: Suggestion contains the entire original code
  if (normalizedSuggestion.includes(normalizedOriginal)) {
    const originalIndex = normalizedSuggestion.indexOf(normalizedOriginal);

    if (originalIndex === 0) {
      // Original code is at the start of suggestion, extract what comes after
      const afterOriginal = normalizedSuggestion
        .substring(normalizedOriginal.length)
        .trim();

      if (afterOriginal.length > 0) {
        // Try to preserve original formatting by finding the new content in the original suggestion
        const originalCodeEnd = suggestion
          .toLowerCase()
          .indexOf(afterOriginal.toLowerCase());
        if (originalCodeEnd !== -1) {
          return suggestion.substring(originalCodeEnd);
        }
        return afterOriginal;
      }
    }
  }

  // Case 2: Handle line-by-line completion (incomplete lines)
  const originalLines = originalCode.split("\n");
  const suggestionLines = suggestion.split("\n");

  const lastOriginalLine = originalLines[originalLines.length - 1].trim();

  if (suggestionLines.length > 0 && lastOriginalLine.length > 0) {
    const firstSuggestionLine = suggestionLines[0].trim();

    // If the first suggestion line contains and extends the last original line
    if (
      firstSuggestionLine.includes(lastOriginalLine) &&
      firstSuggestionLine.length > lastOriginalLine.length
    ) {
      const completionPart = firstSuggestionLine
        .substring(
          firstSuggestionLine.indexOf(lastOriginalLine) +
            lastOriginalLine.length
        )
        .trim();

      if (completionPart.length > 0) {
        const remainingLines = suggestionLines.slice(1);
        if (remainingLines.length > 0) {
          return completionPart + "\n" + remainingLines.join("\n");
        } else {
          return completionPart;
        }
      }
    }

    // Case 2b: Handle partial word completion
    // If last original line is a prefix of the first suggestion line's last word
    if (firstSuggestionLine.startsWith(lastOriginalLine) && 
        firstSuggestionLine.length > lastOriginalLine.length) {
      // Extract what comes after the last original line
      const completionPart = firstSuggestionLine.substring(lastOriginalLine.length);

      if (completionPart.length > 0) {
        const remainingLines = suggestionLines.slice(1);
        if (remainingLines.length > 0) {
          return completionPart + "\n" + remainingLines.join("\n");
        } else {
          return completionPart;
        }
      }
    }
  }

  // Case 3: Remove duplicate lines from the beginning
  const originalLinesNormalized = originalLines
    .map((line) => line.trim())
    .filter((line) => line);
  const suggestionLinesNormalized = suggestionLines
    .map((line) => line.trim())
    .filter((line) => line);

  // Find how many lines at the start of suggestion match the end of original
  let linesToRemove = 0;
  const maxLinesToCheck = Math.min(
    originalLinesNormalized.length,
    suggestionLinesNormalized.length
  );

  for (let i = 0; i < maxLinesToCheck; i++) {
    const originalLineFromEnd =
      originalLinesNormalized[originalLinesNormalized.length - 1 - i];
    const suggestionLineFromStart = suggestionLinesNormalized[i];

    if (originalLineFromEnd === suggestionLineFromStart) {
      linesToRemove = i + 1;
    } else {
      break;
    }
  }

  // Remove the duplicate lines and return the cleaned suggestion
  if (linesToRemove > 0) {
    const cleanedSuggestionLines = suggestionLines.slice(linesToRemove);
    if (cleanedSuggestionLines.length > 0) {
      return cleanedSuggestionLines.join("\n");
    }
  }

  // If no cleaning was needed or possible, return original
  return suggestion;
}

/**
 * Extract code from markdown-formatted response
 * @param {string} response - Raw response from the model
 * @returns {string} Extracted and cleaned code
 */
export function extractCodeFromResponse(response) {
  const codeMatch = response.match(/```(?:javascript)?\n?(.*?)\n?```/s) ||
    response.match(/`([^`]+)`/) || [null, response.trim()];

  let rawSuggestion = codeMatch[1]?.trim() || response.trim();

  // Remove any remaining markdown formatting
  rawSuggestion = rawSuggestion
    .replace(/^```(?:javascript|js)?\n?/gm, "") // Remove opening code blocks
    .replace(/\n?```$/gm, "") // Remove closing code blocks
    .replace(/^`+/, "") // Remove leading backticks
    .replace(/`+$/, "") // Remove trailing backticks
    .trim();

  return rawSuggestion;
}
