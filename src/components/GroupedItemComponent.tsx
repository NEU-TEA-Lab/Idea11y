import React from "react";
import InputField from "./InputField";
import CreateNote from "./CreateNote";
import { GroupedItem } from "./types";
import { StickyNote } from "@mirohq/websdk-types";
import { useVoting } from "../hooks/useVoting";
import { NoteContent } from "./NoteContent";
import { VotingControls } from "./VotingControls";
import { useGroupActions } from "../hooks/useGroupActions";
import { useBoardActions } from "../hooks/useBoardActions";
interface GroupedItemProps {
  group: GroupedItem;
  clusterTitle: string;
  handleCurrentGroup: (
    clusterTitle: string,
    group: GroupedItem,
    userInputValue: string
  ) => Promise<StickyNote | null>;
  isVotingMode: boolean;
  isEditMode: boolean;
  selectedNotesIDs: string[];
  voiceOption: string;
  earconOption: string;
  availableClusters: string[]; 
  showVotingButtons: boolean;
}

const GroupedItemComponent: React.FC<GroupedItemProps> = ({
  group,
  clusterTitle,
  handleCurrentGroup,
  isVotingMode,
  selectedNotesIDs,
  voiceOption,
  earconOption,
  availableClusters,
}) => {
  const {
    editingItemId,
    userInput,
    localContent,
    handleInputChange,
    handleEditNote,
    handleRemoveNote,
    handleCreateNote,
    handleEditSubmit,
    handleEditCancel,
    handleClusterChange,
  } = useGroupActions({
    clusterTitle,
    group,
    handleCurrentGroup,
  });

  const { votes, userVotes, handleVote } = useVoting();
  const { handleFocusOnBoard } = useBoardActions();

  return (
    <div className="group">
      <h4 tabIndex={0}>{group.title}</h4>
      {group.aiSummary && (
        <div className="ai-summary" aria-live="polite">
          <p tabIndex={0}><strong>Summary: </strong> {group.aiSummary}</p>
        </div>
      )}
      <ul className="notes-list" role="list">
        {Object.entries(localContent).map(([itemId, itemContent]) => {
          const noteMetadata = group.metadata?.[itemId] || {
            creator: 'Unknown',
            color: 'yellow',
          };
          const cleanContent = itemContent.replace(/<[^>]*>?/gm, '');
          return (
            <li key={itemId} className="note-item">
              <div className="note-container">
                {editingItemId === itemId ? (
                  <InputField
                    value={userInput}
                    onChange={handleInputChange}
                    onSubmit={handleEditSubmit}
                    onCancel={handleEditCancel}
                    onRemove={() => handleRemoveNote(itemId)}
                    currentFrame={clusterTitle}
                    currentCluster={group.title}
                    availableClusters={availableClusters}
                    onClusterChange={(newCluster) => handleClusterChange(itemId, newCluster)}
                    mode="edit"
                  />
                ) : (
                  <>
                    <NoteContent
                      itemId={itemId}
                      content={itemContent}
                      metadata={noteMetadata}
                      onFocus={handleFocusOnBoard}
                      selectedNoteIds={selectedNotesIDs}
                      voiceOption={voiceOption}
                      earconOption={earconOption}
                      onEdit={handleEditNote}
                    />
                    {isVotingMode && (
                      <VotingControls
                        itemId={itemId}
                        votes={votes[itemId] || 0}
                        onVote={handleVote}
                        userVotes={userVotes}
                        content={cleanContent}
                      />
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {!editingItemId && !isVotingMode && (
        <CreateNote 
          onSubmit={handleCreateNote} 
          isVotingMode={isVotingMode}
          availableClusters={availableClusters}
          currentCluster={group.title}
          currentFrame={clusterTitle} 
        />
      )}
    </div>
  );
};

export default GroupedItemComponent;
