interface NoteParserResult {
  text: string;
  color: string | undefined;
}

/**
 * Valid colors list - can be easily extended
 */
const VALID_COLORS: string[] = [
  "blue",
  "yellow",
  "light_yellow",
  "red",
  "green",
  "orange",
  "light_green",
  "dark_green",
  "cyan",
  "purple",
  "gray"
];

/**
 * Parses a note string to extract the text content and color tag
 * @param {string} input - The input string containing note text and optional color tag
 * @returns {NoteParserResult} Object containing the note text and color name (if specified)
 */
export const parseNoteText = (input: string): NoteParserResult => {
  // Return early if input is empty
  if (!input) {
    return { text: "", color: undefined };
  }

  // Remove extra whitespace and trim
  const cleanInput = input.trim();

  // Match pattern for "/color" at the end of string
  const colorMatch = cleanInput.match(/\s+\/(\w+)$/);

  if (colorMatch) {
    // If color name is found
    const colorName = colorMatch[1].toLowerCase();
    const text = cleanInput.slice(0, colorMatch.index).trim();
    // Only return color if it's in our valid colors list
    const color = VALID_COLORS.includes(colorName) ? colorName : undefined;
    return { text, color };
  } else {
    // If no color specification is found
    return { text: cleanInput, color: undefined };
  }
};
