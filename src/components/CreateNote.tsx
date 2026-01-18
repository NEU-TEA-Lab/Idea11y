import React, { useState } from "react";
import InputField from "./InputField";

interface CreateNoteProps {
  onSubmit: (content: string) => Promise<void>;
  isVotingMode: boolean;
  availableClusters: string[];
  currentCluster: string;
  currentFrame: string;
}

const CreateNote: React.FC<CreateNoteProps> = ({ onSubmit, isVotingMode, availableClusters, currentCluster, currentFrame }) => {
  const [showInput, setShowInput] = useState(false);
  const [userInput, setUserInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async () => {
    await onSubmit(userInput);
    setUserInput("");
    setShowInput(false);
  };

  const handleCancel = () => {
    setUserInput("");
    setShowInput(false);
  };

  if (isVotingMode) return null;

  return (
    <div className="create-note">
      {showInput ? (
        <div className="input-container">
          <InputField
            value={userInput}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            currentCluster={currentCluster}
            currentFrame={currentFrame}
            availableClusters={availableClusters}
            onClusterChange={() => {}}
            onRemove={() => {}}
            mode="add"
          />
        </div>
      ) : (
        <button
          className="button-primary"
          onClick={() => setShowInput(true)}
          aria-label={`Add Note to ${currentFrame}, ${currentCluster}`}
        >
          Add
        </button>
      )}
    </div>
  );
};

export default CreateNote;
