import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { ClusterContextType } from "../components/types";
import { useBoardSync } from "../hooks/useBoardSync";
import { useBoardEvents } from "../hooks/useBoardEvents";
import { useVoting } from "../hooks/useVoting";
import { useVotingOverview } from "../hooks/useVotingOverview";
import { useNotifications } from "../hooks/useNotifications";

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

export const ClusterProvider: React.FC<{ children: ReactNode }> = ({
    children
    }) => {
    const [selectedOption, setSelectedOption] = useState("Brainstorming");
    // Add state to track if focus restoration should be skipped
    const [skipFocusRestore, setSkipFocusRestore] = useState(false);

    const {
        groupedData,
        setGroupedData,
        clusterCount,
        selectedNotes,
        selectedNotesIDs,
        onlineUsers,
        fetchData,
        handleSelectionUpdate,
        initializeUsers,
        handleUserUpdate
    } = useBoardSync();

    const { handleItemCreate, onItemDelete, onItemUpdate } = useBoardEvents(fetchData);

    const { votes, handleVote, resetAllVotes } = useVoting();
    const { votingOverview, setVotesUpdated } = useVotingOverview();

    const { screenReaderMessage } = useNotifications();

    // Function to enable focus restoration skipping temporarily
    const enableSkipFocusRestore = (durationMs = 7000) => {
        setSkipFocusRestore(true);
        // Clear the flag after the specified duration
        setTimeout(() => {
            setSkipFocusRestore(false);
        }, durationMs);
    };

    //useEventSource(fetchData);

    useEffect(() => {
        const setupSync = async () => {
        try {
            // Initialize board state
            initializeUsers();

            // Set up event listeners
            await miro.board.ui.on("selection:update", handleSelectionUpdate);
            await miro.board.ui.on("online_users:update", handleUserUpdate);
            miro.board.ui.on("items:create", handleItemCreate);
            miro.board.ui.on("items:delete", onItemDelete);
            miro.board.ui.on("experimental:items:update", onItemUpdate);
            miro.board.events.on("manual-sync", () => fetchData(false));

            return () => {
            // Cleanup event listeners
            miro.board.ui.off("selection:update", handleSelectionUpdate);
            miro.board.ui.off("online_users:update", handleUserUpdate);
            miro.board.ui.off("items:create", handleItemCreate);
            miro.board.ui.off("items:delete", onItemDelete);
            miro.board.ui.off("experimental:items:update", onItemUpdate);
            miro.board.events.off("manual-sync", () => fetchData(false));
            };
        } catch (error) {
            console.error("Error setting up real-time sync:", error);
        }
        };

        setupSync();
    }, []);

    // Function to save focus state to localStorage
    const saveFocusState = () => {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
            // Save focus information
            const focusInfo = {
                tagName: activeElement.tagName.toLowerCase(),
                id: activeElement.id || '',
                text: activeElement.textContent || '',
                noteId: activeElement.getAttribute('data-note-id') || '',
                // For h4 headers (cluster titles)
                clusterTitle: activeElement.tagName.toLowerCase() === 'h4' ? 
                    activeElement.textContent || '' : '',
                // Store when this was saved
                timestamp: Date.now()
            };
            localStorage.setItem('idea11y_focus_state', JSON.stringify(focusInfo));
            console.log('Focus state saved:', focusInfo);
        }
    };

    // Function to restore focus
    const restoreFocus = (waitTime = 1000) => {
        setTimeout(() => {
            const focusInfoStr = localStorage.getItem('idea11y_focus_state');
            if (!focusInfoStr) return;
            
            try {
                const focusInfo = JSON.parse(focusInfoStr);
                console.log('Attempting to restore focus to:', focusInfo);
                
                // Check if saved state is recent (within last 10 seconds)
                if (Date.now() - focusInfo.timestamp > 10000) {
                    console.log('Saved focus state is too old, not restoring');
                    return;
                }
                
                let elementToFocus: HTMLElement | null = null;
                
                // Try to find by ID first (most reliable)
                if (focusInfo.id) {
                    elementToFocus = document.getElementById(focusInfo.id);
                }
                
                // Try to find by note ID (for sticky notes)
                if (!elementToFocus && focusInfo.noteId) {
                    elementToFocus = document.querySelector(`[data-note-id="${focusInfo.noteId}"]`) as HTMLElement;
                }
                
                // For cluster titles (h4 elements)
                if (!elementToFocus && focusInfo.clusterTitle) {
                    const headings = document.querySelectorAll('h4');
                    const targetHeading = Array.from(headings).find(
                        heading => heading.textContent === focusInfo.clusterTitle
                    );
                    
                    if (targetHeading instanceof HTMLElement) {
                        elementToFocus = targetHeading;
                    }
                }
                
                // If all else fails, try to find by tag name and content
                if (!elementToFocus && focusInfo.text) {
                    const elements = document.querySelectorAll(focusInfo.tagName);
                    const matchingElement = Array.from(elements).find(
                        element => element.textContent?.includes(focusInfo.text)
                    );
                    
                    if (matchingElement instanceof HTMLElement) {
                        elementToFocus = matchingElement;
                    }
                }
                
                // Focus the element if found
                if (elementToFocus) {
                    elementToFocus.focus();
                    screenReaderMessage('Focus restored after sync');
                } else {
                    // Fallback to a heading if no matching element found
                    const heading = document.querySelector('h1, h2, h3');
                    if (heading instanceof HTMLElement) {
                        heading.focus();
                        screenReaderMessage('Board synced, focus moved to heading');
                    }
                }
            } catch (error) {
                console.error('Error restoring focus:', error);
            }
        }, waitTime);
    };

    // Function to sync all clients/users
    const syncAllClients = async () => {
        try {
            // Save focus state before updating
            saveFocusState();
            
            // First update the current user's data
            await fetchData();
            // Focus restoration will happen in fetchData
            
            console.log("Sync request sent to all clients");
            // Then broadcast to all other clients to update their data
            await miro.board.events.broadcast("manual-sync", {
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Error syncing all clients:", error);
            //screenReaderMessage("Error syncing board data");
        }
    };

    const value = {
        groupedData,
        setGroupedData,
        selectedNotes,
        selectedNotesIDs,
        onlineUsers,
        clusterCount,
        selectedOption,
        votingOverview,
        votes,
        handleVote,
        handleResetVotes: resetAllVotes,
        setSelectedOption,
        setVotesUpdated,
        syncAllClients,
        skipFocusRestore,
        enableSkipFocusRestore
    };

    return (
        <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>
    );
};

export const useCluster = () => {
    const context = useContext(ClusterContext);
    if (context === undefined) {
        throw new Error("useCluster must be used within a ClusterProvider");
    }
    return context;
};
