//@ts-nocheck
import { BoardNode } from "@mirohq/websdk-types";

// local host
// const BASE_URL = "http://127.0.0.1:5000/api";
// production
const BASE_URL = "https://idea11y-1fa44b9e4b76.herokuapp.com/api";

/**
 * Fetches data from the Miro board.
 */
async function fetchBoardData() {
  try {
    console.log("Fetching board data");
    const items = await miro.board.get();
    return items;
  } catch (error) {
    console.error("Error fetching Miro board data:", error);
    throw error;
  }
}

/**
 * Sends data to the backend.
 */
export async function sendDataToBackend(route: string, data: any) {
  try {
    console.log("Sending data to backend:", Array.isArray(data) ? data.length : 0);

    // First, make a preflight request
    const preflightResponse = await fetch(`${BASE_URL}${route}`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://miro.com"
      }
    });

    const response = await fetch(`${BASE_URL}${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://miro.com" //window.location.origin  
      },
      body: JSON.stringify(data),
      credentials: "omit", // or omit?
      mode: "cors"
    });

    if (response.status === 204) {
      return { success: true };
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    try {
      const result = await response.json();
      return result;
    } catch (e) {
      return { success: true };
    }
  } catch (error) {
    console.error("Error calling the API:", error);
    throw error;
  }
}

/**
 * Processes board data.
 */
export async function processBoardData(route: string) {
  try {
    const items = await fetchBoardData();
    console.log("Data fetched from Miro");
    const groupedData = await sendDataToBackend(route, items);
    return groupedData;
  } catch (error) {
    console.error("Error processing board data:", error);
    throw error;
  }
}