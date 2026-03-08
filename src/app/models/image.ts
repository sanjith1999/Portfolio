import mongoose, { Document, Model } from 'mongoose';

export interface ImageDoc extends Document {
  filename: string;
  contentType: string;
  imageData: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new mongoose.Schema<ImageDoc>(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    imageData: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { timestamps: true }
);

let ImageModel: Model<ImageDoc>;
try {
  ImageModel = mongoose.model<ImageDoc>('Image');
} catch {
  ImageModel = mongoose.model<ImageDoc>('Image', ImageSchema);
}

export default ImageModel;
