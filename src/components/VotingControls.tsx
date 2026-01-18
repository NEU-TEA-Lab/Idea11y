import React, { useState } from 'react';

interface VotingControlsProps {
  itemId: string;
  votes: number;
  userVotes: Record<string, boolean>;
  onVote: (itemId: string, isChecked: boolean, content: string) => Promise<void>;
  content: string;
}

export const VotingControls: React.FC<VotingControlsProps> = ({
  itemId,
  votes,
  userVotes,
  onVote,
  content,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      await onVote(itemId, event.target.checked, content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="voting-options" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span tabIndex={0}>
        {votes} Vote{votes !== 1 ? "s" : ""}
      </span>
      <label>
        <input
          type="checkbox"
          checked={userVotes[itemId] || false}
          onChange={handleCheckboxChange}
          disabled={isLoading}
          aria-label={`Add a vote to ${content}`}
        />
        {/* {userVotes[itemId] ? " Voted" : " Not Voted"} */}
      </label>
    </div>
  );
};
