import { useState, useEffect } from 'react';
import { NOTECOLORS, PRESET_VOICES_ALL } from '../utils/constant';

export const useVoiceMapping = () => {
  const [colorToVoice, setColorToVoice] = useState<Record<string, number>>({});
  const [creatorToVoice, setCreatorToVoice] = useState<Record<string, number>>({});

  useEffect(() => {
    const initializeMappings = async () => {
      // Case: for all possible colors
      const colorMapping: Record<string, number> = {};
      NOTECOLORS.forEach((color, index) => {
        colorMapping[color] = index % PRESET_VOICES_ALL.length;
      });
      setColorToVoice(colorMapping);
      console.log('colorMapping', colorMapping);

      // Initialize creator mapping (miro api)
      // works on sync interaction, but not for async
      try {
        const users = await miro.board.getOnlineUsers();
        const creatorMapping: Record<string, number> = {};
        users.forEach((user, index) => {
          creatorMapping[user.name] = index % PRESET_VOICES_ALL.length;
        });
        setCreatorToVoice(creatorMapping);
        console.log('creatorMapping', creatorMapping);
      } catch (error) {
        console.error('Error getting online users:', error);
      }
    };

    initializeMappings();
  }, []);

  return { colorToVoice, creatorToVoice };
};
