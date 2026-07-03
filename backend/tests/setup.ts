import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Spin up an in-memory MongoDB so tests are hermetic and don't touch a real DB.
let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Reset collections between tests for isolation.
afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
