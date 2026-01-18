import React from 'react';

interface EarconControlsProps {
  selectedEarcon: string;
  onEarconChange: (value: string) => void;
}

const EarconControls: React.FC<EarconControlsProps> = ({ selectedEarcon, onEarconChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEarconChange(e.target.value);
  };

  return (
      <>
        {['Audio', 'Text','Both','None'].map((option) => (  
        <div key={option} className="radio">
          <label>
            <input
              type="radio"
              name="earcon"
              value={option}
              checked={selectedEarcon === option}
              onChange={handleChange}
            />
            {option}
          </label>
        </div>
      ))}
    </>
  );
};

export default EarconControls; 