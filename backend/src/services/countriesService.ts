// import axios from 'axios';
// import Country from '../models/Country.js';
// import { ICountry } from '../models/Country.js';

// export class CountriesService {
//   private static readonly EXTERNAL_API_URL = 'https://restcountries.com/v3.1';

//   /**
//    * Fetch all countries from external API and sync to database
//    */
//   static async syncCountriesFromExternalAPI(): Promise<void> {
//     try {
//       console.log('🔄 Starting countries sync from external API...');
      
//       const response = await axios.get(
//         `${this.EXTERNAL_API_URL}/all?fields=name,capital,population,flags,region,subregion,area,languages,currencies,timezones,borders`
//       );

//       const externalCountries = response.data;
//       console.log(`📥 Fetched ${externalCountries.length} countries from external API`);

//       // Clear existing data
//       await Country.deleteMany({});
//       console.log('🗑️ Cleared existing countries from database');

//       // Insert new data
//       const countriesToInsert = externalCountries.map((country: any) => ({
//         name: {
//           common: country.name.common,
//           official: country.name.official
//         },
//         region: country.region,
//         subregion: country.subregion,
//         capital: country.capital,
//         population: country.population,
//         area: country.area,
//         flags: country.flags,
//         languages: country.languages ? new Map(Object.entries(country.languages)) : undefined,
//         currencies: country.currencies ? new Map(Object.entries(country.currencies)) : undefined,
//         timezones: country.timezones,
//         borders: country.borders
//       }));

//       await Country.insertMany(countriesToInsert);
//       console.log(`✅ Successfully synced ${countriesToInsert.length} countries to database`);
//     } catch (error) {
//       console.error('❌ Error syncing countries:', error);
//       throw new Error('Failed to sync countries from external API');
//     }
//   }

//   /**
//    * Get all countries from database with pagination and filtering
//    */
//   static async getAllCountries(options: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     region?: string;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
//   }) {
//     const {
//       page = 1,
//       limit = 25,
//       search,
//       region,
//       sortBy = 'name.common',
//       sortOrder = 'asc'
//     } = options;

//     // Build query
//     const query: any = {};

//     if (search) {
//       query.$or = [
//         { 'name.common': new RegExp(search, 'i') },
//         { 'name.official': new RegExp(search, 'i') },
//         { capital: { $elemMatch: { $regex: new RegExp(search, 'i') } } }
//       ];
//     }

//     if (region) {
//       query.region = new RegExp(region, 'i');
//     }

//     // Build sort object
//     const sort: any = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Execute query with pagination
//     const skip = (page - 1) * limit;
    
//     const [countries, total] = await Promise.all([
//       Country.find(query)
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Country.countDocuments(query)
//     ]);

//     return {
//       countries,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     };
//   }

//   /**
//    * Get country by ID
//    */
//   static async getCountryById(id: string): Promise<any> {
//     return Country.findById(id).lean();
//   }

//   /**
//    * Search countries by name
//    */
//   static async searchCountries(searchTerm: string): Promise<any[]> {
//     return Country.find({
//       $or: [
//         { 'name.common': new RegExp(searchTerm, 'i') },
//         { 'name.official': new RegExp(searchTerm, 'i') }
//       ]
//     })
//     .limit(20)
//     .lean();
//   }

//   /**
//    * Get countries by region
//    */
//   static async getCountriesByRegion(region: string): Promise<any[]> {
//     return Country.find({ region: new RegExp(region, 'i') }).lean();
//   }

//   /**
//    * Get country statistics
//    */
//   static async getCountriesStats() {
//     const [
//       totalCountries,
//       regionStats,
//       populationStats
//     ] = await Promise.all([
//       Country.countDocuments(),
//       Country.aggregate([
//         {
//           $group: {
//             _id: '$region',
//             count: { $sum: 1 },
//             totalPopulation: { $sum: '$population' }
//           }
//         },
//         { $sort: { count: -1 } }
//       ]),
//       Country.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalPopulation: { $sum: '$population' },
//             avgPopulation: { $avg: '$population' },
//             maxPopulation: { $max: '$population' },
//             minPopulation: { $min: '$population' }
//           }
//         }
//       ])
//     ]);

//     return {
//       totalCountries,
//       regionStats,
//       populationStats: populationStats[0] || {
//         totalPopulation: 0,
//         avgPopulation: 0,
//         maxPopulation: 0,
//         minPopulation: 0
//       }
//     };
//   }
// }