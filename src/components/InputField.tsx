import React, { useState } from "react";

interface InputFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onCancel: () => void; 
    onRemove: () => void;
    currentCluster: string;
    currentFrame: string;
    availableClusters: string[];
    onClusterChange: (newCluster: string) => void;
    mode: 'add' | 'edit';
}

export const InputField: React.FC<InputFieldProps> = ({
    value,
    onChange,
    onSubmit,
    onCancel,
    onRemove,
    currentCluster,
    currentFrame,
    availableClusters,
    onClusterChange,
    mode,
}) => {
    const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSubmit();
        if (e.key === 'Escape') onCancel();
    };

    
    const availableClusterOptions = currentFrame.includes('Frame')
    ? availableClusters.filter(cluster => cluster.startsWith(currentFrame)) // Show only clusters in same frame
    : availableClusters.filter(cluster => !cluster.includes('Frame')); // Mind cluster Title!

    // Set default selected cluster
    const defaultCluster = currentFrame 
        ? `${currentFrame} - ${currentCluster}`
        : currentCluster;

    const handleClusterSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCluster = e.target.value;
        setSelectedCluster(newCluster);
        onClusterChange(newCluster);
    };

    // Check if a new cluster different from the current one is selected
    const isNewClusterSelected = selectedCluster && selectedCluster !== defaultCluster;

    return (
      <div className="input-container">
            <div className="input-row">
                <input
                    type="text"
                    autoFocus={true}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyPress}
                    className="input-field"
                    aria-label="Editing note content"
                />
                {mode === 'edit' && (
                    <div>
                        <span tabIndex={0}> location: </span>
                        <select
                            value={selectedCluster || defaultCluster}
                            onChange={handleClusterSelection}
                            className="cluster-select"
                        >
                            {availableClusterOptions.map((cluster) => (
                                <option key={cluster} value={cluster}>
                                    {cluster}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            {/* {isNewClusterSelected && (
                <div className="cluster-change-message" role="status" aria-live="polite">
                    <p>Note will be moved to {selectedCluster!.split(' - ')[1]} when you click Submit</p>
                </div>
            )}
            <p></p> */}
            <div className="button-group">
                <button className="button-primary" onClick={onSubmit}>
                    {isNewClusterSelected ? 'Move & Submit' : 'Submit'}
                </button>
                {mode === 'edit' && (
                    <button className="button-primary" onClick={onRemove}>
                        Delete
                    </button>
                )}
                <button className="button-primary" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default InputField;
