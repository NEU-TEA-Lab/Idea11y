interface NoteActionsProps {
  onEdit: () => void;
  onRemove: () => void;
}

export const NoteActions: React.FC<NoteActionsProps> = ({ onEdit, onRemove }) => (
  <>
    <button className="button-primary" onClick={onEdit}>Edit</button>
    <button className="button-primary" onClick={onRemove}>Remove</button>
  </>
);
