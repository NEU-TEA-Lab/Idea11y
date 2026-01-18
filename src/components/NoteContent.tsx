import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NoteMetadata } from './types';
import { getDatabase, ref, get } from 'firebase/database';
import NoteAudio from './NoteAudio';
import { useMetadata } from '../contexts/MetadataContext';

interface NoteContentProps {
    itemId: string;
    content: string;
    onFocus:(itemId: string) => Promise<void>;
    selectedNoteIds: string[];
    metadata: NoteMetadata;
    voiceOption: string;
    earconOption: string;
    onEdit: (itemId: string, content: string) => void;
}

export const NoteContent: React.FC<NoteContentProps> = ({
    itemId,
    content,
    onFocus, 
    voiceOption,
    earconOption,
    onEdit,
}) => {
    const { playNotificationSound, screenReaderMessage, playNotificationFile } = useNotifications();
    const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
    const { metadataGlobal, fetchMetadata } = useMetadata();
    const noteMetadata = metadataGlobal[itemId];

    const handleReaderFocus = async () => {
        console.log('focusing on note:', itemId);
        setFocusedNoteId(itemId);

        // Fetch metadata when note is focused
        console.log('fetching metadata for:', itemId);
        await fetchMetadata(itemId);

        // Check selection status from firebase
        const db = getDatabase();
        const selectionsRef = ref(db, 'selections');
        const snapshot = await get(selectionsRef);
        const data = snapshot.val();
        const filteredContent = content.replace(/<[^>]*>?/g, '');
        if (data) {
            // Check all users' selections
            Object.entries(data).forEach(([userId, userData]: [string, any]) => {
                console.log('earcon is ', earconOption);
                if (userData.selectedNotes?.includes(itemId)) {
                    if (earconOption === 'Audio') {
                        playNotificationSound();
                    } else if (earconOption === 'Text') {
                        screenReaderMessage(`${userData.user} is on ${filteredContent}`);
                    } else if (earconOption === 'Both') {
                        playNotificationSound();
                        screenReaderMessage(`${userData.user} is on ${filteredContent}`);
                    }
                }
            });
        }
    };

    const handleDetailBlur = () => {
        if (focusedNoteId === itemId) {
            setFocusedNoteId(null);
        }
    };

    // press i for metadata (color, creator), show not speak directly
    const handleInfoKeyPress = useCallback((e: KeyboardEvent) => {
        if ((e.key === 'i' || e.key === 'I') && ((e.altKey&&e.ctrlKey) || e.metaKey) && focusedNoteId === itemId) {
            screenReaderMessage(`Creator: ${noteMetadata.creator}, Color: ${noteMetadata.color}`);
        }
    }, [focusedNoteId, itemId, noteMetadata]);

    // press e to edit note
    const handleEditKeyPress = useCallback((e: KeyboardEvent) => {
        if ((e.key === 'e' || e.key === 'E') && ((e.altKey&&e.ctrlKey) || e.metaKey) && focusedNoteId === itemId) {
            // Prevent adding e to the note content
            e.preventDefault();
            onEdit(itemId, content);
            // Restore focus 
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.focus();
            }
        }
    }, [focusedNoteId, itemId, content, onEdit]);

    // press j to jump to board note
    const handleJumpKeyPress = useCallback((e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'j' && ((e.altKey&&e.ctrlKey) || e.metaKey) && focusedNoteId === itemId) {
            onFocus(itemId);
            // Announce to screen reader
            screenReaderMessage(`Jumped to note on board`);
        }
      }, [focusedNoteId, itemId, onFocus]);

    useEffect(() => {
        if (focusedNoteId === itemId) {
            document.addEventListener('keydown', handleEditKeyPress);
            document.addEventListener('keydown', handleInfoKeyPress);
            document.addEventListener('keydown', handleJumpKeyPress);
            return () => {
                document.removeEventListener('keydown', handleEditKeyPress);
                document.removeEventListener('keydown', handleInfoKeyPress);
                document.removeEventListener('keydown', handleJumpKeyPress);
            };
        }
    }, [focusedNoteId, itemId, handleEditKeyPress, handleInfoKeyPress, handleJumpKeyPress]);
    
    return (
        <div data-note-id={itemId}>
        {voiceOption !== 'Consistent' && <NoteAudio
                content={content}
                onFocus={handleReaderFocus}
                itemId={itemId}
                metadata={noteMetadata}
                voiceOption={voiceOption}
            />
        }
        {voiceOption === 'Consistent' && 
            <p
                tabIndex={0}
                onFocus={handleReaderFocus}
                onBlur={handleDetailBlur}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        }
        </div>
    );
};
