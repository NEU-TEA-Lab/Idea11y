import { useEffect } from "react";

export const useEventSource = (onMessage: () => void) => {
    useEffect(() => {
        // local host
        // const eventSource = new EventSource(
        //     "http://127.0.0.1:5000/api/stream"
        // );
        // const eventSource = new EventSource(
        // "https://backend.collabability.tech/api/stream"
        // );
        // production
        const eventSource = new EventSource(
            "https://idea11y-1fa44b9e4b76.herokuapp.com/api/stream"
        );

        eventSource.onmessage = async (event) => {
        console.log("SSE message received:", event.data);
        onMessage();
        };

        eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        eventSource.close();
        };

        return () => eventSource.close();
    }, [onMessage]);
};
