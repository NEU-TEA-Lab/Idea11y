import { StickyNote } from "@mirohq/websdk-types";
import { parseNoteText } from "../utils/parser";
import { useNoteMetadata } from './useNoteMetadata';
import { useMetadata } from '../contexts/MetadataContext';

export const useBoardActions = () => {
  const { updateMetadata } = useNoteMetadata();
  const { fetchMetadata } = useMetadata();

  const handleRemoveFromBoard = async (itemId: string) => {
    try {
      const boardItem = await miro.board.getById(itemId);
      if (boardItem) {
        await miro.board.remove(boardItem);
        await boardItem.sync();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleEditOnBoard = async (itemId: string, content: string) => {
    try {
      const boardItem = await miro.board.getById(itemId);
      const possibleColor = parseNoteText(content);
      const originalContent = content.split("/")[0];
      console.log("originalContent", originalContent, content);
    
      if (boardItem) {
        boardItem.content = originalContent;  
        if (possibleColor.color) {
          boardItem.style.fillColor = possibleColor.color;
          // Add metadata update
          await updateMetadata(itemId, {
            color: possibleColor.color
          });
          console.log("updated metadata", possibleColor.color);
          // Trigger metadata refresh
          await fetchMetadata(itemId);
        }
        await boardItem.sync();
      }
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const handleFocusOnBoard = async (itemId: string) => {
    try {
      const boardItem = await miro.board.getById(itemId);
      if (boardItem) {
        await miro.board.select({id: itemId});
      }
    } catch (error) {
      console.error("Error zooming to item:", error);
    }
  };

  return {
    handleRemoveFromBoard,
    handleEditOnBoard,
    handleFocusOnBoard
  };
};
