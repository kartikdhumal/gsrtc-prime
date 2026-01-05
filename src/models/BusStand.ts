import mongoose, { Schema, Document } from "mongoose";

export interface IBusStand extends Document {
  name: string;      
  location: string;  
  code: string;   
  district: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const BusStandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    district: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.BusStand ||
  mongoose.model<IBusStand>("BusStand", BusStandSchema);