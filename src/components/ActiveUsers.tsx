import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface UserInfo {
  id: string;
  name: string;
}

interface ActiveUsersProps {
  users: UserInfo[];
  selections: Record<string, {
    selectedNotes: string[];
    user: string;
    timestamp: number;
  }>;
  groupedData: Record<string, any>;
}

export const ActiveUsers: React.FC<ActiveUsersProps> = ({ users, selections, groupedData }) => {
  const { screenReaderMessage } = useNotifications();

  const annouceUserLocation = (userId: string) => {
    console.log("user id", userId)
    console.log("selections", selections)
    const userSelection = selections[userId];
    const userName = users.find(u => u.id === userId)?.name || 'User';
    
    console.log("in active user, ", userSelection, userName)
    if (!userSelection?.selectedNotes?.length) {
      screenReaderMessage(`${userName} is not selecting any note`);
      return;
    }
    // Find the note in groupedData
    let noteLocation = '';
    const noteId = userSelection.selectedNotes[0];
    let noteContent = '';

    if (groupedData) {
      Object.entries(groupedData).forEach(([frameTitle, frame]: [string, any]) => {
        if (frame.children) {
          Object.entries(frame.children).forEach(([clusterTitle, cluster]: [string, any]) => {
            if (cluster.content && cluster.content[noteId]) {
              noteContent = cluster.content[noteId];
              noteLocation = `${frameTitle} - ${clusterTitle}`;
            }
          });
        }
      });
    }

    const noteContentFiltered = noteContent.replace(/<[^>]*>?/gm, '');

    const message = noteContent 
      ? `${userName} is in ${noteLocation}. On the note: ${noteContentFiltered}`
      : `${userName} is selecting a note that's not in any cluster`;

    screenReaderMessage(message);
  }

  const handleUserClick = (userId: string) => {
    const userSelection = selections[userId];
    const userName = users.find(u => u.id === userId)?.name || 'User';
    
    if (!userSelection?.selectedNotes?.length) {
      screenReaderMessage(`${userName} is not selecting any note`);
      return;
    }
    // Find the note in groupedData
    const noteId = userSelection.selectedNotes[0];
    let noteContent = '';

    if (groupedData) {
      Object.entries(groupedData).forEach(([frameTitle, frame]: [string, any]) => {
        if (frame.children) {
          Object.entries(frame.children).forEach(([clusterTitle, cluster]: [string, any]) => {
            if (cluster.content && cluster.content[noteId]) {
              noteContent = cluster.content[noteId];
            }
          });
        }
      });
    }

    const noteContentFiltered = noteContent.replace(/<[^>]*>?/gm, '');

    // Find and focus on the note element in the panel
    if (noteId) {
      // Use setTimeout to ensure the announcement happens before focus change
      setTimeout(() => {
        // First try: find by data-note-id attribute which is added to the wrapper div in NoteContent
        const noteContainer = document.querySelector(`div[data-note-id="${noteId}"]`);
        
        if (noteContainer instanceof HTMLElement) {
          // Try to find the focusable element within this container
          const focusableElement = noteContainer.querySelector('p[tabindex="0"], button.speak-button[tabindex="0"]');
          
          if (focusableElement instanceof HTMLElement) {
            focusableElement.focus();
            console.log(`Focusing on the note...`);
          } else {
            noteContainer.focus();
            console.log(`Focusing on the note...`);
          }
        } else {
          // Fallback search: try finding any element that has the content of the note
          if (noteContent) {
            // Get the first 20 chars as a unique identifier (avoiding HTML tags)
            const contentFragment = noteContentFiltered.substring(0, Math.min(20, noteContentFiltered.length));
            
            // Look for paragraphs or buttons containing this content
            const allParagraphs = document.querySelectorAll('p[tabindex="0"], button.speak-button[tabindex="0"]');
            
            for (let i = 0; i < allParagraphs.length; i++) {
              const element = allParagraphs[i];
              
              // Check if text content contains our fragment
              if (element.textContent && element.textContent.includes(contentFragment)) {
                if (element instanceof HTMLElement) {
                  element.focus();
                  console.log(`Focusing...`);
                  break;
                }
              }
            }
          }
        }
      }, 500); // Wait 500ms
    }
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the key combination matches (Ctrl+Alt or Cmd) and a number key is pressed
      if (((e.altKey && e.ctrlKey) || e.metaKey)) {
        const numberKey = e.key.match(/[1-9]/);
        if (numberKey) {
          const userIndex = parseInt(numberKey[0]) - 1;
          if (userIndex < users.length) {
            e.preventDefault(); // Prevent default browser behavior
            handleUserClick(users[userIndex].id);
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [users, selections, groupedData]); 

  return (
    <div className="active-users">
      <span>
        {users.length} {users.length === 1 ? 'Current User' : 'Current Users'}: 
      </span>
      <div className="user-buttons" style={{ display: 'inline' }}>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => annouceUserLocation(user.id)}
            className="user-button"
            style={{ marginLeft: '8px' }}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};
