import mongoose = require("mongoose");
import { secrets } from "../configs";

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(secrets.mongodbUri!, {
			maxPoolSize: 10, // Set the maximum number of connections in the pool
		});
		console.info(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

export default connectDB;
