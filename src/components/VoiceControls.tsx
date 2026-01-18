import React from 'react';

interface VoiceControlsProps {
  selectedVoice: string;
  onVoiceChange: (value: string) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({ selectedVoice, onVoiceChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVoiceChange(e.target.value);
  };

  return (
    <>
      {['Consistent', 'User', 'Color'].map((option) => (
        <div key={option} className="radio">
          <label>
            <input
              type="radio"
              name="voice"
              value={option}
              checked={selectedVoice === option}
              onChange={handleChange}
            />
            {option}
          </label>
        </div>
      ))}
    </>
  );
};

export default VoiceControls;