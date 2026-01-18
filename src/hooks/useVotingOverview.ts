import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../config/firebase";
import { VotingOverview } from "../components/types";

export const useVotingOverview = () => {
  const [votingOverview, setVotingOverview] = useState<VotingOverview>({
    totalVotes: 0,
    highestVotes: 0,
    lowestVotes: 0,
    highestVotedNoteIds: []
  });

  // get data from the realtime database
  useEffect(() => {
    const votesRef = ref(db, 'votes');
    
    const unsubscribe = onValue(votesRef, (snapshot) => {
      const votes = snapshot.val() || {};
      const voteEntries = Object.entries(votes);
      const voteValues = voteEntries.map(([_, count]) => count as number);
      
      // Find all notes with highest votes
      let highestVotes = Math.max(...voteValues, 0);
      let highestVotedNoteIds: string[] = [];
      
      voteEntries.forEach(([noteId, count]) => {
        if (count === highestVotes) {
          highestVotedNoteIds.push(noteId);
        }
      });
      
      setVotingOverview({
        totalVotes: voteValues.reduce((sum, count) => sum + count, 0),
        highestVotes,
        lowestVotes: Math.min(...voteValues, 0),
        highestVotedNoteIds
      });
    });

    return () => unsubscribe();
  }, []);

  return { 
    votingOverview, 
    setVotesUpdated: () => {} 
  };
};
