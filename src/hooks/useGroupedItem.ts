// hooks/useGroupedItem.ts
import { useState } from 'react';
import { GroupedItem } from '../components/types';
import { useBoardActions } from './useBoardActions';
import { useNotifications } from './useNotifications';
import { StickyNote } from '@mirohq/websdk-types';

interface UseGroupedItemProps {
  group: GroupedItem;
  clusterTitle: string;
  handleCurrentGroup: (
    clusterTitle: string,
    group: GroupedItem,
    userInputValue: string
  ) => Promise<StickyNote | null>;
}

export const useGroupedItem = ({
  group,
  clusterTitle,
  handleCurrentGroup,
}: UseGroupedItemProps) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [localContent, setLocalContent] = useState<Record<string, string>>({});

  const { handleRemoveFromBoard, handleEditOnBoard } = useBoardActions();
  const { notifyUser } = useNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleEditNote = (itemId: string, content: string) => {
    setEditingItemId(itemId);
    const actualContent = content.replace(/<[^>]*>?/g, "");
    setUserInput(actualContent);
  };

  const handleRemoveNote = async (itemId: string) => {
    const updatedContent = { ...localContent };
    const originalContent = updatedContent[itemId];
    delete updatedContent[itemId];
    setLocalContent(updatedContent);

    await handleRemoveFromBoard(itemId);

    await notifyUser({
      action: "The note has been removed",
      content: originalContent
    });
  };

  const handleCreateNote = async (content: string) => {
    console.log('handleCreateNote triggered in ', clusterTitle);
    const stickyNote = await handleCurrentGroup(clusterTitle, group, content);
    if (stickyNote) {
      await notifyUser({
        action: "The note has been submitted",
        content: content
      });
    }
  };

  const handleEditSubmit = async () => {
    if (editingItemId) {
      setLocalContent((prevContent) => ({
        ...prevContent,
        [editingItemId]: userInput
      }));

      await handleEditOnBoard(editingItemId, userInput);
      await notifyUser({
        action: "The note has been submitted",
        content: userInput
      });

      setUserInput("");
      setEditingItemId(null);
    }
  };

  const handleEditCancel = () => {
    setUserInput("");
    setEditingItemId(null);
  };

  return {
    editingItemId,
    userInput,
    localContent,
    handleInputChange,
    handleEditNote,
    handleRemoveNote,
    handleCreateNote,
    handleEditSubmit,
    handleEditCancel
  };
};
