import { useState, useEffect } from "react";
import { User, ClusterItems } from "../components/types";
import { processBoardData } from "../api/grouping";
import { useNotifications } from "./useNotifications";
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { GroupedItem } from "../components/types";

export const useBoardSync = () => {
    const [groupedData, setGroupedData] = useState<Record<
        string,
        ClusterItems
    > | null>(null);
    const [clusterCount, setClusterCount] = useState<number>();
    const [selectedNotes, setSelectedNotes] = useState<any[]>([]);
    const [selectedNotesIDs, setSelectedNotesIDs] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const { onUserJoin, onUserLeave } = useNotifications();
    const [selections, setSelections] = useState<Record<string, {
        selectedNotes: string[];
        user: string;
        timestamp: number;
    }>>({});
    
    const fetchData = async (skipFocusRestore: boolean = false) => {
        try {
          // Save the current focus state before updating data
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) {
              // Save focus information
              const focusInfo = {
                tagName: activeElement.tagName.toLowerCase(),
                id: activeElement.id || "",
                text: activeElement.textContent || "",
                noteId: activeElement.getAttribute("data-note-id") || "",
                // For h4 headers (cluster titles)
                clusterTitle:
                  activeElement.tagName.toLowerCase() === "h4"
                    ? activeElement.textContent || ""
                    : "",
                timestamp: Date.now()
              };
              if (
                focusInfo.tagName !== "body" &&
                focusInfo.tagName !== "input"
              ) {
                // Save to local storage so it can be accessed after the update
                localStorage.setItem(
                  "idea11y_focus_state",
                  JSON.stringify(focusInfo)
                );
                console.log("Saving active element...:", focusInfo);
              }
            }

          const rawData = await processBoardData("/grouping");
          console.log("fetchData: processed raw data", rawData);

          if (!rawData) {
            setGroupedData(null);
            return;
          }

          const orderedData = orderRawData(rawData);
          setGroupedData(orderedData);

          const groupCount = Object.values(orderedData).reduce(
            (count, cluster) => count + Object.keys(cluster.children).length,
            0
          );
          setClusterCount(groupCount);
          
          // Restore focus after the UI has been updated
          setTimeout(() => {
            if (skipFocusRestore) {
              console.log('Skipping focus restoration!!!');
              return;
            }
            
            const focusInfoStr = localStorage.getItem('idea11y_focus_state');
            if (!focusInfoStr) return;
            
            try {
                const focusInfo = JSON.parse(focusInfoStr);
                console.log('Attempting to restore focus in fetchData to:', focusInfo);
                
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
                } else {
                    // Fallback to a heading if no matching element found
                    const heading = document.querySelector('h1, h2, h3');
                    if (heading instanceof HTMLElement) {
                        heading.focus();
                    }
                }
            } catch (error) {
                console.error('Error restoring focus in fetchData:', error);
            }
          }, 2000); // Wait for the DOM to update (2 seconds should be enough)
        } catch (error) {
            console.error("Error fetching or processing board data:", error);
        }
    };

    useEffect(() => {
      fetchData();
    }, [])

    // Listen for selection changes - firebase
    useEffect(() => {
        const db = getDatabase();
        const selectionsRef = ref(db, 'selections');

        const unsubscribe = onValue(selectionsRef, async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            // Store all selections data
            console.log("selections data is ", data)
            setSelections(data);
        });

        return () => unsubscribe();
    }, []);

    // order data
    const orderRawData = (rawData: any) => {
        // Order frames and clusters
        const orderedData: Record<string, ClusterItems> = {};
        let frameCounter = 1;
        let allclusterCounter = 1;
        
        // Sort frames by x position (left to right)
        const sortedFrames = Object.entries(rawData).sort((a, b) => 
            a[1].parentInfo.x - b[1].parentInfo.x
        );

        for (const [originalTitle, frameData] of sortedFrames) {
            // Check if this is an unbounded region
            const frameTitle = originalTitle.includes('Unbounded') 
                ? 'Sticky Notes' // unframed region
                : `Frame ${frameCounter}`;
            
            // Sort clusters within frame by x position (left to right)
            const sortedClusters = Object.entries(frameData.children).sort((a, b) => {
                const aX = Math.min(...a[1].childrenInfo.map((child: any) => child.x));
                const bX = Math.min(...b[1].childrenInfo.map((child: any) => child.x));
                return aX - bX;
            });

            const orderedClusters: Record<string, GroupedItem> = {};
            //let clusterCounter = 1;
            
            for (const [_, clusterData] of sortedClusters) {
                // Sort notes within cluster by y position (top to bottom)
                const sortedNotes: Record<string, string> = {};
                const sortedChildrenInfo = [...clusterData.childrenInfo].sort((a: any, b: any) => a.y - b.y);
                
                // Create ordered content based on sorted children
                sortedChildrenInfo.forEach((child: any) => {
                    if (clusterData.content[child.id]) {
                        sortedNotes[child.id] = clusterData.content[child.id];
                    }
                });

                //const clusterTitle = `Cluster ${clusterCounter}`;
                const clusterTitle = `Cluster ${allclusterCounter}`;
                orderedClusters[clusterTitle] = {
                    ...clusterData,
                    title: clusterTitle,
                    content: sortedNotes,
                    childrenInfo: sortedChildrenInfo
                };
                //clusterCounter++;
                allclusterCounter++;
            }

            orderedData[frameTitle] = {
                children: orderedClusters,
                parentInfo: frameData.parentInfo
            };
            
            // Only increment frame counter for actual frames
            if (!originalTitle.includes('Unbounded')) {
                frameCounter++;
            }
        }
        return orderedData;
    }

    // inform user status + track jump back to panel
    const handleSelectionUpdate = async (event: any) => {
        const selection = event.items;
        const stickyNotes = selection.filter((item: { type: string; }) => item.type === 'sticky_note');
        const newSelectedIDs = stickyNotes.map((note: { id: string; }) => note.id);

        setSelectedNotes(stickyNotes);
        setSelectedNotesIDs(newSelectedIDs);
        
        const currentUser = await miro.board.getUserInfo();
        const db = getDatabase();
        console.log("newSelectedIDs", newSelectedIDs)
        if (newSelectedIDs.length > 0) {
            await set(ref(db, `selections/${currentUser.id}`), {
                selectedNotes: newSelectedIDs,
                user: currentUser.name,
                timestamp: Date.now()
            });
        } else {
            // Remove the user's selection entry when they deselect
            await set(ref(db, `selections/${currentUser.id}`), null);
        }
    };

    const initializeUsers = async () => {
        const users = await miro.board.getOnlineUsers();
        console.log("Users", users)
        setOnlineUsers(users)
    }

    const handleUserUpdate = (event: { users: User[] }) => {
        // Get new list of users from the event
        const currentUsers = event.users;

        // Use previous state for accurate comparison
        setOnlineUsers(prevUsers => {
          // Find genuinely new users (not in previous state)
          const newUsers = currentUsers.filter(
            currentUser => !prevUsers.some(prevUser => prevUser.id === currentUser.id)
          );

          // Find users who have left (in previous state but not in current)
          const leftUsers = prevUsers.filter(
            prevUser => !currentUsers.some(currentUser => currentUser.id === prevUser.id)
          );

          // Log only if there are actual changes
          if (newUsers.length > 0) {
            console.log("Users joined:", newUsers);
            newUsers.forEach(onUserJoin);
          }

          if (leftUsers.length > 0) {
            console.log("Users left:", leftUsers);
            leftUsers.forEach(onUserLeave);
            // deselect notes if users have left
            leftUsers.forEach(async (user) => {
                const db = getDatabase();
                await set(ref(db,  `selections/${user.id}`), null);
                onUserLeave(user);
            })
          }

          // Return new state
          return currentUsers;
        });
      };

    return {
        groupedData,
        setGroupedData,
        clusterCount,
        selectedNotes,
        selectedNotesIDs,
        onlineUsers,
        fetchData,
        handleSelectionUpdate,
        handleUserUpdate,
        initializeUsers,
        selections
    };
};
