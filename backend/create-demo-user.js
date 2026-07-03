import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
	{ timestamps: true, collection: "users" },
);

const User = mongoose.model("User", UserSchema);

async function createDemoUser() {
	// Never seed a demo account against production data.
	if (process.env.NODE_ENV === "production") {
		console.error("Refusing to run the demo seed in production.");
		process.exit(1);
	}

	const email = process.env.DEMO_USER_EMAIL;
	if (!email) {
		console.error("DEMO_USER_EMAIL is not set. Add it to backend/.env.");
		process.exit(1);
	}

	// Use a provided password, or generate a strong random one for local dev.
	const providedPassword = process.env.DEMO_USER_PASSWORD;
	const password =
		providedPassword || crypto.randomBytes(12).toString("base64url");

	try {
		const mongoUri =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/country-explorer";
		await mongoose.connect(mongoUri);

		// Check if demo user exists
		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			console.log(`Demo user ${email} already exists. Skipping.`);
			await mongoose.connection.close();
			return;
		}

		// Hash password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create demo user
		const demoUser = new User({
			email: email.toLowerCase(),
			password: hashedPassword,
			firstName: "Demo",
			lastName: "User",
			favorites: [],
		});

		await demoUser.save();
		console.log(`Demo user created: ${email}`);
		// Only reveal a password we generated ourselves, for local dev convenience.
		if (!providedPassword) {
			console.log(`Generated password (shown once): ${password}`);
		}

		await mongoose.connection.close();
	} catch (error) {
		console.error("Error creating demo user:", error.message);
		process.exit(1);
	}
}

createDemoUser();
