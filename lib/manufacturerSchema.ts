import { Schema, model, Document } from "mongoose";

export interface Manufacturer extends Document {
  name: string;
}

const ManufacturerSchema: Schema = new Schema({
  name: { type: String, required: true },
},
    // Specify singular the collection name;
    {collection: 'manufacturer'});

export const ManufacturerModel = model<Manufacturer>(
  "Manufacturer",
  ManufacturerSchema
);
