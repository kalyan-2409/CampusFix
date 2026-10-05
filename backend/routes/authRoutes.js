const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();


// ======================================================
// BREVO EMAIL CONFIGURATION
// ======================================================
// Uses Brevo's HTTPS API instead of SMTP.
// This avoids Render Free's outbound SMTP-port restriction.

async function sendEmailWithBrevo({ to, subject, textContent, htmlContent }) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is not configured.");
    }

    if (!process.env.SMTP_FROM) {
        throw new Error("SMTP_FROM is not configured.");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "CampusFix",
                email: process.env.SMTP_FROM
            },
            to: [{ email: to }],
            subject,
            textContent,
            htmlContent
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API error ${response.status}: ${errorText}`);
    }

    return response.json();
}

// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            rollNo,
            email,
            password,
            role
        } = req.body;


        if (!name || !rollNo || !email || !password) {

            return res.status(400).json({
                message:
                    "Please provide all required fields."
            });

        }


        const [existingUsers] =
            await db.execute(

                `SELECT id
FROM users
WHERE email = ?
    OR rollNo = ?`,

                [
                    email,
                    rollNo
                ]

            );


        if (existingUsers.length > 0) {

            return res.status(400).json({

                message:
                    "Email or Roll Number already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Students cannot register themselves as admin

        const userRole =
            role === "admin"
                ? "admin"
                : "student";


        const [result] =
            await db.execute(

                `INSERT INTO users
(
    name,
    rollNo,
    email,
    password,
    role
)
VALUES (?, ?, ?, ?, ?)`,

                [
                    name,
                    rollNo,
                    email,
                    hashedPassword,
                    userRole
                ]

            );


        res.status(201).json({

            message:
                "Registration successful.",

            user: {

                id:
                result.insertId,

                name,

                rollNo,

                email,

                role:
                userRole

            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            message:
                "Server error during registration."

        });

    }

});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required."

            });

        }


        const [users] =
            await db.execute(

                `SELECT *
FROM users
WHERE email = ?`,

                [
                    email
                ]

            );


        if (users.length === 0) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        const user =
            users[0];


        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        // ==================================================
        // ADMIN → OTP REQUIRED
        // ==================================================

        if (user.role === "admin") {

            // Generate 6-digit OTP

            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();


            // Hash OTP before storing

            const otpHash =
                crypto
                    .createHash("sha256")
                    .update(otp)
                    .digest("hex");


            // OTP expires after 5 minutes

            const expiresAt =
                new Date(
                    Date.now() +
                    5 * 60 * 1000
                );


            // Remove previous unused OTPs

            await db.execute(

                `DELETE FROM admin_otps
WHERE user_id = ?
    AND used = FALSE`,

                [
                    user.id
                ]

            );


            // Store hashed OTP

            await db.execute(

                `INSERT INTO admin_otps
(
    user_id,
    otp_hash,
    expires_at,
    attempts,
    used
)
VALUES (?, ?, ?, 0, FALSE)`,

                [
                    user.id,
                    otpHash,
                    expiresAt
                ]

            );


            // Send OTP email

            try {

                await sendEmailWithBrevo({
                    to: user.email,
                    subject: "CampusFix Admin Login OTP",
                    textContent:
                        `Your CampusFix admin login OTP is ${otp}. It expires in 5 minutes. Do not share this OTP with anyone.`,
                    htmlContent: `
<div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>CampusFix Admin Login</h2>
<p>Your one-time password is:</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px">
    ${otp}
</div>
<p>This OTP expires in <b>5 minutes</b>.</p>
<p>Do not share this OTP with anyone.</p>
</div>
`
                });


            } catch (emailError) {

                console.error(
                    "OTP email error:",
                    emailError
                );


                // Remove OTP if email failed

                await db.execute(

                    `DELETE FROM admin_otps
