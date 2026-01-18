import React, { useEffect, useState } from 'react';
import { PRESET_VOICES_ALL, PRESET_VOICES} from '../utils/constant';
import { useVoiceMapping } from '../hooks/useVoiceMapping';
import { NoteMetadata } from './types';
import { useMetadata } from '../contexts/MetadataContext';
import { useNotifications } from '../hooks/useNotifications';

// TODO: check context implementation about metadata
interface NoteAudioProps {
  content: string;
  onFocus: () => void;
  itemId: string;
  metadata: NoteMetadata | null;
  voiceOption: string;
}

const NoteAudio: React.FC<NoteAudioProps> = ({ 
  content, 
  onFocus,
  itemId,
  metadata,
  voiceOption 
}) => {
  const { colorToVoice, creatorToVoice } = useVoiceMapping();
  const { metadataGlobal, fetchMetadata } = useMetadata();
  const filteredContent = content.replace(/<[^>]*>?/gm, '');
  const { screenReaderMessage } = useNotifications();

  let sounds: SpeechSynthesisVoice[] = [];
  
  // Get voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      // console.log(availableVoices)
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.voiceURI.includes('Gordon') || // male 1 // Aaron
         voice.voiceURI.includes('Samantha') || // female 1
         voice.voiceURI.includes('Daniel') || // male 2
         voice.voiceURI.includes('Moira') || // tessa/Moira // female 2 
         voice.voiceURI.includes('Microsoft David') || // male 1
         voice.voiceURI.includes('Microsoft Zira') || // female 1
         voice.voiceURI.includes('Google US English') || // female 2
         voice.voiceURI.includes('Google UK English Female') || // male 2
         // add voices for microsoft edge
         voice.voiceURI.includes('Microsoft Mark') || // male 2
         voice.voiceURI.includes('Microsoft Libby') // female 2
      ));
      console.log('Voices loaded:', englishVoices);
      sounds = englishVoices;
    };

    loadVoices(); 
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices; 
    }

    return () => {
      speechSynthesis.onvoiceschanged = null; 
    };
  }, []);

  const speak = async (noteMetadata: NoteMetadata) => {
    if (!noteMetadata) {
      console.log('no metadata');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Get current voices if state is empty
    let currentVoices = sounds;
    if (currentVoices.length === 0) {
      const voiceOrder = [
        'Gordon',     // male 1 (or Aaron)
        'Samantha',   // female 1
        'Daniel',     // male 2
        'Moira',      // female 2 (or Tessa)
        'Microsoft David',    // male 1
        'Microsoft Zira',     // female 1
        'Google US English',  // male 2
        'Google UK English Female', // female 2
        'Microsoft Mark', // male 2 
        'Microsoft Libby' // female 2
      ];

      // Filter and sort voices based on the defined order
      currentVoices = voiceOrder.map(voiceName => 
        speechSynthesis.getVoices().find(voice => 
          voice.lang.includes('en') && voice.voiceURI.includes(voiceName)
        )
      ).filter(voice => voice !== undefined) as SpeechSynthesisVoice[];

      console.log('voices...', currentVoices);
    }

    let voicePreset = PRESET_VOICES[0];
    let personPreset = currentVoices[0];

    if (voiceOption === 'Color') {
      const voiceIndex = colorToVoice[noteMetadata.color];
      voicePreset = PRESET_VOICES_ALL[voiceIndex] || PRESET_VOICES[0];
      personPreset = currentVoices[voiceIndex] || currentVoices[0];
      console.log('using voice:', voicePreset, personPreset);
    } else if (voiceOption === 'User') {
      const voiceIndex = creatorToVoice[noteMetadata.creator];
      voicePreset = PRESET_VOICES_ALL[voiceIndex] || PRESET_VOICES[0];
      personPreset = currentVoices[voiceIndex] || currentVoices[0];
      console.log('using voice:', voicePreset, personPreset);
    }

    const utterance = new SpeechSynthesisUtterance(filteredContent);
    utterance.lang = 'en-US';
    utterance.voice = personPreset;
    utterance.rate = voicePreset.rate;
    utterance.volume = 1;

    console.log('speaking...', utterance);
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500); // 2 seconds delay
  };

  const speakMetadata = async () => {
    const curMetaData = await fetchMetadata(itemId);
    const allMetaData = 'Creator: ' + curMetaData.creator + ', Color: ' + curMetaData.color;
    screenReaderMessage(allMetaData);
  }

  const handleAudioFocus = async () => {
    await onFocus();
    try {
      // Always use the returned metadata from fetchMetadata
      const curMetaData = await fetchMetadata(itemId);
      console.log('Metadata fetched:', curMetaData);
      speak(curMetaData);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  return (
    <div className="note-container">
      <button
        className="speak-button"
        onFocus={handleAudioFocus}
        tabIndex={0} 
        //role="presentation"  
        aria-label="Note" // placeholder: focus
        onClick={speakMetadata}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
      </button>
      <div
        className="note-text"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default NoteAudio;
