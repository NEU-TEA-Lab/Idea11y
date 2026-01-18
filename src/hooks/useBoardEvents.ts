import { useCallback } from "react";

const CREATION_INTERVAL = 5000;

export const useBoardEvents = (fetchData: () => Promise<void>) => {

    const handleBoardChange = useCallback(
        async (changeType: string) => {
        await fetchData();
        await miro.board.events.broadcast("board-changed", {
            type: changeType,
            timestamp: Date.now()
        });
        },
        [fetchData]
    );

    const handleItemCreate = useCallback(() => {
        setTimeout(() => handleBoardChange("create"), CREATION_INTERVAL);
    }, [handleBoardChange]);

    return {
        handleBoardChange,
        handleItemCreate,
        onItemDelete: () => handleBoardChange("delete"),
        onItemUpdate: () => handleBoardChange("update")
    };
};
