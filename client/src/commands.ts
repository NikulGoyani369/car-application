import axios from "axios";
import { table } from "node:console";
import { cacheCommand, commandCache, executeCachedCommands } from "../../lib";
import { getOfflineData, handleOfflineRequest } from "./offlineRequest";
import mongoose from "mongoose";
import { fetchServerData } from "../../server/src/fetchDataFromServer";
import { CarModelModel, ManufacturerModel } from "../../lib";
import { get } from "node:http";

// Function to check if the server is running
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('http://localhost:3000/health');

    console.log(' \n Server response:', response.data);

    // If the server is running, execute cached commands
    if (response.status === 200) {
      console.log('Server is running. Executing cached commands...');
      await executeCachedCommands();
    }

    return true;
  } catch (error: any) {
    console.error(" \n Error checking server status:", error.message);
    return false;
  }
};

// Create a new manufacturer and save it to the database
export const createManufacturer = async (name: string) => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();
    if (!serverStatus) {
      console.log("You are currently offline. Saving cached data ...");

      // If the server is offline, cache the command and save data locally
      cacheCommand(createManufacturer, name);

      // Save data locally in the cache
      handleOfflineRequest({
        createManufacturer: [
          new ManufacturerModel({
            name,
            _id: new mongoose.Types.ObjectId().toHexString(),
            __v: 0,
            modelCount: 0,
          }),
        ],
      });
    } else {
      // If the server is online, create the manufacturer via API
      console.log(
        "Manufacturer created successfully: ",
        `createManufacturer: ${name}`
      );

      await axios.post("http://localhost:3000/manufacturers", {
        name,
      });

      // Execute cached commands if there are any
      if (commandCache.length > 0) {
        console.log("Server is online. Executing cached commands...");

        await executeCachedCommands();

        console.log(" \n Cached commands executed successfully.");
      }
    }
  } catch (error) {
    return {
      status: 400,
      data: "Error creating manufacturer for post",
      statusText: "Bad Request",
    };
  }
};

// List all manufacturers from the database
export const listManufacturers = async () => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log('You are currently offline retrieving data...');

      // Retrieve the last created manufacturer from the cache storage
      const lastCachedManufacturer = getOfflineData('createManufacturer');

      // Extract and format the properties of the nested object
      const formattedData = Object.keys(lastCachedManufacturer).map((key) => {
        return {
          key,
          value: lastCachedManufacturer[key],
        };
      });

      // Extract only relevant properties for display
      const data = formattedData.map((item) => {
        return {
          name: item.value.name,
          _id: item.value._id.toString(), // Convert ObjectId to string
          __v: item.value.__v,
        };
      });

      // Display the formatted data in a table format
      console.table(data);

      // if (lastCachedManufacturer && lastCachedManufacturer.length > 0) {
      // console.log('Last cached manufacturer:');
      // console.table(lastCachedManufacturer);
      // for (const manufacturer of lastCachedManufacturer) {
      //   console.table(`${manufacturer.name}`);
      //   table(manufacturer);
      // }

      // lastCachedManufacturer.forEach((manufacturer: { name: any }) => {
      //   console.table(`${manufacturer.name}`);
      //   table(manufacturer.name);
      // });
      // } else {
      // console.log('No cached manufacturers found.');
      // }

      // Retrieve cached manufacturers from listManufacturers
      // const cachedManufacturers = getOfflineData("listManufacturers");

      // if (cachedManufacturers && cachedManufacturers.length > 0) {
      //   console.log("Cached manufacturers:");
      //   cachedManufacturers.forEach((manufacturer: { name: any }) => {
      //     console.log(`- ${manufacturer.name}`);
      //   });
      // } else {
      //   console.log("No cached manufacturers found.");
      // }

      // // Cache the command for listManufacturers
      // cacheCommand(listManufacturers);

      // Save data locally
    } else {
      // If the server is online, create the manufacturer via API
      console.log("You are currently online. Processing cached commands...");

      const response = await axios.get("http://localhost:3000/manufacturers");

      table(response.data);

      // Process cached commands when online
      await executeCachedCommands();

      return response.data;
    }
  } catch (error) {
    return {
      status: 400,
      data: "No manufacturers found",
      statusText: "Bad Request",
    };
  }
};

// Delete a manufacturer by ID from the database
export const deleteManufacturerById = async (manufacturerId: string) => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log("You are currently offline. Saving data locally...");

      // If the server is offline, cache the command and save data locally
      cacheCommand(deleteManufacturerById, manufacturerId);

      // Save data locally
      handleOfflineRequest({
        deleteManufacturerById: [{ _id: manufacturerId }],
      });
    } else {
      // If the server is online delete the manufacturer by ID via API
      console.log("Manufacturer deleted successfully.");

      const response = await axios.delete(
        `http://localhost:3000/manufacturers/${manufacturerId}`
      );

      const models = await axios.get(`http://localhost:3000/models`);

      const modelsData = models.data;

      for (const model of modelsData) {
        if (model.manufacturer === manufacturerId) {
          await axios.delete(
            `http://localhost:3000/models/${model.manufacturer}`
          );
        }
      }

      // Process cached commands when online
      await executeCachedCommands();

      return response.data;
    }
  } catch (error) {
    return {
      status: 400,
      data: "Error deleting manufacturer",
      statusText: "Bad Request",
    };
  }
};

// View models by manufacturer ID from the database
export const viewModelsByManufacturerId = async (vieModelByID: string) => {
  try {
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log("You are currently offline. Saving data locally...");

      cacheCommand(viewModelsByManufacturerId, vieModelByID);

      handleOfflineRequest({
        viewModelsByManufacturerId: [{ _id: vieModelByID }],
      });
    } else {
      console.log("You are currently online. Processing cached commands...");

      console.log("List of models by manufacturer ID:");

      const response = await axios.get(
        `http://localhost:3000/models?manufacturer=${vieModelByID}`
      );

      const models = response.data;

      table(models);

      // Process cached commands when online
      await executeCachedCommands();

      return models;
    }
  } catch (error) {
    return {
      status: 400,
      data: "Error viewing models by manufacturer ID",
      statusText: "Bad Request",
    };
  }
};

// Add a new model by manufacturer ID to the database
export const addModelByManufacturerId = async (
  addModelByID: string,
  modelName: string
) => {
  try {
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log("You are currently offline. Saving data locally...");

      cacheCommand(addModelByManufacturerId, addModelByID, modelName);

      // Save data locally
      handleOfflineRequest({
        addModelByManufacturerId: [
          new CarModelModel({
            addModelByID,
            name: modelName,
            _id: addModelByManufacturerId,
          }),
        ],
      });
    } else {
      console.log("Model added successfully.");

      const response = await axios.post(`http://localhost:3000/models`, {
        name: modelName,
        manufacturer: addModelByID,
      });

      // Process cached commands when online
      await executeCachedCommands();

      return response.data;
    }
  } catch (error) {
    return {
      status: 400,
      data: "Error adding models by manufacturer ID",
      statusText: "Bad Request",
    };
  }
};
