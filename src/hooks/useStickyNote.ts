import { parseNoteText } from "../utils/parser";
import { GroupedItem } from "../components/types";

interface StickyNoteConfig {
  x: number;
  y: number;
  width: number;
}

export const useStickyNote = () => {
  const createStickyNote = async (
    userInputValue: string,
    config: StickyNoteConfig,
    group: GroupedItem,
    undecidedState: boolean
  ) => {
    try {
      console.log("Creating sticky note with content: ", userInputValue);
      const result = parseNoteText(userInputValue);

      const stickyNote = await miro.board.createStickyNote({
        content: result.text,
        x: config.x,
        y: config.y,
        width: config.width,
        style: {
          fillColor: undecidedState ? "pink" : (result.color || "yellow")
        },
      });

      console.log("Sticky note created:", stickyNote);

      group.childrenInfo.push({
        id: stickyNote.id,
        x: config.x,
        y: config.y,
        width: config.width,
        height: stickyNote.height,
      });

      group.content[stickyNote.id] = result.text;

      return stickyNote;
    } catch (error) {
      console.error("Error creating sticky note:", error);
      return null;
    }
  };

  return { createStickyNote };
};
