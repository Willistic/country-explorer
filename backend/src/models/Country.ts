import mongoose, { Schema, Document } from 'mongoose';

// Interface for TypeScript
export interface ICountry extends Document {
  name: {
    common: string;
    official?: string;
  };
  region: string;
  subregion?: string;
  capital?: string[];
  population: number;
  area?: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  languages?: { [key: string]: string };
  currencies?: { [key: string]: { name: string; symbol: string } };
  timezones?: string[];
  borders?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const CountrySchema: Schema = new Schema(
  {
    name: {
      common: { type: String, required: true, index: true },
      official: { type: String }
    },
    region: { type: String, required: true, index: true },
    subregion: { type: String, index: true },
    capital: [{ type: String }],
    population: { type: Number, required: true, index: true },
    area: { type: Number },
    flags: {
      png: { type: String, required: true },
      svg: { type: String, required: true },
      alt: { type: String }
    },
    languages: { type: Map, of: String },
    currencies: {
      type: Map,
      of: {
        name: String,
        symbol: String
      }
    },
    timezones: [{ type: String }],
    borders: [{ type: String }]
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: 'countries'
  }
);

// Indexes for better performance
CountrySchema.index({ 'name.common': 'text', region: 1 });
CountrySchema.index({ region: 1, population: -1 });
CountrySchema.index({ population: -1 });

// Static methods
CountrySchema.statics.findByRegion = function(region: string) {
  return this.find({ region: new RegExp(region, 'i') });
};

CountrySchema.statics.searchByName = function(name: string) {
  return this.find({
    'name.common': new RegExp(name, 'i')
  });
};

// Instance methods
CountrySchema.methods.getNeighbors = function() {
  if (!this.borders || this.borders.length === 0) {
    return [];
  }
  return mongoose.model('Country').find({
    'name.common': { $in: this.borders }
  });
};

export default mongoose.model<ICountry>('Country', CountrySchema);