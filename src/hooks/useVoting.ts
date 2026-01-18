import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../config/firebase";
import { useNotifications } from "./useNotifications";

export const useVoting = () => {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const { screenReaderMessage } = useNotifications();
  
  useEffect(() => {
    const votesRef = ref(db, 'votes');
    const getCurrentUser = async () => {
      const user = await miro.board.getUserInfo();
      const userVotesRef = ref(db, `userVotes/${user.id}`);
      
      onValue(userVotesRef, (snapshot) => {
        const data = snapshot.val();
        setUserVotes(data || {});
      });
    };
    
    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      setVotes(data || {});
    });

    getCurrentUser();
    return () => unsubscribe();
  }, []);

  const handleVote = async (itemId: string, isChecked: boolean, content: string) => {
    try {
      const user = await miro.board.getUserInfo();
      const currentVotes = votes[itemId] || 0;
      const newVotes = isChecked ? currentVotes + 1 : currentVotes - 1;
      
      await Promise.all([
        set(ref(db, `votes/${itemId}`), newVotes),
        set(ref(db, `userVotes/${user.id}/${itemId}`), isChecked)
      ]);
      
      //screenReaderMessage(isChecked ? "Vote added" : "Vote removed");
      screenReaderMessage(isChecked 
        ? `Vote added: ${content}`
        : `Vote removed: ${content}`
      );
    } catch (error) {
      console.error("Error updating vote:", error);
      miro.board.notifications.showError("Failed to update vote");
    }
  };

  const resetAllVotes = async () => {
    try {
      await Promise.all([
        set(ref(db, 'votes'), {}),
        set(ref(db, 'userVotes'), {})
      ]);
    } catch (error) {
      console.error("Error resetting votes:", error);
      miro.board.notifications.showError("Failed to reset votes");
    }
  };

  return { votes, userVotes, handleVote, resetAllVotes };
};
