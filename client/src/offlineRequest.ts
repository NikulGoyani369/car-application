import * as fs from "node:fs";

let offlineCache: any = {};

// Export offline data the app for use in other files
export const handleOfflineRequest = (data: any) => {
  // console.log("You are currently offline. Saving data locally...");

  try {
    // Loop through endpoint and its data
    for (const endpoint in data) {
      if (Object.prototype.hasOwnProperty.call(data, endpoint)) {
        const endpointData = data[endpoint];

        if (!offlineCache[endpoint]) {
          offlineCache[endpoint] = [];
        }

        let existingData = offlineCache[endpoint];

        // // Check if the file already exists
        // if (fs.existsSync(fileName)) {
        //   // Read existing data from the file
        //   existingData = JSON.parse(fs.readFileSync(fileName, "utf8"));
        // }

        // Filter out data that already exists in the file
        const newDataFiltered = endpointData.filter((newItem: any) => {
          return !existingData.some((existingItem: any) =>
            isEqual(existingItem, newItem)
          );
        });

        // Merge new filtered data with existing data
        const mergedData = [...existingData, ...newDataFiltered];

        // Write the data
        offlineCache[endpoint] = mergedData;

        console.log(`Data saved locally in cache for endpoint: ${endpoint}`);
      }
    }
  } catch (err: any) {
    console.error("Error saving data locally", err);
  }
};

const isEqual = (existingItem: any, newItem: any) => {
  return JSON.stringify(existingItem) === JSON.stringify(newItem);
};

// Function to get offline data from the cache
export const getOfflineData = (endpoint: string) => {
  console.log("Retrieving cached data for endpoint...Nikul: ", endpoint);

  // Check if the endpoint exists in the cache and return the data

  return offlineCache[endpoint];
};
