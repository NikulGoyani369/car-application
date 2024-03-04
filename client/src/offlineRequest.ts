import * as fs from "node:fs";

const offlineDataDir = "./client/src/offline_data";

// Export offline data the app for use in other files
export const handleOfflineRequest = (data: any) => {
  // console.log("You are currently offline. Saving data locally...");

  try {
    // Check if the offline data directory exists, create it if not
    if (!fs.existsSync(offlineDataDir)) {
      fs.mkdirSync(offlineDataDir);
    }

    // Loop through endpoint and its data
    for (const endpoint in data) {
      if (Object.prototype.hasOwnProperty.call(data, endpoint)) {
        const endpointData = data[endpoint];

        // Generate the file name based on the endpoint and current timestamp
        // const fileName = `${offlineDataDir}/${endpoint}_${Date.now()}.json`;
        const fileName = `${offlineDataDir}/${endpoint}.json`;

        let existingData: any = [];

        // Check if the file already exists
        if (fs.existsSync(fileName)) {
          // Read existing data from the file
          existingData = JSON.parse(fs.readFileSync(fileName, "utf8"));
        }

        // Filter out data that already exists in the file
        const newDataFiltered = endpointData.filter((newItem: any) => {
          return !existingData.some((existingItem: any) =>
            isEqual(existingItem, newItem)
          );
        });

        // Merge new filtered data with existing data
        const mergedData = [...existingData, ...newDataFiltered];

        // Serialize the data to JSON format
        const jsonData = JSON.stringify(mergedData, null, 2);

        // Write the data to the file
        fs.writeFileSync(fileName, jsonData);

        console.log(`Data saved locally in file: ${fileName}`);
      }
    }
  } catch (err: any) {
    console.error("Error saving data locally", err);
  }
};

const isEqual = (existingItem: any, newItem: any) => {
  return JSON.stringify(existingItem) === JSON.stringify(newItem);
};
