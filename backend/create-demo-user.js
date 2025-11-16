import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		favorites: [{ type: String, default: [] }],
	},
	{ timestamps: true, collection: "users" }
);

const User = mongoose.model("User", UserSchema);

async function createDemoUser() {
	try {
		const mongoUri =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/country-explorer";
		await mongoose.connect(mongoUri);
		console.log("Connected to MongoDB");

		// Check if demo user exists
		const existing = await User.findOne({
			email: "demo@countryexplorer.com",
		});
		if (existing) {
			console.log("Demo user already exists!");
			await mongoose.connection.close();
			return;
		}

		// Hash password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash("Demo123!@#", salt);

		// Create demo user
		const demoUser = new User({
			email: "demo@countryexplorer.com",
			password: hashedPassword,
			firstName: "Demo",
			lastName: "User",
			favorites: [],
		});

		await demoUser.save();
		console.log("✅ Demo user created successfully!");
		console.log("Email: demo@countryexplorer.com");
		console.log("Password: Demo123!@#");

		await mongoose.connection.close();
	} catch (error) {
		console.error("Error creating demo user:", error);
		process.exit(1);
	}
}

createDemoUser();
