const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
    {
        // ==========================================
        // ISSUE TITLE
        // ==========================================

        title: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // CATEGORY
        // ==========================================

        category: {
            type: String,
            enum: [
                "Laboratory",
                "Classroom",
                "Wi-Fi",
                "Water",
                "Cleaning",
                "Electrical",
                "Furniture",
                "Other"
            ],
            required: true
        },


        // ==========================================
        // LOCATION
        // ==========================================

        location: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // DESCRIPTION
        // ==========================================

        description: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // PRIORITY
        // ==========================================

        priority: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High"
            ],
            default: "Medium"
        },


        // ==========================================
        // CURRENT STATUS
        // ==========================================

        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Resolved"
            ],
            default: "Pending"
        },


        // ==========================================
        // RESOLUTION NOTE
        // ==========================================

        resolutionNote: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // STATUS HISTORY
        // ==========================================

        statusHistory: [

            {
                status: {
                    type: String,
                    enum: [
                        "Pending",
                        "In Progress",
                        "Resolved"
                    ],
                    required: true
                },

                changedAt: {
                    type: Date,
                    default: Date.now
                },

                changedBy: {
                    type:
                    mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            }

        ],


        // ==========================================
        // REPORTED BY
        // ==========================================

        reportedBy: {
            type:
            mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true
        }

    },

    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Issue",
    issueSchema
);