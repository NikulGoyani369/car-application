import { Schema, Document, Types, model } from "mongoose";

export interface CarModel extends Document {
  name: string;

  manufacturer: Types.ObjectId;
}

const CarModelSchema: Schema = new Schema({
  name: { type: String, required: true },

  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  },
},
    // Specify singular the collection name
    {collection: 'carModel'});

export const CarModelModel = model<CarModel>("CarModel", CarModelSchema);
