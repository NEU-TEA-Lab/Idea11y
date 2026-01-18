import ClusterComponent from "./ClusterComponent";
import { useGroupHandling } from "../hooks/useGroupHandling";
import { useCluster } from "../contexts/ClusterContext";
import { ClusterItems } from "./types";
import { useEffect } from "react";

interface GroupedDataDisplayProps {
  isVotingMode: boolean;
  isEditMode: boolean;
  clusters: Record<string, ClusterItems>;
  voiceOption: string;
  earconOption: string;
  showVotingButtons: boolean;
}

const GroupedDataDisplay: React.FC<GroupedDataDisplayProps> = ({
  isVotingMode,
  isEditMode,
  voiceOption,
  earconOption,
  showVotingButtons
}) => {
  const { groupedData, selectedNotesIDs } = useCluster();
  const { handleCurrentGroup } = useGroupHandling(groupedData || {});

  console.log('GroupedDataDisplay: groupedData is', groupedData);

  if (!groupedData) return <p>Loading...</p>;

  // Get all available clusters with their frame context
  const availableClusters = Object.entries(groupedData).flatMap(([frameTitle, frame]) => 
    Object.keys(frame.children).map(clusterTitle => 
      `${frameTitle} - ${clusterTitle}`
    )
  );
 
  // Create undecided cluster
  const undecidedCluster: ClusterItems = {
    children: {
      "Undecided": {
        title: "New Cluster", 
        content: {},
        childrenInfo: []
      }
    },
    parentInfo: {
      id: "undecided",
      x: 0,
      y: 0,
      width: 300,
      height: 300
    }
  };

  return (
    <div key={JSON.stringify(groupedData)}>
      <div className="clusters-section">
        {groupedData && Object.entries(groupedData).map(([clusterTitle, cluster]) => ( //groupedData?
          <div key={clusterTitle}>
            {/* {Heading level 1: Frame Title} */}
            <h3 tabIndex={0}>{clusterTitle}</h3> 
            <ClusterComponent
              cluster={cluster}
              clusterTitle={clusterTitle}
              handleCurrentGroup={handleCurrentGroup}
              isVotingMode={isVotingMode}
              isEditMode={isEditMode}
              selectedNotesIDs={selectedNotesIDs ?? []}
              voiceOption={voiceOption}
              earconOption={earconOption}
              availableClusters={availableClusters}
              showVotingButtons={showVotingButtons}
            />
          </div>
        ))}
      </div>
      <div className="undecided-section">
        <h3 tabIndex={0}></h3>
        <ClusterComponent
          cluster={undecidedCluster}
          clusterTitle="New Cluster" // don't change 
          handleCurrentGroup={handleCurrentGroup}
          isVotingMode={isVotingMode}
          isEditMode={false} // Always allow editing in undecided cluster
          selectedNotesIDs={selectedNotesIDs ?? []}
          voiceOption={voiceOption}
          earconOption={earconOption}
          availableClusters={availableClusters}
          showVotingButtons={showVotingButtons}
        />
      </div>
    </div>
  );
};

export default GroupedDataDisplay;
