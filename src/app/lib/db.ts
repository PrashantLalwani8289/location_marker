// This is a MongoDB database implementation

import { MongoClient, ObjectId, MongoError } from 'mongodb';

const uri = "mongodb+srv://prashantlalwani8289:lQVxY9DckQGwIJQH@cluster0.swrms.mongodb.net/positions";
const dbName = "positions";

interface Marker {
  _id?: ObjectId;
  name: string;
  lat: number;
  lng: number;
  type?: string; // Emoji type for the marker
}

let client: MongoClient | null = null;

async function connectToDatabase() {
  try {
    if (!client) {
      console.log('Establishing new MongoDB connection...');
      client = new MongoClient(uri);
      await client.connect();
      console.log('Successfully connected to MongoDB');
    }
    return { client, db: client.db(dbName) };
  } catch (error) {
    console.error('MongoDB connection error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to connect to database');
  }
}

export const db = {
  async getMarkers(): Promise<Marker[]> {
    try {
      console.log('Fetching markers from database...');
      const { db } = await connectToDatabase();
      const markers = await db.collection<Marker>('markers').find({}).toArray();
      console.log(`Successfully fetched ${markers.length} markers`);
      return markers as Marker[];
    } catch (error) {
      const errorDetails = {
        operation: 'getMarkers',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        isMongoError: error instanceof MongoError,
      };
      console.error('Database error:', errorDetails);
      return [];
    }
  },

  async addMarker(lat: number, lng: number, name: string, type?: string): Promise<Marker> {
    try {
      console.log('Adding new marker:', { lat, lng, name });
      const { db } = await connectToDatabase();
      const marker: Marker = { lat, lng, name, type };
      const result = await db.collection<Marker>('markers').insertOne(marker);
      console.log('Successfully added marker with ID:', result.insertedId.toString());
      return { ...marker, _id: result.insertedId };
    } catch (error) {
      const errorDetails = {
        operation: 'addMarker',
        coordinates: { lat, lng },
        name,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        isMongoError: error instanceof MongoError,
      };
      console.error('Database error:', errorDetails);
      throw error;
    }
  },

  async updateMarkerPosition(markerId: string, lat: number, lng: number): Promise<boolean> {
    try {
      console.log('Updating marker position:', { markerId, lat, lng });
      const { db } = await connectToDatabase();
      const result = await db.collection<Marker>('markers').updateOne(
        { _id: new ObjectId(markerId) },
        { $set: { lat, lng } }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Marker not found');
      }
      
      console.log('Successfully updated marker position');
      return true;
    } catch (error) {
      const errorDetails = {
        operation: 'updateMarkerPosition',
        markerId,
        coordinates: { lat, lng },
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        isMongoError: error instanceof MongoError,
      };
      console.error('Database error:', errorDetails);
      throw error;
    }
  },

  async deleteMarker(markerId: string): Promise<boolean> {
    try {
      console.log('Deleting marker:', markerId);
      const { db } = await connectToDatabase();
      const result = await db.collection<Marker>('markers').deleteOne({
        _id: new ObjectId(markerId)
      });
      
      if (result.deletedCount === 0) {
        throw new Error('Marker not found');
      }
      
      console.log('Successfully deleted marker');
      return true;
    } catch (error) {
      const errorDetails = {
        operation: 'deleteMarker',
        markerId,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        isMongoError: error instanceof MongoError,
      };
      console.error('Database error:', errorDetails);
      throw error;
    }
  }
};
