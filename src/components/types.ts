import { Dispatch, SetStateAction } from 'react';

/**
 * represent an item with spatial details
 */
export interface ItemInfo {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    creator?: string;
    color?: string;
}

export interface NoteMetadata {
    creator: string;
    color: string;
}

/**
 * represent a group
 * a group contains title,
 * content(id -> item's content),
 * children info is for backend to calculate and find empty space for a newly created item
 */
export interface GroupedItem {
    title: string;
    content: Record<string, string>;
    childrenInfo: ItemInfo[];
    metadata?: Record<string, NoteMetadata>;
    aiSummary?: string;
}

/**
 * represent a cluster
 * contains groups in children
 * children is: title maps to a group
 * parent info contains id, coordinates, if grouped by frame
 */
export interface ClusterItems {
    children: Record<string, GroupedItem>;
    parentInfo: ItemInfo;
}

/**
 * represent a user
 */
export interface User {
    id: string;
    name: string;
}

export interface ClusterContextType {
    groupedData: Record<string, ClusterItems> | null;
    setGroupedData: Dispatch<SetStateAction<Record<string, ClusterItems> | null>>;
    selectedNotes: any[];
    selectedNotesIDs: string[];
    onlineUsers: User[];
    clusterCount: number | undefined;
    selectedOption: string;
    votingOverview: VotingOverview;
    votes: Record<string, number>;
    handleVote: (itemId: string, isChecked: boolean, content: string) => Promise<void>;
    handleResetVotes: () => Promise<void>;
    setSelectedOption: (option: string) => void;
    setVotesUpdated: (updated: boolean) => void;
    syncAllClients: () => Promise<void>;
    skipFocusRestore: boolean;
    enableSkipFocusRestore: (durationMs?: number) => void;
}


export interface VotingOverview {
    totalVotes: number;
    highestVotes: number;
    lowestVotes: number;
    highestVotedNoteIds: string[];
}

export type VoiceOption = 'Color' | 'User' | 'Consistent';