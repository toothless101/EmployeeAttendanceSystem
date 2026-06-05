import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

let db;

async function connectDb(){
    try{
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        })
        console.log("Connected to the database successfully!")
    } catch (error) {
        console.error("Error connecting to the database:", error)
        process.exit(1)
    }
    return db;
}

export default connectDb;

