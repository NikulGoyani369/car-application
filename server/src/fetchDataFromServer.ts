import * as fs from "node:fs";
import axios from "axios";
import { checkServerStatus } from "../../client-1/src/commands";

interface ClientConfig {
  name: string;
  onlineDataDir: string;
  serverEndpoints: string[]; // Array of server endpoints
  offlineFilePaths: string[]; // Array of offline file paths
}

// Function to fetch data from server and update local data
export const fetchServerData = async (
  onlineDataDir: string,
  serverEndpoints: string[],
  offlineFilePaths: string[]
) => {
  try {
    if (!fs.existsSync(onlineDataDir)) {
      fs.mkdirSync(onlineDataDir, { recursive: true });
    }

    // Loop through server endpoint and fetch data
    for (let i = 0; i < serverEndpoints.length; i++) {
      const fileName = `${onlineDataDir}/${i}_data.json`; // Unique file name for endpoint

      let existingData: any = [];
      // Check if the file already exists
      if (fs.existsSync(fileName)) {
        existingData = JSON.parse(fs.readFileSync(fileName, "utf8"));
      }

      // Fetch data from the server endpoint
      const response = await axios.get(serverEndpoints[i]);

      // Serialize the data to JSON format
      const jsonData = JSON.stringify(response.data, null, 2);

      // Write the data to the file
      fs.writeFileSync(fileName, jsonData);

      console.log(`\nServer data saved locally in file: ${fileName}`);

      // Compare content of the offline file with the server data
      const offlineFilePath = offlineFilePaths[i];

      const file1Content = fs.existsSync(offlineFilePath)
        ? fs.readFileSync(offlineFilePath, "utf8")
        : null;

      const file2Content = fs.existsSync(fileName)
        ? fs.readFileSync(fileName, "utf8")
        : null;

      if (file1Content === file2Content) {
        console.log("Files have the same content. No action required.");
      } else if (file2Content) {
        fs.writeFileSync(offlineFilePath, file2Content);

        console.log("Local data updated successfully.");
      } else {
        console.log("Failed to update local data. Server data may be empty.");
      }
    }
  } catch (error: any) {
    console.error(
      "\nError fetching server data because Server is offline:",
      error.message
    );
  }
};

// Define configurations for multiple client app to fetch data from server
const clients: ClientConfig[] = [
  {
    name: "Client",
    onlineDataDir: "./client/src/online_data",
    serverEndpoints: [
      "http://localhost:3000/manufacturers",
      "http://localhost:3000/models",
    ],

    // Add more offline file paths as needed
    offlineFilePaths: [
      "./client/src/offline_data/createManufacturer.json",
      "./client/src/offline_data/addModelByManufacturerId.json",
    ],
  },
  {
    name: "Client 1",
    onlineDataDir: "./client-1/src/online_data",
    serverEndpoints: [
      "http://localhost:3000/manufacturers",
      "http://localhost:3000/models",
    ], // multiple endpoints

    offlineFilePaths: [
      "./client-1/src/offline_data/createManufacturer.json",
      "./client-1/src/offline_data/addModelByManufacturerId.json",
    ], // multiple offline file paths
  },
  // Add more clients as needed
];

// Function to fetch data and update for client
export const fetchAndUpdateForAllClients = async () => {
  for (const client of clients) {
    console.log(`\nUpdating data for ${client.name}`);
    await fetchServerData(
      client.onlineDataDir,
      client.serverEndpoints,
      client.offlineFilePaths
    );
  }
};

// // Set up recurring timer to update data for all clients every 5minutes
// setInterval(async () => {
//   console.log("\nFetching and updating data for all clients...");
//   await fetchAndUpdateForAllClients();
// }, 300000); // 5 minutes in milliseconds

// Fetchdata from server and update local data for client app to compare and merge data
export const compareAndMerge = async (
  file1Path: fs.PathLike,
  file2Path: fs.PathLike
) => {
  try {
    // check server is online
    const isServerIsOnline = checkServerStatus();

    if (!isServerIsOnline) {
      //fetch data when server is online

      for (const client of clients) {
        console.log(
          `\nFetching data for------------------------- ${client.name}`
        );
        await fetchServerData(
          client.onlineDataDir,
          client.serverEndpoints,
          client.offlineFilePaths
        );
      }
    }

    // Read content of both files asynchronously
    const file1Content = fs.existsSync(file1Path)
      ? fs.readFileSync(file1Path, "utf8")
      : null;
    const file2Content = fs.existsSync(file2Path)
      ? fs.readFileSync(file2Path, "utf8")
      : null;

    // Compare content
    if (file1Content === file2Content) {
      console.log("Files have the same content. No action required.");
      return;
    }

    // Update file1 with content from file2
    if (file2Content) {
      fs.writeFileSync(file1Path, file2Content);

      console.log("Local data updated successfully.");
    } else {
      // console.log("File 2 does not exist. No update performed.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Define configurations for client app
const clientsAll = [
  {
    name: "Client",
    offlineFilePath: "./client/src/offline_data/createManufacturer.json",
    onlineFilePath: "./client/src/online_data/manufacturers.json",
  },
  {
    name: "Client 1",
    offlineFilePath: "./client-1/src/offline_data/createManufacturer.json",
    onlineFilePath: "./client-1/src/online_data/manufacturers.json",
  },
  // Add more clients as needed
];

// Function to compare and merge data for client
const compareAndMergeForAllClients = async () => {
  for (const client of clientsAll) {
    // console.log(`\nComparing and merging data for ${client.name}`);

    await compareAndMerge(client.offlineFilePath, client.onlineFilePath);
  }
};

// Set up recurring timer to compare and merge data for all clients every 3 minutes
setInterval(async () => {
  console.log(
    "\nFetching and updating data and comparing and merging data for all clients..."
  );
  await compareAndMergeForAllClients();

  await fetchAndUpdateForAllClients();
}, 180000); // 3 minutes in milliseconds