WHERE user_id = ?
    AND used = FALSE`,

                    [
                        user.id
                    ]

                );


                return res.status(500).json({

                    message:
                        "Unable to send OTP email. Please check email configuration."

                });

            }


            // Do NOT issue JWT yet

            return res.json({

                requiresOtp:
                    true,

                message:
                    "OTP sent to the admin email."

            });

        }


        // ==================================================
        // STUDENT LOGIN
        // ==================================================

        const token =
            jwt.sign(

                {
                    id:
                    user.id,

                    email:
                    user.email,

                    role:
                    user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        res.json({

            message:
                "Login successful.",

            token,

            user: {

                id:
                user.id,

                name:
                user.name,

                rollNo:
                user.rollNo,

                email:
                user.email,

                role:
                user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            message:
                "Server error during login."

        });

    }

});


// ======================================================
// VERIFY ADMIN OTP
// ======================================================

router.post(
    "/verify-otp",
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            if (!email || !otp) {

                return res.status(400).json({

                    message:
                        "Email and OTP are required."

                });

            }


            // Find admin

            const [users] =
                await db.execute(

                    `SELECT *
FROM users
WHERE email = ?
    AND role = 'admin'`,

                    [
                        email
                    ]

                );


            if (users.length === 0) {

                return res.status(401).json({

                    message:
                        "Invalid admin account."

                });

            }


            const user =
                users[0];


            // Get latest unused OTP

            const [otpRows] =
                await db.execute(

                    `SELECT *
FROM admin_otps
WHERE user_id = ?
    AND used = FALSE
ORDER BY id DESC
LIMIT 1`,

                    [
                        user.id
                    ]

                );


            if (otpRows.length === 0) {

                return res.status(400).json({

                    message:
                        "OTP not found. Please login again."

                });

            }


            const otpRecord =
                otpRows[0];


            // Check expiration

            if (
                new Date(
                    otpRecord.expires_at
                ) < new Date()
            ) {

                await db.execute(

                    `UPDATE admin_otps
SET used = TRUE
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(400).json({

                    message:
                        "OTP has expired. Please login again."

                });

            }


            // Maximum 5 attempts

            if (
                otpRecord.attempts >= 5
            ) {

                await db.execute(

                    `UPDATE admin_otps
SET used = TRUE
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(429).json({

                    message:
                        "Too many incorrect attempts. Please login again."

                });

            }


            // Hash entered OTP

            const enteredOtpHash =
                crypto
                    .createHash("sha256")
                    .update(
                        String(otp)
                    )
                    .digest("hex");


            // Compare hashes

            if (
                enteredOtpHash !==
                otpRecord.otp_hash
            ) {

                await db.execute(

                    `UPDATE admin_otps
SET attempts = attempts + 1
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(401).json({

                    message:
                        "Invalid OTP."

                });

            }


            // OTP is correct

            await db.execute(

                `UPDATE admin_otps
SET used = TRUE
WHERE id = ?`,

                [
                    otpRecord.id
                ]

            );


            // Create JWT only after OTP verification

            const token =
                jwt.sign(

                    {
                        id:
                        user.id,

                        email:
                        user.email,

                        role:
                        user.role

                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            "1d"
                    }

                );


            res.json({

                message:
                    "OTP verified. Login successful.",

                token,

                user: {

                    id:
                    user.id,

                    name:
                    user.name,

                    rollNo:
                    user.rollNo,

                    email:
                    user.email,

                    role:
                    user.role

                }

            });


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error during OTP verification."

            });

        }

    }
);


// ======================================================
// FORGOT PASSWORD
// SEND PASSWORD RESET OTP
// ======================================================

router.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const { email } = req.body;


            if (!email) {

                return res.status(400).json({

                    message:
                        "Email is required."

                });

            }


            // Find user

            const [users] =
                await db.execute(

                    `SELECT id, email
FROM users
WHERE email = ?`,

                    [
                        email
                    ]

                );


            // Do not reveal whether account exists

            if (users.length === 0) {

                return res.json({

                    message:
                        "If an account exists for this email, a password reset OTP has been sent."

                });

            }


            const user =
                users[0];


            // Invalidate previous unused reset OTPs

            await db.execute(

                `UPDATE password_resets
SET used = TRUE
WHERE user_id = ?
    AND used = FALSE`,

                [
                    user.id
                ]

            );


            // Generate 6-digit OTP

            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();


            // Hash OTP

            const otpHash =
                crypto
                    .createHash("sha256")
                    .update(otp)
                    .digest("hex");


            // Store reset OTP for 5 minutes

            await db.execute(

                `INSERT INTO password_resets
(
    user_id,
    otp_hash,
    expires_at,
    attempts,
    used
)
VALUES (
        ?,
        ?,
    DATE_ADD(NOW(), INTERVAL 5 MINUTE),
0,
    FALSE
)`,

                [
                    user.id,
                    otpHash
                ]

            );


            // Send reset OTP

            try {

                await sendEmailWithBrevo({
                    to: user.email,
                    subject: "CampusFix Password Reset OTP",
                    textContent:
                        `Your CampusFix password reset OTP is ${otp}. It expires in 5 minutes. If you did not request this, ignore this email.`,
                    htmlContent: `
<div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>CampusFix Password Reset</h2>
<p>Your password reset OTP is:</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px">
    ${otp}
</div>
<p>This OTP expires in <b>5 minutes</b>.</p>
<p>Do not share this OTP with anyone.</p>
</div>
`
                });


            } catch (emailError) {

                console.error(
                    "Password reset email error:",
                    emailError
                );


                // Remove unused reset OTP if email failed

                await db.execute(

                    `UPDATE password_resets
SET used = TRUE
WHERE user_id = ?
    AND used = FALSE`,

                    [
                        user.id
                    ]

                );


                return res.status(500).json({

                    message:
                        "Unable to send password reset OTP."

                });

            }


            res.json({

                message:
                    "If an account exists for this email, a password reset OTP has been sent.",

                resetRequired:
                    true

            });


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while processing password reset."

            });

        }

    }
);


