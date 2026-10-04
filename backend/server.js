const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CampusFix API is running successfully!"
    });
});

async function startServer() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL connected successfully");

        connection.release();

        app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
            console.log(
                `CampusFix server running on port ${process.env.PORT || 5001}`
            );
        });

    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
}

startServer();
