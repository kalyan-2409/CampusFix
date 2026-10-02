const express = require("express");
const Issue = require("../models/Issue");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CREATE NEW ISSUE
// POST /api/issues
// =====================================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            title,
            category,
            location,
            description,
            priority
        } = req.body;


        // Validate required fields
        if (
            !title ||
            !category ||
            !location ||
            !description
        ) {

            return res.status(400).json({
                message: "Please fill all required fields"
            });

        }


        // Create issue
        const issue = new Issue({

            title,

            category,

            location,

            description,

            priority: priority || "Medium",

            status: "Pending",

            statusHistory: [
                {
                    status: "Pending",
                    changedAt: new Date(),
                    changedBy: req.user.id
                }
            ],

            reportedBy: req.user.id

        });


        await issue.save();


        res.status(201).json({

            message: "Issue reported successfully",

            issue

        });


    } catch (error) {

        console.error(
            "Create issue error:",
            error
        );

        res.status(500).json({

            message: "Failed to report issue",

            error: error.message

        });

    }

});


// =====================================================
// GET MY ISSUES
// GET /api/issues/my
// =====================================================

router.get("/my", authMiddleware, async (req, res) => {

    try {

        const issues = await Issue.find({

            reportedBy: req.user.id

        }).sort({

            createdAt: -1

        });


        res.status(200).json({

            count: issues.length,

            issues

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch issues",

            error: error.message

        });

    }

});


// =====================================================
// GET ALL ISSUES
// ADMIN ONLY
// GET /api/issues
// =====================================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({

                message: "Access denied. Admin only."

            });

        }


        const issues = await Issue.find()

            .populate(
                "reportedBy",
                "name rollNo email"
            )

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            count: issues.length,

            issues

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch all issues",

            error: error.message

        });

    }

});


// =====================================================
// UPDATE ISSUE STATUS
// ADMIN ONLY
// PUT /api/issues/:id/status
// =====================================================

router.put(
    "/:id/status",
    authMiddleware,
    async (req, res) => {

        try {

            // Check admin
            if (req.user.role !== "admin") {

                return res.status(403).json({

                    message:
                        "Access denied. Admin only."

                });

            }


            const {
                status,
                resolutionNote
            } = req.body;


            const validStatuses = [

                "Pending",

                "In Progress",

                "Resolved"

            ];


            // Validate status
            if (!validStatuses.includes(status)) {

                return res.status(400).json({

                    message: "Invalid status"

                });

            }


            // Find issue
            const issue = await Issue.findById(
                req.params.id
            );


            if (!issue) {

                return res.status(404).json({

                    message: "Issue not found"

                });

            }


            // If status is unchanged
            if (issue.status === status) {

                if (status === "Resolved") {

                    issue.resolutionNote =
                        resolutionNote?.trim() || "";

                    await issue.save();

                }


                return res.status(200).json({

                    message:
                        "Issue updated successfully",

                    issue

                });

            }


            // Update status
            issue.status = status;


            // Resolution note
            if (status === "Resolved") {

                issue.resolutionNote =
                    resolutionNote?.trim() || "";

            } else {

                issue.resolutionNote = "";

            }


            // Add status history
            issue.statusHistory.push({

                status: status,

                changedAt: new Date(),

                changedBy: req.user.id

            });


            await issue.save();


            res.status(200).json({

                message:
                    "Issue status updated successfully",

                issue

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update issue status",

                error: error.message

            });

        }

    }
);


module.exports = router;