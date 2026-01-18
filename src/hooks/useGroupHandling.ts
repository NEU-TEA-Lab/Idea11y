import { sendDataToBackend } from "../api/grouping";
import { ClusterItems, GroupedItem } from "../components/types";
import { useStickyNote } from "./useStickyNote";

export const useGroupHandling = (clusters: Record<string, ClusterItems>) => {
  const { createStickyNote } = useStickyNote();

  const handleCurrentGroup = async ( // Note: title passed in as `Frame - Cluster`
    clusterTitle: string,
    group: GroupedItem,
    userInputValue: string,
  ) => {
 
    const isUndecided = clusterTitle.includes('New Cluster'); // title check, update if title changes
    const isFrame = clusterTitle.includes('Frame') && !isUndecided;

    console.log('Current clusterTitle/group:', clusterTitle, group); 

    // Parse the cluster title to get the actual frame title
    let frameTitle = clusterTitle;
    if (clusterTitle.includes(' - ')) {
      [frameTitle] = clusterTitle.split(' - ');
    }
    
    // get groupInfo
    const groupInfo = {
      current_group: {
        parentInfo: isUndecided ? {
          id: "undecided",
          x: 0,
          y: 0,
          width: 300,
          height: 300
        } : {
          id: clusters[frameTitle].parentInfo.id,
          x: clusters[frameTitle].parentInfo.x,
          y: clusters[frameTitle].parentInfo.y,
          width: clusters[frameTitle].parentInfo.width,
          height: clusters[frameTitle].parentInfo.height
        },
        childrenInfo: group.childrenInfo
      }
    };

    // get x, y, width
    let x, y, width;
    try {
      if (!isUndecided) {
        console.log("groupInfo sent to backend", groupInfo);
        const response = await sendDataToBackend("/editing_group", groupInfo);
        x = response.x;
        y = response.y;
        width = response.width;
      } else { // in undecided cluster
        const allNotes = await miro.board.get({ type: 'sticky_note' });
        if (allNotes.length > 0) {
          // find the rightmost board note
          const unboundedNotes = allNotes.filter(note => note.parentId === null);
          const rightmostNote = unboundedNotes.reduce((prev, current) => {
            return (prev.x > current.x) ? prev : current;
          });
          x = rightmostNote.x + 5*rightmostNote.width;
          y = rightmostNote.y + 5*rightmostNote.height;
          width = 300;
        } else {
          x = 100;
          y = 100;
          width = 300;
        }
      }

      // check if frame or not
      if (isFrame) {
        console.log("in the condition of frames");
        try {
          const parentID = clusters[frameTitle].parentInfo.id;
          const frame = await miro.board.getById(parentID);
          if (frame && frame.type === 'frame') {
            console.log("frame found, creating new sticky note in frame at ", x, y);
            // coordinate coversion (frame to global)
            const globalX = (frame.x - frame.width/2) + x
            const globalY = (frame.y - frame.height/2) + y
            // add new sticky note to frame
            const stickyNote = await createStickyNote(
              userInputValue,
              { x: globalX, y: globalY, width },
              group,
              isUndecided
            );
            if (stickyNote) {
              await frame.add(stickyNote);
              await frame.sync();
            }
            return stickyNote;
          }
        } catch (frameError) {
          console.error('Error adding note to frame:', frameError);
        }
      } else {
        // Create sticky note using the hook
        const stickyNote = await createStickyNote(
          userInputValue,
          { x, y, width },
          group,
          isUndecided
        );
        return stickyNote;
      }
      
      return null;
    } catch (error) {
      console.error("error sending group data", error);
      throw error;
    }
  };

  return { handleCurrentGroup };
};
