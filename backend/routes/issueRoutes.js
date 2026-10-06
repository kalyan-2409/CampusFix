const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// CREATE ISSUE - STUDENT
// ======================================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            title,
            category,
            location,
            description,
            priority
        } = req.body;


        if (!title || !category || !location || !description) {

            return res.status(400).json({
                message: "Please provide all required fields."
            });

        }


        const [result] = await db.execute(

            `INSERT INTO issues
             (
                 title,
                 category,
                 location,
                 description,
                 priority,
                 status,
                 reportedBy
             )
             VALUES (?, ?, ?, ?, ?, 'Pending', ?)`

            ,

            [
                title,
                category,
                location,
                description,
                priority || "Medium",
                req.user.id
            ]

        );


        // Add initial status history

        await db.execute(

            `INSERT INTO status_history
             (
                 issue_id,
                 status,
                 changed_by
             )
             VALUES (?, 'Pending', ?)`

            ,

            [
                result.insertId,
                req.user.id
            ]

        );


        res.status(201).json({

            message:
                "Issue reported successfully.",

            issueId:
            result.insertId

        });


    } catch (error) {

        console.error(
            "Create issue error:",
            error
        );


        res.status(500).json({

            message:
                "Server error while creating issue."

        });

    }

});



// ======================================================
// GET MY ISSUES - STUDENT
// ======================================================

router.get("/my", authMiddleware, async (req, res) => {

    try {

        const [issues] = await db.execute(

            `SELECT
                 id,
                 title,
                 category,
                 location,
                 description,
                 priority,
                 status,
                 resolutionNote,
                 reportedBy,
                 createdAt,
                 updatedAt

             FROM issues

             WHERE reportedBy = ?

             ORDER BY createdAt DESC`

            ,

            [
                req.user.id
            ]

        );


        res.json(issues);


    } catch (error) {

        console.error(
            "Get my issues error:",
            error
        );


        res.status(500).json({

            message:
                "Server error while fetching issues."

        });

    }

});



// ======================================================
// GET ALL ISSUES - ADMIN
// ======================================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({

                message:
                    "Access denied. Admin only."

            });

        }


        const [issues] = await db.execute(

            `SELECT

                 i.id,
                 i.title,
                 i.category,
                 i.location,
                 i.description,
                 i.priority,
                 i.status,
                 i.resolutionNote,
                 i.reportedBy,
                 i.createdAt,
                 i.updatedAt,

                 u.name AS reporterName,
                 u.rollNo AS reporterRollNo,
                 u.email AS reporterEmail

             FROM issues i

                      JOIN users u
                           ON i.reportedBy = u.id

             ORDER BY i.createdAt DESC`

        );


        res.json(issues);


    } catch (error) {

        console.error(
            "Get all issues error:",
            error
        );


        res.status(500).json({

            message:
                "Server error while fetching issues."

        });

    }

});



// ======================================================
// UPDATE GROUP STATUS - ADMIN
// ======================================================
//
// IMPORTANT:
// This route MUST come BEFORE:
//
// router.put("/:id/status")
//
// Otherwise Express may treat "group" as the issue ID.
// ======================================================