// ======================================================
// RESET PASSWORD
// VERIFY OTP + CHANGE PASSWORD
// ======================================================

router.post(
    "/reset-password",
    async (req, res) => {

        try {

            const {
                email,
                otp,
                newPassword
            } = req.body;


            // Validate input

            if (
                !email ||
                !otp ||
                !newPassword
            ) {

                return res.status(400).json({

                    message:
                        "Email, OTP and new password are required."

                });

            }


            // Password length

            if (newPassword.length < 6) {

                return res.status(400).json({

                    message:
                        "New password must be at least 6 characters."

                });

            }


            // OTP must be 6 digits

            if (!/^\d{6}$/.test(String(otp))) {

                return res.status(400).json({

                    message:
                        "OTP must be a 6-digit number."

                });

            }


            // Find user

            const [users] =
                await db.execute(

                    `SELECT id, email
FROM users
WHERE email = ?`,

                    [
                        email
                    ]

                );


            if (users.length === 0) {

                return res.status(400).json({

                    message:
                        "Invalid password reset request."

                });

            }


            const user =
                users[0];


            // Get latest unused reset OTP

            const [otpRows] =
                await db.execute(

                    `SELECT *
    FROM password_resets
WHERE user_id = ?
    AND used = FALSE
ORDER BY id DESC
LIMIT 1`,

                    [
                        user.id
                    ]

                );


            if (otpRows.length === 0) {

                return res.status(400).json({

                    message:
                        "OTP not found. Please request a new OTP."

                });

            }


            const otpRecord =
                otpRows[0];


            // Check expiration

            if (
                new Date(
                    otpRecord.expires_at
                ) < new Date()
            ) {

                await db.execute(

                    `UPDATE password_resets
SET used = TRUE
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(400).json({

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            // Maximum 5 attempts

            if (
                otpRecord.attempts >= 5
            ) {

                await db.execute(

                    `UPDATE password_resets
SET used = TRUE
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(429).json({

                    message:
                        "Too many incorrect attempts. Please request a new OTP."

                });

            }


            // Hash entered OTP

            const enteredOtpHash =
                crypto
                    .createHash("sha256")
                    .update(
                        String(otp).trim()
                    )
                    .digest("hex");


            // Check OTP

            if (
                enteredOtpHash !==
                otpRecord.otp_hash
            ) {

                await db.execute(

                    `UPDATE password_resets
SET attempts = attempts + 1
WHERE id = ?`,

                    [
                        otpRecord.id
                    ]

                );


                return res.status(401).json({

                    message:
                        "Invalid OTP."

                });

            }


            // ==================================================
            // OTP CORRECT
            // ==================================================

            // Hash new password

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            // Update password

            await db.execute(

                `UPDATE users
SET password = ?
    WHERE id = ?`,

                [
                    hashedPassword,
                    user.id
                ]

            );


            // Mark OTP as used

            await db.execute(

                `UPDATE password_resets
SET used = TRUE
WHERE id = ?`,

                [
                    otpRecord.id
                ]

            );


            res.json({

                message:
                    "Password reset successful. You can now login."

            });


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while resetting password."

            });

        }

    }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
