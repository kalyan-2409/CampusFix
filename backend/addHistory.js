const mongoose = require("mongoose");
require("dotenv").config();

const Issue = require("./models/Issue");

async function addHistory() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB connected");

        const issues = await Issue.find();

        for (const issue of issues) {

            // Only add history if it doesn't exist
            if (
                !issue.statusHistory ||
                issue.statusHistory.length === 0
            ) {

                issue.statusHistory = [
                    {
                        status: issue.status,
                        changedAt: issue.updatedAt || new Date(),
                        changedBy: issue.reportedBy
                    }
                ];

                await issue.save();

                console.log(
                    `History added: ${issue.title}`
                );

            } else {

                console.log(
                    `History already exists: ${issue.title}`
                );

            }

        }

        console.log(
            "Status history migration completed."
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "Migration failed:",
            error.message
        );

        await mongoose.disconnect();

    }

}

addHistory();