router.put(
    "/group/status",
    authMiddleware,
    async (req, res) => {

        let connection;

        try {

            // --------------------------------------------------
            // ADMIN CHECK
            // --------------------------------------------------

            if (req.user.role !== "admin") {

                return res.status(403).json({

                    message:
                        "Access denied. Admin only."

                });

            }


            const {
                issueIds,
                status,
                resolutionNote
            } = req.body;


            // --------------------------------------------------
            // VALIDATE ISSUE IDS
            // --------------------------------------------------

            if (
                !Array.isArray(issueIds) ||
                issueIds.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "No issue IDs provided."

                });

            }


            // --------------------------------------------------
            // VALIDATE STATUS
            // --------------------------------------------------

            const validStatuses = [

                "Pending",

                "In Progress",

                "Resolved"

            ];


            if (!validStatuses.includes(status)) {

                return res.status(400).json({

                    message:
                        "Invalid status."

                });

            }


            // --------------------------------------------------
            // CLEAN ISSUE IDS
            // --------------------------------------------------

            const ids = [
                ...new Set(

                    issueIds
                        .map(Number)
                        .filter(
                            (id) =>
                                Number.isInteger(id) &&
                                id > 0
                        )

                )
            ];


            if (ids.length === 0) {

                return res.status(400).json({

                    message:
                        "Invalid issue IDs."

                });

            }


            // --------------------------------------------------
            // START DATABASE TRANSACTION
            // --------------------------------------------------

            connection = await db.getConnection();

            await connection.beginTransaction();


            // --------------------------------------------------
            // CREATE SQL PLACEHOLDERS
            // --------------------------------------------------

            const placeholders =
                ids.map(() => "?").join(",");


            // --------------------------------------------------
            // CHECK ALL ISSUES EXIST
            // --------------------------------------------------

            const [existingIssues] =
                await connection.execute(

                    `SELECT id
                     FROM issues
                     WHERE id IN (${placeholders})`,

                    ids

                );


            const existingIds =
                existingIssues.map(
                    (row) => Number(row.id)
                );


            if (
                existingIds.length !== ids.length
            ) {

                await connection.rollback();

                return res.status(404).json({

                    message:
                        "One or more issues were not found."

                });

            }


            // --------------------------------------------------
            // UPDATE ALL ISSUES
            // --------------------------------------------------

            await connection.execute(

                `UPDATE issues
                 SET
                    status = ?,
                    resolutionNote = ?
                 WHERE id IN (${placeholders})`,

                [
                    status,
                    resolutionNote || "",
                    ...ids
                ]

            );


            // --------------------------------------------------
            // ADD STATUS HISTORY
            // --------------------------------------------------

            for (const issueId of ids) {

                await connection.execute(

                    `INSERT INTO status_history
                    (
                        issue_id,
                        status,
                        changed_by
                    )
                    VALUES (?, ?, ?)`,

                    [
                        issueId,
                        status,
                        req.user.id
                    ]

                );

            }


            // --------------------------------------------------
            // COMMIT TRANSACTION
            // --------------------------------------------------

            await connection.commit();


            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            res.json({

                message:
                    `Group status updated successfully for ${ids.length} reports.`

            });


        } catch (error) {

            // --------------------------------------------------
            // ROLLBACK IF ERROR
            // --------------------------------------------------

            if (connection) {

                try {

                    await connection.rollback();

                } catch (rollbackError) {

                    console.error(
                        "Rollback error:",
                        rollbackError
                    );

                }

            }


            console.error(
                "Group status update error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while updating group status."

            });


        } finally {

            if (connection) {

                connection.release();

            }

        }

    }
);



// ======================================================
// UPDATE SINGLE ISSUE STATUS - ADMIN
// ======================================================

router.put("/:id/status", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({

                message:
                    "Access denied. Admin only."

            });

        }


        const issueId =
            req.params.id;


        const {
            status,
            resolutionNote
        } = req.body;


        const validStatuses = [

            "Pending",

            "In Progress",

            "Resolved"

        ];


        if (!validStatuses.includes(status)) {

            return res.status(400).json({

                message:
                    "Invalid status."

            });

        }


        const [existingIssues] =
            await db.execute(

                "SELECT id FROM issues WHERE id = ?",

                [
                    issueId
                ]

            );


        if (existingIssues.length === 0) {

            return res.status(404).json({

                message:
                    "Issue not found."

            });

        }


        await db.execute(

            `UPDATE issues
             SET
                status = ?,
                resolutionNote = ?
             WHERE id = ?`

            ,

            [
                status,
                resolutionNote || "",
                issueId
            ]

        );


        await db.execute(

            `INSERT INTO status_history
            (
                issue_id,
                status,
                changed_by
            )
            VALUES (?, ?, ?)`

            ,

            [
                issueId,
                status,
                req.user.id
            ]

        );


        res.json({

            message:
                "Issue status updated successfully."

        });


    } catch (error) {

        console.error(
            "Update status error:",
            error
        );


        res.status(500).json({

            message:
                "Server error while updating issue status."

        });

    }

});



// ======================================================
// GET ISSUE STATUS HISTORY
// ======================================================

router.get(
    "/:id/history",
    authMiddleware,
    async (req, res) => {

        try {

            const issueId =
                req.params.id;


            const [history] =
                await db.execute(

                    `SELECT

                        sh.id,
                        sh.issue_id,
                        sh.status,
                        sh.changed_at,
                        sh.changed_by,

                        u.name AS changedByName

                     FROM status_history sh

                     LEFT JOIN users u
                     ON sh.changed_by = u.id

                     WHERE sh.issue_id = ?

                     ORDER BY sh.changed_at ASC`

                    ,

                    [
                        issueId
                    ]

                );


            res.json(history);


        } catch (error) {

            console.error(
                "Get history error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while fetching history."

            });

        }

    }
);



// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;