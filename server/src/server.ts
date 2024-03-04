import express = require("express");
import { connect, ConnectOptions } from "mongoose";
import { ManufacturerModel } from "./models/Manufacturers";
import { CarModelModel } from "./models/Models";

const app = express();
const PORT = process.env.PORT || 3000;

// Define route to check server health
app.get("/health", (req, res) =>
{
    res.send("Server is healthy and running");
});

// Connect to MongoDB
const options: ConnectOptions = {
    autoCreate: true,
    dbName: "car_management",
};

// Connect to the MongoDB database
connect('mongodb://localhost:27017/', options)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Define the JSON parser middleware
app.use(express.json());

// Define routes for POST operations on Create manufacturers
app.post('/manufacturers', async (req, res) => {
  try {
    const { name } = req.body;

    // Create a new instance of the ManufacturerModel with the provided name and manufacturer
    const newManufacturer = new ManufacturerModel({ name });

    // Save the newly created manufacturer to the database
    await newManufacturer.save();

    res.status(201).json(newManufacturer);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
});

// Handle GET request to retrieve all manufacturers
app.get('/manufacturers', async (req, res) => {
  try {
    // Fetch all manufacturers from the database
    const manufacturers = await ManufacturerModel.find();

    const carModels = await CarModelModel.find();

    // For each manufacturer, count the number of models associated with it
    const manufacturersWithModelCount = manufacturers.map((manufacturer) => {
      const modelCount = carModels.filter(
        (model) => model.manufacturer.toString() === manufacturer._id.toString()
      ).length;

      return {
        ...manufacturer.toJSON(),
        modelCount,
      };
    });

    res.status(200).json(manufacturersWithModelCount);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
});

// Define routes for POST operations on car models
app.post('/models', async (req, res) => {
  try {
    const { name, manufacturer } = req.body;

    const model = new CarModelModel({ name, manufacturer });

    await model.save();

    res.status(201).json(model);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
});

// Define routes for DELETE operations on manufacturers by ID
app.delete('/manufacturers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await ManufacturerModel.findByIdAndDelete(id);

    const models = await CarModelModel.find({ manufacturer: id });

    //a for...of loop instead of forEach. This is because forEach does not work well with async/await
    for (const model of models) {
      await CarModelModel.findByIdAndDelete(model._id);
    }

    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
});

// Define routes for GET operations on car models by manufacturer ID
app.get('/models', async (req, res) => {
  try {
    const { manufacturer } = req.query;

    const models = await CarModelModel.find({ manufacturer });

    // find each model by its manufacurer id
    const findModels = [];

    for (const model of models) {
      const foundModel = await CarModelModel.findById(model._id);

      findModels.push(foundModel);
    }

    res.status(200).json(findModels);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
});

app.listen(PORT, () =>
{
    console.log(`Server is running on port ${PORT}`);
});
