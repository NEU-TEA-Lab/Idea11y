import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { ClusterTitle } from '../components/types';

export const useClusterTitles = () => {
    const [customTitles, setCustomTitles] = useState<Record<string, ClusterTitle>>({});

    useEffect(() => {
        const db = getDatabase();
        const titlesRef = ref(db, 'clusterTitles');
        
        onValue(titlesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCustomTitles(data);
            }
        });
    }, []);

    const updateClusterTitle = async (clusterId: string, frameId: string, newTitle: string) => {
        const db = getDatabase();
        const titleRef = ref(db, `clusterTitles/${clusterId}`);
        await set(titleRef, {
            id: clusterId,
            customTitle: newTitle,
            frameId: frameId
        });
    };

    return { customTitles, updateClusterTitle };
};