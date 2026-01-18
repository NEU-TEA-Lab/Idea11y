import * as React from "react";
import { createRoot } from "react-dom/client";
import "../src/assets/style.css";
import GroupedDataDisplay from "./components/GroupedDataDisplay";
import { ClusterProvider, useCluster } from "./contexts/ClusterContext";
import { useState, useEffect } from "react";
import VoiceControls from "./components/VoiceControls";
import EarconControls from "./components/EarconControls";
import { MetadataProvider } from "./contexts/MetadataContext";
import { useNotifications } from "./hooks/useNotifications";
import { ActiveUsers } from "./components/ActiveUsers";
import { useBoardSync } from "./hooks/useBoardSync";
import { exportToWord } from './utils/exportToWord';
import { ClusterItems } from "./components/types";

const BoardContent: React.FC = () => {
  const {
    groupedData,
    onlineUsers,
    clusterCount,
    selectedOption,
    votingOverview,
    setSelectedOption,
    handleResetVotes,
    syncAllClients,
  } = useCluster();
  const [isEditMode, setIsEditMode] = useState(false);
  const [voiceOption, setVoiceOption] = useState<string>('Consistent'); // default voice
  const [earconOption, setEarconOption] = useState<string>('Audio'); // default earcon
  const { screenReaderMessage } = useNotifications(earconOption);
  const [showVotingButtons, setShowVotingButtons] = useState(true);
  const { selections} = useBoardSync();
  const [colorCount, setColorCount] = useState<string>('0 Colors');
  const [clusterCountStr, setClusterCountStr] = useState<string>('0 Clusters');

  // console.log('groupedData',groupedData)

  // options for voting/brainstorming
  const handleOptionUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  // voice options
  const handleVoiceUpdate = (value: string) => {
    setVoiceOption(value);
    console.log('Voice updated: ', value);
  };

  // earcon options
  const handleEarconUpdate = (value: string) => {
    setEarconOption(value);
    console.log('Earcon updated: ', value);
  };

  // highest voted button
  const handleFindHighestVoted = async () => {
    if (votingOverview.highestVotedNoteIds.length > 0) {
      const highestVotedContents: string[] = [];

      Object.values(groupedData || {}).forEach(frame => {
        Object.values(frame.children).forEach(cluster => {
          votingOverview.highestVotedNoteIds.forEach(noteId => {
            if (cluster.content[noteId]) {
              const content = cluster.content[noteId];
              const filteredContent = content.replace(/<[^>]*>?/gm, '');
              highestVotedContents.push(filteredContent);
            }
          });
        });
      });

      if (highestVotedContents.length > 0) {
        const message = highestVotedContents.length === 1 
          ? `Highest voted idea with ${votingOverview.highestVotes} votes: ${highestVotedContents[0]}`
          : `Highest voted ideas with ${votingOverview.highestVotes} votes each: ${highestVotedContents.join(", ")}`;
        
        screenReaderMessage(message);
      }
    }
  };

  // voting buttons (+/-) control
  const handleVotingButtonsVisibility = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowVotingButtons(event.target.value === 'on');
  };

  const getColorStats = async () => {
    try {
      const stickyNotes = await miro.board.get({ type: 'sticky_note' });
      const colorSet = new Set<string>();
      
      stickyNotes.forEach(note => {
        if (note.style?.fillColor) {
          colorSet.add(note.style.fillColor);
        }
      });
  
      console.log("Colors found:", Array.from(colorSet));
      return colorSet.size;
    } catch (error) {
      console.error("Error getting color stats:", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchColorStats = async () => {
      const count = await getColorStats();
      setColorCount(count.toString());
      count === 1 ? setColorCount(count.toString() + ' Color') : setColorCount(count.toString() + ' Colors');
    };
    fetchColorStats();
    if (clusterCount) {
      clusterCount === 1 ? setClusterCountStr(clusterCount.toString() + ' Cluster') : setClusterCountStr(clusterCount.toString() + ' Clusters');
    }
  }, [groupedData]);

  const handleExport = async () => {
    if (!groupedData) return;
    
    try {
      await exportToWord(
        groupedData as Record<string, ClusterItems>, 
        clusterCountStr, 
        colorCount
      );
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="grid">
      <div>
        <h1 tabIndex={0}>ideally</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <p tabIndex={0}>Activity</p>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  value="Brainstorming"
                  checked={selectedOption === "Brainstorming"}
                  onChange={handleOptionUpdate}
                />
                Brainstorming
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  value="Voting"
                  checked={selectedOption === "Voting"}
                  onChange={handleOptionUpdate}
                />
                Voting
              </label>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <p tabIndex={0}>Voice</p>
            <VoiceControls
              selectedVoice={voiceOption}
              onVoiceChange={handleVoiceUpdate}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <p tabIndex={0}>Collaborator Cursor</p>
            <EarconControls
              selectedEarcon={earconOption}
              onEarconChange={handleEarconUpdate}
            />
          </div>
        </form>
      </div>
      <div className="cs1 ce12">
        {/* <StickyNoteListener /> */}
        {selectedOption === "Brainstorming" ? (
          <div>
            <h2 tabIndex={0}>Board Overview</h2>
            <ul>
              {groupedData ? (
                <li tabIndex={0}>
                  {/* {Object.keys(groupedData).length - 1 < 0
                    ? 0
                    : Object.keys(groupedData).length - 1}{" "}
                  Frames, {" "} */}
                  {(() => {
                    const frameCount = Object.entries(groupedData).filter(
                      ([title]) => {
                        return title.startsWith("Frame");
                      }
                    ).length;
                    return `${frameCount} ${frameCount === 1 ? "Frame" : "Frames"}`;
                  })()}
                  , {clusterCountStr}, {colorCount}
                </li>
              ) : (
                <li>Loading Groups</li>
              )}
              <li tabIndex={0}>
                <ActiveUsers
                  users={onlineUsers}
                  selections={selections}
                  groupedData={groupedData}
                />
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 tabIndex={0}>Voting Overview</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <ul>
                <li tabIndex={0}>
                  Total Votes from Users: {votingOverview.totalVotes}
                </li>
                <li tabIndex={0}>
                  Highest Votes on Note: {votingOverview.highestVotes}
                </li>
                {/* <li tabIndex={0}>Lowest Vote on Note: {votingOverview.lowestVotes}</li> */}
              </ul>
            </div>
            <button
              onClick={handleFindHighestVoted}
              className="button-primary"
              style={{ marginLeft: "10px" }}
              tabIndex={0}
            >
              Highest Voted Note
            </button>
            <button
              onClick={handleResetVotes}
              className="button-primary"
              tabIndex={0}
            >
              Reset Votes
            </button>
          </div>
        )}

        {groupedData ? (
          <>
            <GroupedDataDisplay
              clusters={groupedData}
              isVotingMode={selectedOption === "Voting"}
              isEditMode={isEditMode}
              voiceOption={voiceOption}
              earconOption={earconOption}
              showVotingButtons={showVotingButtons}
            />
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px"
              }}
            >
              <button
                onClick={handleExport}
                className="button-primary"
                aria-label="Export board content to Word document"
              >
                Save as Word Document
              </button>

              <div style={{ margin: "8px 0", fontSize: "14px", color: "#777" }}>
                --- backend use only ---
              </div>

              <button
                onClick={syncAllClients}
                className="button-primary"
                aria-label="backend use only: sync board data"
              >
                Sync Board Data
              </button>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ClusterProvider>
      <MetadataProvider>
        <BoardContent />
      </MetadataProvider>
    </ClusterProvider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
