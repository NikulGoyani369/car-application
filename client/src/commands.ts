import axios from "axios";
import { table } from "node:console";
import {
  cacheCommand,
  commandCache,
  executeCachedCommands,
} from "../../server/commandCache";
import { handleOfflineRequest } from "./offlineRequest";
import mongoose from 'mongoose';
import { fetchServerData } from '../../server/src/fetchDataFromServer';
import { ManufacturerModel } from '../../server/src/model/Manufacturer';
import { CarModelModel } from '../../server/src/model/Model';

// Function to check if the server is running
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('http://localhost:3000/health');

    console.log(' \n Server response:', response.data);

    return true;
  } catch (error: any) {
    console.error(' \n Error checking server status:', error.message);
    return false;
  }
};

// Create a new manufacturer and save it to the database
export const createManufacturer = async (name: string) => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();

    const fetchAndUpdateForAllClients = async () => {
      const clients = [
        {
          name: 'Client',
          onlineDataDir: './client/src/online_data',
          serverEndpoint: ['http ://localhost:3000/manufacturer'],
          offlineFilePath: [
            './client/src/offline_data/createManufacturer.json',
          ],
        },
        {
          name: 'Client 1',
          onlineDataDir: './client-1/src/online_data',
          serverEndpoint: ['http://localhost:3000/manufacturer'],
          offlineFilePath: [
            './client-1/src/offline_data/createManufacturer.json',
          ],
        },
      ];

      for (const client of clients) {
        console.log(`\nUpdating data for ${client.name}`);
        await fetchServerData(
          client.onlineDataDir,
          client.serverEndpoint,
          client.offlineFilePath
        );
      }
    };

    await fetchAndUpdateForAllClients();

    if (!serverStatus) {
      console.log('You are currently offline. Saving data locally...');

      // If the server is offline, cache the command and save data locally
      cacheCommand(createManufacturer, name);

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
      // Merge new filtered data with existing data
      // const newDataFiltered = await compareAndMerge(serverData, mergedData);

      // Serialize the data to JSON format
      // console.log("Data saved locally in file: manufacturers.json", newDataFiltered);

      // If the server is online, create the manufacturer via API
      console.log(
        'Manufacturer created successfully: ',
        `createManufacturer: ${name}`
      );

      await axios.post('http://localhost:3000/manufacturer', {
        name,
      });

      // Execute cached commands if there are any
      if (commandCache.length > 0) {
        console.log('Server is online. Executing cached commands...');

        await executeCachedCommands();

        console.log(' \n Cached commands executed successfully.');
      }
    }
  } catch (error) {
    return {
      status: 400,
      data: 'Error creating manufacturer for post',
      statusText: 'Bad Request',
    };
  }
};

// List all manufacturers from the database
export const listManufacturers = async () => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log('You are currently offline. Saving data locally...');

      // If the server is offline, cache the command and save data locally
      // cacheCommand(`listManufacturers()`);

      // Save data locally
      handleOfflineRequest({ listManufacturers: [] });
    } else {
      // If the server is online, create the manufacturer via API
      console.log('You are currently online. Processing cached commands...');

      const response = await axios.get('http://localhost:3000/manufacturer');

      table(response.data);

      // Process cached commands when online
      await executeCachedCommands();

      return response.data;
    }
  } catch (error) {
    return {
      status: 400,
      data: 'No manufacturers found',
      statusText: 'Bad Request',
    };
  }
};

// Delete a manufacturer by ID from the database
export const deleteManufacturerById = async (manufacturerId: string) => {
  try {
    // Check if the server is running
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log('You are currently offline. Saving data locally...');

      // If the server is offline, cache the command and save data locally
      cacheCommand(deleteManufacturerById, manufacturerId);

      // Save data locally
      handleOfflineRequest({
        deleteManufacturerById: [{ _id: manufacturerId }],
      });
    } else {
      // If the server is online delete the manufacturer by ID via API
      console.log('Manufacturer deleted successfully.');

      const response = await axios.delete(
        `http://localhost:3000/manufacturer/${manufacturerId}`
      );

      const models = await axios.get(`http://localhost:3000/model`);

      const modelsData = models.data;

      modelsData.forEach(async (model: { manufacturer: string }) => {
        if (model.manufacturer === manufacturerId) {
          await axios.delete(
            `http://localhost:3000/model/${model.manufacturer}`
          );
        }
      });

      // Process cached commands when online
      await executeCachedCommands();

      return response.data;
    }
  } catch (error) {
    return {
      status: 400,
      data: 'Error deleting manufacturer',
      statusText: 'Bad Request',
    };
  }
};

// View models by manufacturer ID from the database
export const viewModelsByManufacturerId = async (vieModelByID: string) => {
  try {
    const serverStatus = await checkServerStatus();

    if (!serverStatus) {
      console.log('You are currently offline. Saving data locally...');

      cacheCommand(viewModelsByManufacturerId, vieModelByID);

      handleOfflineRequest({
        viewModelsByManufacturerId: [{ _id: vieModelByID }],
      });
    } else {
      console.log('You are currently online. Processing cached commands...');

      console.log('List of models by manufacturer ID:');

      const response = await axios.get(
        `http://localhost:3000/model?manufacturer=${vieModelByID}`
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
      data: 'Error viewing models by manufacturer ID',
      statusText: 'Bad Request',
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
      console.log('You are currently offline. Saving data locally...');

      cacheCommand(addModelByManufacturerId, addModelByID, modelName);

      // Save data locally
      handleOfflineRequest({
        addModelByManufacturerId: [
          new CarModelModel({
            addModelByID,
            name: modelName,
          }),
        ],
      });
    } else {
      console.log('Model added successfully.');

      const response = await axios.post(`http://localhost:3000/model`, {
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
      data: 'Error adding models by manufacturer ID',
      statusText: 'Bad Request',
    };
  }
};
