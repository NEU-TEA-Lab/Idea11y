import { useState } from "react";
import { useBoardActions } from "./useBoardActions";
import { useNotifications } from "./useNotifications";
import { StickyNote } from "@mirohq/websdk-types";
import { GroupedItem } from "../components/types";
import { useCluster } from "../contexts/ClusterContext";
import { useMetadata } from '../contexts/MetadataContext';
import { useBoardSync } from "../hooks/useBoardSync";

interface UseGroupActionsProps {
    clusterTitle: string;
    group: GroupedItem;
    handleCurrentGroup: (
        clusterTitle: string,
        group: GroupedItem,
        userInputValue: string
    ) => Promise<StickyNote | null>;
}

export const useGroupActions = ({
    clusterTitle,
    group,
    handleCurrentGroup,
}: UseGroupActionsProps) => {
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState("");
    const [localContent, setLocalContent] = useState(group.content);
    // Add state to store the selected cluster for an item
    const [selectedNewCluster, setSelectedNewCluster] = useState<string | null>(null);
    const { groupedData } = useCluster();
    const { fetchMetadata } = useMetadata();
    const { fetchData } = useBoardSync();

    const { handleRemoveFromBoard, handleEditOnBoard, handleFocusOnBoard } =
        useBoardActions();
    const { screenReaderMessage } = useNotifications();

    const redirectFocus = (groupTitle: string, waitTime: number) => {
        console.log("redirecting... in redirectFocus");
        // attemp to refocus
        setTimeout(() => {
            const headings = document.querySelectorAll('h4'); // cluster title 
            const targetHeading = Array.from(headings).find(
                heading => heading.textContent === groupTitle
            );
            
            if (targetHeading instanceof HTMLElement) {
                targetHeading.focus();
            }
        }, waitTime); 
    }

    // New function to focus on a specific note
    const focusOnNote = (noteId: string, waitTime: number) => {
        setTimeout(() => {
        // First try to find the note container by data-note-id attribute
        const noteContainer = document.querySelector(`div[data-note-id="${noteId}"]`);
        
        if (noteContainer instanceof HTMLElement) {
            // Try to find the focusable element within this container
            const focusableElement = noteContainer.querySelector('p[tabindex="0"], button.speak-button[tabindex="0"]');
            
            if (focusableElement instanceof HTMLElement) {
            focusableElement.focus();
            console.log(`Found and focused on new note ${noteId}`);
            } else {
            noteContainer.focus();
            console.log(`Focused on note container for ${noteId}`);
            }
        } else {
            // Fallback to cluster title if note can't be found
            const headings = document.querySelectorAll('h4');
            const targetHeading = Array.from(headings).find(
            heading => heading.textContent === group.title
            );
            
            if (targetHeading instanceof HTMLElement) {
            targetHeading.focus();
            console.log(`Could not find note ${noteId}, focused on cluster title instead`);
            }
        }
        }, waitTime);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleEditNote = (itemId: string, content: string) => {
        setEditingItemId(itemId);
        const actualContent = content.replace(/<[^>]*>?/g, "");
        setUserInput(actualContent);
        // Reset selected cluster when starting to edit
        setSelectedNewCluster(null);
    };

    const handleRemoveNote = async (itemId: string) => {
        
        const updatedContent = { ...localContent };
        const originalContent = updatedContent[itemId];
        screenReaderMessage(`"${originalContent}" is removed from ${group.title}`);

        delete updatedContent[itemId];
        setLocalContent(updatedContent);

        // update miro board
        await handleRemoveFromBoard(itemId);   
        redirectFocus(group.title, 4000); // 4 seconds delay
    };

    const handleCreateNote = async (content: string) => {
        const stickyNote = await handleCurrentGroup(clusterTitle, group, content);

        if (stickyNote) {
            const originalContent = userInput.split("/")[0];
            // Update the local content state
            setLocalContent(prevContent => ({
                ...prevContent,
                [stickyNote.id]: originalContent
            }));

            // Manually trigger a data refresh with skip focus restore flag
            await fetchData(true);
            screenReaderMessage(`"${content}" is created in ${group.title}`);

            focusOnNote(stickyNote.id, 6000);
        }    
    };

    const handleEditSubmit = async () => {
        console.log("editingItemId is", editingItemId);
        const originalContent = userInput.split("/")[0];
        
        if (editingItemId) {
            // Update the local content first
            const updatedContent = {
                ...localContent,
                [editingItemId]: originalContent
            };
            setLocalContent(updatedContent);

            // Check if we need to move the note to a different cluster
            if (selectedNewCluster) {
                // User has selected a new cluster, move the note
                await moveNoteToNewCluster(editingItemId, originalContent, selectedNewCluster);
                setSelectedNewCluster(null);
            } else {
                // Just update the note content without moving
                await handleEditOnBoard(editingItemId, userInput);
                
                await fetchData(true);
                screenReaderMessage(`"${originalContent}" is edited in ${group.title}`);

                // Focus back on the edited note
                focusOnNote(editingItemId, 5000);
            }

            setUserInput("");
            setEditingItemId(null);
        }
    };

    const handleEditCancel = () => {
        setUserInput("");
        setEditingItemId(null);
        // Reset selected cluster
        setSelectedNewCluster(null);
    };

    // Modified to just store the selected cluster without applying it
    const handleClusterChange = (itemId: string, newCluster: string) => {
        // Just store the selected cluster, don't apply the change yet
        setSelectedNewCluster(newCluster);
    };

    // New function to handle the actual movement of notes between clusters
    const moveNoteToNewCluster = async (itemId: string, content: string, newCluster: string) => {
        try {
            // Store the content and metadata before removing
            const contentToMove = content;
            const originalMetadata = await fetchMetadata(itemId);
            const contentWithColor = contentToMove + ` \/${originalMetadata?.color || 'yellow'}`;
            const [frameTitle, newClusterTitle] = newCluster.split(' - ');

            // First remove the note from the current cluster
            const updatedContent = { ...localContent };
            delete updatedContent[itemId];
            setLocalContent(updatedContent);
            await handleRemoveFromBoard(itemId);
            await new Promise(resolve => setTimeout(resolve, 2000));
    
            // Get the target group
            const targetGroup = groupedData?.[frameTitle]?.children[newClusterTitle];
            
            if (!targetGroup) {
                throw new Error("Target cluster not found");
            }
    
            // Create the note in the new cluster
            const stickyNote = await handleCurrentGroup(
                newCluster,
                targetGroup,
                contentWithColor
            );
    
            if (stickyNote) {
                // Manually trigger a data refresh with skip focus restore flag
                await fetchData(true);
                screenReaderMessage(`Note moved to ${newClusterTitle}`);
                focusOnNote(stickyNote.id, 6000);
            } else {
                throw new Error("Failed to create note in new cluster");
            }
    
        } catch (error) {
            console.error("Error moving note between clusters:", error);
            screenReaderMessage("Failed to move the note. Please try again.");
        }
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
        handleEditCancel,
        handleFocusOnBoard,
        handleClusterChange,
    };
};