import React from 'react';
import GroupedItemComponent from './GroupedItemComponent';
import { ClusterItems, GroupedItem } from "./types"
import { StickyNote } from '@mirohq/websdk-types';

interface ClusterComponentProps {
    cluster: ClusterItems;
    clusterTitle: string;
    handleCurrentGroup: (clusterTitle: string, group: GroupedItem, userInputValue: string) => Promise<StickyNote | null>;
    isVotingMode: boolean;
    isEditMode: boolean;
    selectedNotesIDs: string[];
    voiceOption: string;
    earconOption: string;
    availableClusters: string[];
    showVotingButtons: boolean;
}

const ClusterComponent: React.FC<ClusterComponentProps> = ({
  cluster,
  clusterTitle,
  handleCurrentGroup,
  isVotingMode,
  isEditMode,
  selectedNotesIDs,
  voiceOption,
  earconOption,
  availableClusters,
  showVotingButtons
}) => {
  return (
    <div className="cluster">
      {Object.entries(cluster.children).map(([title, child]) => (
        <GroupedItemComponent
          key={title} // Ensure each child has a unique key
          group={child}
          clusterTitle={clusterTitle}
          handleCurrentGroup={handleCurrentGroup}
          isVotingMode={isVotingMode}
          isEditMode={isEditMode}
          selectedNotesIDs={selectedNotesIDs}
          voiceOption={voiceOption}
          earconOption={earconOption}
          availableClusters={availableClusters}
          showVotingButtons={showVotingButtons}
        />
      ))}
    </div>
  );
};

export default ClusterComponent;
