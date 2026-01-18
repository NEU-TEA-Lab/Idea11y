// hooks/useNoteMetadata.ts
import { useCallback } from 'react';
import { NoteMetadata } from '../components/types';

export const useNoteMetadata = () => {
    const getMetadata = useCallback(async (itemId: string): Promise<NoteMetadata> => {
        try {
            const item = await miro.board.getById(itemId);
            if (item && item.type === 'sticky_note') {
                // Get user info from Miro
                const users = await miro.board.getOnlineUsers();
                const creator = users.find(user => user.id === item.createdBy);
                console.log("getting metadata for sticky note", item);
                return {
                    creator: creator?.name || 'Unknown User',
                    color: item.style?.fillColor || 'Unknown Color',
                };
            }
            throw new Error('Item not found or not a sticky note');
        } catch (error) {
            console.error('Error fetching metadata:', error);
            return {
                creator: 'Unknown',
                color: 'Yellow',
            };
        }
    }, []);

    const updateMetadata = useCallback(async (
        itemId: string, 
        updates: Partial<NoteMetadata>
    ): Promise<void> => {
        try {
            const item = await miro.board.getById(itemId);
            if (item && item.type === 'sticky_note') {
                if (updates.color) {
                    item.style = { ...item.style, fillColor: updates.color };
                }
                await item.sync();
            }
        } catch (error) {
            console.error('Error updating metadata:', error);
        }
    }, []);

    return { getMetadata, updateMetadata };
};