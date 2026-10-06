
import { useEffect, useState } from "react";
import axios from "axios";

import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    Navigate
} from "react-router-dom";


// ======================================================
// PROTECTED STUDENT ROUTE
// ======================================================

function StudentRoute({ children }) {

    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "student") {
        return <Navigate to="/admin" replace />;
    }

    return children;
}


// ======================================================
// PROTECTED ADMIN ROUTE
// ======================================================

// ======================================================
// PROTECTED ADMIN ROUTE
// ======================================================

function AdminRoute({ children }) {

    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");

    // No login information
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // Only admin can access admin portal
    if (user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


// ======================================================
// REGISTER
// ======================================================

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (
            !name ||
            !rollNo ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill all fields.");
            return;
        }


        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }


        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }


        try {

            setLoading(true);

            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/auth/register",
                {
                    name,
                    rollNo,
                    email,
                    password,

                    // Students can only register as students
                    role: "student"
                }
            );


            setMessage(
                response.data.message ||
                "Registration successful!"
            );


            setName("");
            setRollNo("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );


        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="app-container">

            <main className="login-container">

                <div className="login-card">

                    <h1>
                        🛠 CampusFix
                    </h1>

                    <p>
                        Create your student account
                    </p>


                    {/* SUCCESS */}

                    {message && (

                        <div
                            className="message"
                            style={{
                                background: "#14532d",
                                borderColor: "#166534",
                                color: "#bbf7d0"
                            }}
                        >
                            ✅ {message}
                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div
                            className="message"
                            style={{
                                background: "#7f1d1d",
                                borderColor: "#991b1b",
                                color: "#fecaca"
                            }}
                        >
                            ⚠️ {error}
                        </div>

                    )}


                    <form onSubmit={handleRegister}>

                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Full Name *
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />

                        </div>


                        {/* ROLL NUMBER */}

                        <div className="form-group">

                            <label>
                                Roll Number *
                            </label>

                            <input
                                type="text"
                                placeholder="Example: 23CS002"
                                value={rollNo}
                                onChange={(e) =>
                                    setRollNo(e.target.value)
                                }
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email *
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password *
                            </label>

                            <input
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm Password *
                            </label>

                            <input
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: "100%",
                                padding: "13px",
                                fontSize: "15px"
                            }}
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Student Account"
                            }

                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            color: "#94a3b8"
                        }}
                    >

                        Already have an account?

                        <button
                            type="button"
                            className="btn"
                            style={{
                                background: "transparent",
                                color: "#60a5fa",
                                padding: "5px",
                                marginLeft: "5px"
                            }}
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Login
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}


// ======================================================
// LOGIN
// ======================================================

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpMode, setOtpMode] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ======================================================
    // SAVE LOGIN
    // ======================================================

    const saveLogin = (response) => {

        sessionStorage.setItem(
            "token",
            response.data.token
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
        );


        if (response.data.user.role === "admin") {

            window.location.href = "/admin";

        } else {

            window.location.href = "/dashboard";

        }

    };


    // ======================================================
    // NORMAL LOGIN
    // ======================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);


        try {

            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/auth/login",
                {
                    email,
                    password
                }
            );


            // ADMIN → OTP REQUIRED

            if (response.data.requiresOtp) {

                setOtpMode(true);

                setMessage(
                    "OTP sent to your registered admin email."
                );

                setPassword("");

            } else {

                // STUDENT → LOGIN DIRECTLY

                saveLogin(response);

            }


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Cannot connect to server"
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // VERIFY OTP
    // ======================================================

    const handleVerifyOtp = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!/^\d{6}$/.test(otp)) {

            setError(
                "Please enter the 6-digit OTP."
            );

            return;

        }


        setLoading(true);


        try {

            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/auth/verify-otp",
                {
                    email,
                    otp
                }
            );


            // OTP SUCCESS

            saveLogin(response);


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "OTP verification failed."
            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // LOGIN PAGE
    // ======================================================

    return (

        <div className="app-container">

            <main className="login-container">

                <div className="login-card">

                    <h1>
                        🛠 CampusFix
                    </h1>

                    <p>
                        College Issue Reporting System
                    </p>


                    {/* ==================================================
              NORMAL LOGIN
          ================================================== */}

                    {!otpMode ? (

                        <>

                            <h2>
                                Login
                            </h2>


                            <form onSubmit={handleLogin}>

                                {/* EMAIL */}

                                <div className="form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />

                                </div>


                                {/* PASSWORD */}

                                <div className="form-group">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: "100%",
                                        padding: "13px"
                                    }}
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Logging in..."
                                        : "Login"
                                    }

                                </button>

                                {/* FORGOT PASSWORD */}

                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: "15px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            background: "transparent",
                                            color: "#60a5fa",
                                            padding: "5px"
                                        }}
                                        onClick={() =>
                                            navigate("/forgot-password")
                                        }
                                    >
                                        Forgot Password?
                                    </button>

                                </div>

                            </form>

                        </>

                    ) : (

                        /* ==================================================
                           OTP PAGE
                        ================================================== */

                        <>

                            <h2>
                                🔐 Admin OTP Verification
                            </h2>


                            <p
                                style={{
                                    marginBottom: "20px"
                                }}
                            >

                                A 6-digit OTP has been sent
                                to your registered admin email.

                                <br />

                                The OTP expires in
                                <strong> 5 minutes.</strong>

                            </p>


                            <form onSubmit={handleVerifyOtp}>

                                <div className="form-group">

                                    <label>
                                        Enter 6-Digit OTP
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="6"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        autoFocus
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: "100%",
                                        padding: "13px"
                                    }}
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Verifying..."
                                        : "Verify OTP"
                                    }

                                </button>


                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        width: "100%",
                                        marginTop: "10px",
                                        padding: "13px"
                                    }}
                                    onClick={() => {

                                        setOtpMode(false);
                                        setOtp("");
                                        setMessage("");
                                        setError("");

                                    }}
                                >

                                    Back to Login

                                </button>

                            </form>

                        </>

                    )}


                    {/* SUCCESS MESSAGE */}

                    {message && (

                        <div
                            className="message"
                            style={{
                                marginTop: "15px",
                                background: "#14532d",
                                borderColor: "#166534",
                                color: "#bbf7d0"
                            }}
                        >

                            ✅ {message}

                        </div>

                    )}


                    {/* ERROR MESSAGE */}

                    {error && (

                        <div
                            className="message"
                            style={{
                                marginTop: "15px",
                                background: "#7f1d1d",
                                borderColor: "#991b1b",
                                color: "#fecaca"
                            }}
                        >

                            ⚠️ {error}

                        </div>

                    )}


                    {/* REGISTER */}

                    {!otpMode && (

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "20px",
                                color: "#94a3b8"
                            }}
                        >

                            Don't have an account?

                            <button
                                type="button"
                                className="btn"
                                style={{
                                    background: "transparent",
                                    color: "#60a5fa",
                                    padding: "5px",
                                    marginLeft: "5px"
                                }}
                                onClick={() =>
                                    navigate("/register")
                                }
                            >

                                Register

                            </button>

                        </div>

                    )}

                </div>

            </main>

        </div>

    );

}


// ======================================================
// STUDENT DASHBOARD
// ======================================================

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );


    const logout = () => {

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");

    };


    return (

        <div className="app-container">

            {/* NAVBAR */}

            <nav className="navbar">

                <div className="logo">
                    🛠 CampusFix
                </div>


                <div className="nav-links">

                    <span>
                        Student: {user?.name}
                    </span>

                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* MAIN */}

            <main className="page-container">

                {/* WELCOME */}

                <div className="welcome-section">

                    <h1>
                        Welcome, {user?.name} 👋
                    </h1>

                    <p>
                        Report and track your campus issues easily.
                    </p>

                </div>


                {/* ACTIONS */}

                <section className="section">

                    <h2 className="section-title">
                        What would you like to do?
                    </h2>


                    <div className="stats-grid">

                        {/* REPORT */}

                        <div
                            className="stat-card"
                            onClick={() =>
                                navigate("/report")
                            }
                            style={{
                                cursor: "pointer"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "42px",
                                    marginBottom: "15px"
                                }}
                            >
                                📝
                            </div>


                            <div
                                className="stat-title"
                                style={{
                                    fontSize: "18px",
                                    color: "#f8fafc",
                                    marginBottom: "8px"
                                }}
                            >
                                Report an Issue
                            </div>


                            <p
                                style={{
                                    color: "#94a3b8",
                                    fontSize: "14px",
                                    lineHeight: "1.5"
                                }}
                            >
                                Report problems with classrooms,
                                labs, Wi-Fi, water, electricity
                                and other campus facilities.
                            </p>


                            <button
                                className="btn btn-primary"
                                style={{
                                    marginTop: "18px"
                                }}
                                onClick={(e) => {

                                    e.stopPropagation();

                                    navigate("/report");

                                }}
                            >
                                Report Issue
                            </button>

                        </div>


                        {/* MY ISSUES */}

                        <div
                            className="stat-card"
                            onClick={() =>
                                navigate("/my-issues")
                            }
                            style={{
                                cursor: "pointer"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "42px",
                                    marginBottom: "15px"
                                }}
                            >
                                📋
                            </div>


                            <div
                                className="stat-title"
                                style={{
                                    fontSize: "18px",
                                    color: "#f8fafc",
                                    marginBottom: "8px"
                                }}
                            >
                                My Issues
                            </div>


                            <p
                                style={{
                                    color: "#94a3b8",
                                    fontSize: "14px",
                                    lineHeight: "1.5"
                                }}
                            >
                                View the issues you have reported
                                and track their current status.
                            </p>


                            <button
                                className="btn btn-secondary"
                                style={{
                                    marginTop: "18px"
                                }}
                                onClick={(e) => {

                                    e.stopPropagation();

                                    navigate("/my-issues");

                                }}
                            >
                                View My Issues
                            </button>

                        </div>

                    </div>

                </section>


                {/* HOW IT WORKS */}

                <section className="section">

                    <h2 className="section-title">
                        How CampusFix Works
                    </h2>


                    <div className="issue-card">

                        <div className="issue-info">

                            <div>
                                📝 <strong>1. Report</strong>
                                <br />
                                Submit your campus problem.
                            </div>


                            <div>
                                👨‍💼 <strong>2. Review</strong>
                                <br />
                                Admin reviews the reported issue.
                            </div>


                            <div>
                                🔧 <strong>3. Resolve</strong>
                                <br />
                                The issue is assigned for action.
                            </div>


                            <div>
                                ✅ <strong>4. Track</strong>
                                <br />
                                Check the latest issue status.
                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* FOOTER */}

            <footer className="footer">

                CampusFix © 2026 | College Issue Reporting System

            </footer>

        </div>
    );
}


// ======================================================
// REPORT ISSUE
// ======================================================

function ReportIssue() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Laboratory");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const token = sessionStorage.getItem("token");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!title || !location || !description) {

            setError(
                "Please fill all required fields."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/issues",
                {
                    title,
                    category,
                    location,
                    description,
                    priority
                },
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );


            setMessage(
                response.data.message ||
                "Issue reported successfully!"
            );


            // Clear form

            setTitle("");
            setCategory("Laboratory");
            setLocation("");
            setDescription("");
            setPriority("Medium");


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to report issue. Please try again."
            );


        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="app-container">

            {/* NAVBAR */}

            <nav className="navbar">

                <div className="logo">
                    🛠 CampusFix
                </div>


                <div className="nav-links">

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </div>

            </nav>


            {/* FORM */}

            <main className="page-container">

                <div className="form-container">

                    <h2>
                        📝 Report Campus Issue
                    </h2>


                    <p
                        style={{
                            color: "#94a3b8",
                            marginBottom: "25px",
                            lineHeight: "1.5"
                        }}
                    >
                        Tell us about the problem you found
                        on campus. The administration will
                        review it and take action.
                    </p>


                    {/* SUCCESS */}

                    {message && (

                        <div
                            className="message"
                            style={{
                                background: "#14532d",
                                borderColor: "#166534",
                                color: "#bbf7d0"
                            }}
                        >
                            ✅ {message}
                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div
                            className="message"
                            style={{
                                background: "#7f1d1d",
                                borderColor: "#991b1b",
                                color: "#fecaca"
                            }}
                        >
                            ⚠️ {error}
                        </div>

                    )}


                    <form onSubmit={handleSubmit}>

                        {/* TITLE */}

                        <div className="form-group">

                            <label>
                                Issue Title *
                            </label>

                            <input
                                type="text"
                                placeholder="Example: Projector not working"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="form-group">

                            <label>
                                Category *
                            </label>

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                            >

                                <option value="Laboratory">
                                    🧪 Laboratory
                                </option>

                                <option value="Classroom">
                                    🏫 Classroom
                                </option>

                                <option value="Wi-Fi">
                                    📶 Wi-Fi
                                </option>

                                <option value="Water">
                                    💧 Water
                                </option>

                                <option value="Cleaning">
                                    🧹 Cleaning
                                </option>

                                <option value="Electrical">
                                    ⚡ Electrical
                                </option>

                                <option value="Furniture">
                                    🪑 Furniture
                                </option>

                                <option value="Other">
                                    📌 Other
                                </option>

                            </select>

                        </div>


                        {/* LOCATION */}

                        <div className="form-group">

                            <label>
                                Location *
                            </label>

                            <input
                                type="text"
                                placeholder="Example: CSE Lab 2"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                            />

                        </div>


                        {/* PRIORITY */}

                        <div className="form-group">

                            <label>
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(e) =>
                                    setPriority(e.target.value)
                                }
                            >

                                <option value="Low">
                                    🟢 Low
                                </option>

                                <option value="Medium">
                                    🟡 Medium
                                </option>

                                <option value="High">
                                    🔴 High
                                </option>

                            </select>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label>
                                Description *
                            </label>

                            <textarea
                                placeholder="Describe the problem in detail..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            />

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: "100%",
                                padding: "13px",
                                fontSize: "15px"
                            }}
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting..."
                                : "🚀 Report Issue"
                            }

                        </button>

                    </form>


                    {/* MY ISSUES */}

                    <button
                        className="btn btn-secondary"
                        style={{
                            width: "100%",
                            marginTop: "12px"
                        }}
                        onClick={() =>
                            navigate("/my-issues")
                        }
                    >
                        📋 View My Issues
                    </button>

                </div>

            </main>


            {/* FOOTER */}

            <footer className="footer">

                CampusFix © 2026 | College Issue Reporting System

            </footer>

        </div>
    );
}



// ======================================================
// MY ISSUES
// ======================================================

function MyIssues() {

    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const token =
        sessionStorage.getItem("token");


    // ==================================================
    // FETCH MY ISSUES
    // ==================================================

    useEffect(() => {

        fetchIssues();

    }, []);


    const fetchIssues = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await axios.get(

                    "https://campusfix-bqs3.onrender.com/api/issues/my",

                    {
                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }

                );
            const issueList = response.data || [];

            setIssues(issueList);


        } catch (error) {

            console.error(error);

            setError(

                error.response?.data?.message ||

                "Failed to load your issues."

            );


        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // PRIORITY CLASS
    // ==================================================

    const getPriorityClass =
        (priority) => {

            if (priority === "High") {

                return "priority-high";

            }


            if (priority === "Medium") {

                return "priority-medium";

            }


            return "priority-low";

        };


    // ==================================================
    // STATUS CLASS
    // ==================================================

    const getStatusClass =
        (status) => {

            if (status === "Pending") {

                return "status-pending";

            }


            if (status === "In Progress") {

                return "status-progress";

            }


            return "status-resolved";

        };


    // ==================================================
    // STATUS ICON
    // ==================================================

    const getStatusIcon =
        (status) => {

            if (status === "Pending") {

                return "🕐";

            }


            if (status === "In Progress") {

                return "🔧";

            }


            if (status === "Resolved") {

                return "✅";

            }


            return "📌";

        };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="app-container">

                <nav className="navbar">

                    <div className="logo">
                        🛠 CampusFix
                    </div>

                </nav>


                <main className="page-container">

                    <div className="loading">

                        Loading your issues...

                    </div>

                </main>

            </div>

        );

    }


    // ==================================================
    // MAIN UI
    // ==================================================

    return (

        <div className="app-container">


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <nav className="navbar">


                <div className="logo">

                    🛠 CampusFix

                </div>


                <div className="nav-links">

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >

                        ← Dashboard

                    </button>

                </div>

            </nav>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="page-container">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="page-header">

                    <h1>

                        📋 My Issues

                    </h1>


                    <p>

                        Track the issues you have
                        reported on campus.

                    </p>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="message"
                        style={{
                            background:
                                "#7f1d1d",
                            borderColor:
                                "#991b1b",
                            color:
                                "#fecaca"
                        }}
                    >

                        ⚠️ {error}

                    </div>

                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {issues.length === 0 ? (

                    <div className="empty-state">


                        <div
                            style={{
                                fontSize:
                                    "50px",
                                marginBottom:
                                    "15px"
                            }}
                        >

                            📭

                        </div>


                        <h3
                            style={{
                                color:
                                    "#f8fafc",
                                marginBottom:
                                    "10px"
                            }}
                        >

                            No Issues Reported

                        </h3>


                        <p
                            style={{
                                marginBottom:
                                    "20px"
                            }}
                        >

                            You haven't reported
                            any campus issues yet.

                        </p>


                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate(
                                    "/report"
                                )
                            }
                        >

                            📝 Report an Issue

                        </button>

                    </div>

                ) : (

                    <section>


                        {/* ==================================================
                            ISSUE COUNT
                        ================================================== */}

                        <div
                            style={{
                                marginBottom:
                                    "20px",
                                color:
                                    "#94a3b8"
                            }}
                        >

                            You have reported{" "}

                            <strong
                                style={{
                                    color:
                                        "#60a5fa"
                                }}
                            >

                                {issues.length}

                            </strong>{" "}

                            {issues.length === 1
                                ? "issue"
                                : "issues"}.

                        </div>


                        {/* ==================================================
                            ISSUE CARDS
                        ================================================== */}

                        {issues.map(
                            (issue) => (

                                <div
                                    className="issue-card"
                                    key={
                                        issue.id
                                    }
                                >


                                    {/* ==================================================
                                        TITLE
                                    ================================================== */}

                                    <h3>

                                        {issue.title}

                                    </h3>


                                    {/* ==================================================
                                        ISSUE INFORMATION
                                    ================================================== */}

                                    <div
                                        className="issue-info"
                                    >


                                        <div>

                                            <strong>
                                                Category:
                                            </strong>{" "}

                                            {
                                                issue.category
                                            }

                                        </div>


                                        <div>

                                            <strong>
                                                Location:
                                            </strong>{" "}

                                            {
                                                issue.location
                                            }

                                        </div>


                                        <div>

                                            <strong>
                                                Priority:
                                            </strong>{" "}


                                            <span
                                                className={`badge ${getPriorityClass(
                                                    issue.priority
                                                )}`}
                                            >

                                                {
                                                    issue.priority
                                                }

                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                Status:
                                            </strong>{" "}


                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    issue.status
                                                )}`}
                                            >

                                                {
                                                    issue.status
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    {/* ==================================================
                                        DESCRIPTION
                                    ================================================== */}

                                    <div
                                        className="issue-description"
                                    >

                                        <strong>
                                            Description:
                                        </strong>{" "}

                                        {
                                            issue.description
                                        }

                                    </div>


                                    {/* ==================================================
                                        DATES
                                    ================================================== */}

                                    <div
                                        style={{
                                            marginTop:
                                                "18px",
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            gap:
                                                "6px",
                                            color:
                                                "#64748b",
                                            fontSize:
                                                "13px"
                                        }}
                                    >


                                        <div>

                                            📅{" "}

                                            <strong>
                                                Reported on:
                                            </strong>{" "}

                                            {
                                                issue.createdAt

                                                    ? new Date(
                                                        issue.createdAt
                                                    ).toLocaleString()

                                                    : "Not available"
                                            }

                                        </div>


                                        <div>

                                            🕒{" "}

                                            <strong>
                                                Last Updated:
                                            </strong>{" "}

                                            {
                                                issue.updatedAt

                                                    ? new Date(
                                                        issue.updatedAt
                                                    ).toLocaleString()

                                                    : "Not available"
                                            }

                                        </div>

                                    </div>


                                    {/* ==================================================
                                        CURRENT PROGRESS
                                    ================================================== */}

                                    <div
                                        style={{
                                            marginTop:
                                                "25px"
                                        }}
                                    >


                                        <strong
                                            style={{
                                                color:
                                                    "#cbd5e1",
                                                fontSize:
                                                    "14px"
                                            }}
                                        >

                                            Current Progress

                                        </strong>


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                marginTop:
                                                    "20px"
                                            }}
                                        >


                                            {/* STEP 1 */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    alignItems:
                                                        "center",
                                                    minWidth:
                                                        "80px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            "32px",
                                                        height:
                                                            "32px",
                                                        borderRadius:
                                                            "50%",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",

                                                        background:
                                                            issue.status ===
                                                            "Pending" ||

                                                            issue.status ===
                                                            "In Progress" ||

                                                            issue.status ===
                                                            "Resolved"

                                                                ? "#2563eb"

                                                                : "#374151",

                                                        color:
                                                            "#ffffff",

                                                        fontWeight:
                                                            "bold"
                                                    }}
                                                >

                                                    1

                                                </div>


                                                <span
                                                    style={{
                                                        marginTop:
                                                            "8px",
                                                        fontSize:
                                                            "12px",
                                                        color:
                                                            "#cbd5e1"
                                                    }}
                                                >

                                                    Pending

                                                </span>

                                            </div>


                                            {/* LINE 1 */}

                                            <div
                                                style={{
                                                    flex:
                                                        1,
                                                    height:
                                                        "5px",

                                                    background:

                                                        issue.status ===
                                                        "In Progress" ||

                                                        issue.status ===
                                                        "Resolved"

                                                            ? "#2563eb"

                                                            : "#374151",

                                                    borderRadius:
                                                        "10px"
                                                }}
                                            />


                                            {/* STEP 2 */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    alignItems:
                                                        "center",
                                                    minWidth:
                                                        "100px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            "32px",
                                                        height:
                                                            "32px",
                                                        borderRadius:
                                                            "50%",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",

                                                        background:

                                                            issue.status ===
                                                            "In Progress" ||

                                                            issue.status ===
                                                            "Resolved"

                                                                ? "#2563eb"

                                                                : "#374151",

                                                        color:
                                                            "#ffffff",

                                                        fontWeight:
                                                            "bold"
                                                    }}
                                                >

                                                    2

                                                </div>


                                                <span
                                                    style={{
                                                        marginTop:
                                                            "8px",
                                                        fontSize:
                                                            "12px",
                                                        color:
                                                            "#cbd5e1"
                                                    }}
                                                >

                                                    In Progress

                                                </span>

                                            </div>


                                            {/* LINE 2 */}

                                            <div
                                                style={{
                                                    flex:
                                                        1,
                                                    height:
                                                        "5px",

                                                    background:

                                                        issue.status ===
                                                        "Resolved"

                                                            ? "#16a34a"

                                                            : "#374151",

                                                    borderRadius:
                                                        "10px"
                                                }}
                                            />


                                            {/* STEP 3 */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    alignItems:
                                                        "center",
                                                    minWidth:
                                                        "80px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            "32px",
                                                        height:
                                                            "32px",
                                                        borderRadius:
                                                            "50%",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",

                                                        background:

                                                            issue.status ===
                                                            "Resolved"

                                                                ? "#16a34a"

                                                                : "#374151",

                                                        color:
                                                            "#ffffff",

                                                        fontWeight:
                                                            "bold"
                                                    }}
                                                >

                                                    3

                                                </div>


                                                <span
                                                    style={{
                                                        marginTop:
                                                            "8px",
                                                        fontSize:
                                                            "12px",
                                                        color:
                                                            "#cbd5e1"
                                                    }}
                                                >

                                                    Resolved

                                                </span>

                                            </div>

                                        </div>


                                        {/* CURRENT STATUS */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "18px",
                                                padding:
                                                    "10px 14px",
                                                borderRadius:
                                                    "8px",

                                                background:

                                                    issue.status ===
                                                    "Resolved"

                                                        ? "#14532d"

                                                        : issue.status ===
                                                        "In Progress"

                                                            ? "#1e3a8a"

                                                            : "#713f12",

                                                color:

                                                    issue.status ===
                                                    "Resolved"

                                                        ? "#bbf7d0"

                                                        : issue.status ===
                                                        "In Progress"

                                                            ? "#bfdbfe"

                                                            : "#fef3c7",

                                                fontSize:
                                                    "13px",

                                                textAlign:
                                                    "center"
                                            }}
                                        >

                                            Current Status:{" "}

                                            <strong>

                                                {
                                                    issue.status
                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    {/* ==================================================
                                        STATUS HISTORY
                                    ================================================== */}

                                    <div
                                        style={{
                                            marginTop:
                                                "30px",
                                            paddingTop:
                                                "20px",
                                            borderTop:
                                                "1px solid #334155"
                                        }}
                                    >


                                        <h4
                                            style={{
                                                color:
                                                    "#f8fafc",
                                                marginBottom:
                                                    "20px"
                                            }}
                                        >

                                            🕒 Status History

                                        </h4>


                                        {issue.statusHistory &&
                                        issue.statusHistory.length >
                                        0 ? (

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    gap:
                                                        "15px"
                                                }}
                                            >

                                                {issue.statusHistory.map(
                                                    (
                                                        history,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={`${issue.id}-history-${index}`}
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "flex-start",
                                                                gap:
                                                                    "12px"
                                                            }}
                                                        >


                                                            {/* ICON */}

                                                            <div
                                                                style={{
                                                                    width:
                                                                        "30px",
                                                                    height:
                                                                        "30px",
                                                                    minWidth:
                                                                        "30px",
                                                                    borderRadius:
                                                                        "50%",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",

                                                                    background:

                                                                        history.status ===
                                                                        "Resolved"

                                                                            ? "#166534"

                                                                            : history.status ===
                                                                            "In Progress"

                                                                                ? "#1d4ed8"

                                                                                : "#854d0e",

                                                                    fontSize:
                                                                        "14px"
                                                                }}
                                                            >

                                                                {
                                                                    getStatusIcon(
                                                                        history.status
                                                                    )
                                                                }

                                                            </div>


                                                            {/* DETAILS */}

                                                            <div
                                                                style={{
                                                                    flex:
                                                                        1
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        color:
                                                                            "#f8fafc",
                                                                        fontWeight:
                                                                            "600"
                                                                    }}
                                                                >

                                                                    {
                                                                        history.status
                                                                    }

                                                                </div>


                                                                <div
                                                                    style={{
                                                                        color:
                                                                            "#64748b",
                                                                        fontSize:
                                                                            "12px",
                                                                        marginTop:
                                                                            "4px"
                                                                    }}
                                                                >

                                                                    {
                                                                        history.changed_at

                                                                            ? new Date(
                                                                                history.changed_at
                                                                            ).toLocaleString()

                                                                            : "Date not available"
                                                                    }

                                                                </div>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        ) : (

                                            <div
                                                style={{
                                                    color:
                                                        "#64748b",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >

                                                No status history
                                                available.

                                            </div>

                                        )}

                                    </div>


                                    {/* ==================================================
                                        RESOLUTION NOTE
                                    ================================================== */}

                                    {issue.resolutionNote && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "25px",
                                                padding:
                                                    "18px",
                                                background:
                                                    "#052e16",
                                                border:
                                                    "1px solid #166534",
                                                borderRadius:
                                                    "10px"
                                            }}
                                        >


                                            <div
                                                style={{
                                                    color:
                                                        "#86efac",
                                                    fontWeight:
                                                        "700",
                                                    fontSize:
                                                        "15px",
                                                    marginBottom:
                                                        "8px"
                                                }}
                                            >

                                                📝 Resolution Note

                                            </div>


                                            <div
                                                style={{
                                                    color:
                                                        "#dcfce7",
                                                    fontSize:
                                                        "14px",
                                                    lineHeight:
                                                        "1.6"
                                                }}
                                            >

                                                {
                                                    issue.resolutionNote
                                                }

                                            </div>

                                        </div>

                                    )}

                                </div>

                            )

                        )}

                    </section>

                )}


                {/* ==================================================
                    REPORT ANOTHER ISSUE
                ================================================== */}

                <div
                    style={{
                        textAlign:
                            "center",
                        marginTop:
                            "30px"
                    }}
                >

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                "/report"
                            )
                        }
                    >

                        📝 Report Another Issue

                    </button>

                </div>

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="footer">

                CampusFix © 2026 |
                College Issue Reporting System

            </footer>

        </div>

    );

}



// ======================================================
// PROBLEM GROUPING HELPERS
// ======================================================

function normalizeProblemText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/wi[- ]?fi/g, "wifi")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\bis\b/g, "")
        .replace(/\bare\b/g, "")
        .replace(/\bthe\b/g, "")
        .replace(/\ba\b/g, "")
        .replace(/\ban\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getProblemKey(issue) {
    return [
        normalizeProblemText(issue.category),
        normalizeProblemText(issue.location),
        normalizeProblemText(issue.title)
    ].join("|");
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================

function AdminDashboard() {

    const navigate = useNavigate();

    // ==================================================
    // STATE
    // ==================================================

    const [issues, setIssues] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("All");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [priorityFilter, setPriorityFilter] =
        useState("All");

    // Selected status which has not been saved yet
    const [pendingStatus, setPendingStatus] =
        useState({});

    // Resolution notes being typed by admin
    const [resolutionNotes, setResolutionNotes] =
        useState({});


    // ==================================================
    // LOGIN INFORMATION
    // ==================================================

    const token =
        sessionStorage.getItem("token");

    const userData =
        sessionStorage.getItem("user");

    let user = null;

    try {

        user = userData
            ? JSON.parse(userData)
            : null;

    } catch (error) {

        console.error(
            "Invalid user data"
        );

    }


    // ==================================================
    // FETCH ALL ISSUES
    // ==================================================

    useEffect(() => {

        fetchIssues();

    }, []);


    const fetchIssues = async () => {

        try {

            setLoading(true);

            setMessage("");

            const response =
                await axios.get(
                    "https://campusfix-bqs3.onrender.com/api/issues",
                    {
                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );

            setIssues(
                response.data || []
            );

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load issues."
            );

        } finally {

            setLoading(false);

        }

    };







// ==================================================
// UPDATE ISSUE STATUS
// ==================================================

    const updateStatus = async (
        issueId,
        newStatus,
        resolutionNote = ""
    ) => {

        try {

            setMessage("");

            // ==================================================
            // UPDATE DATABASE
            // ==================================================

            const response = Array.isArray(issueId)

                ? await axios.put(
                    "https://campusfix-bqs3.onrender.com/api/issues/group/status",
                    {
                        issueIds: issueId,
                        status: newStatus,
                        resolutionNote
                    },
                    {
                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                )

                : await axios.put(
                    `https://campusfix-bqs3.onrender.com/api/issues/${issueId}/status`,
                    {
                        status: newStatus,
                        resolutionNote
                    },
                    {
                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );


            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            setMessage(
                response.data.message ||
                "Issue status updated successfully."
            );


            // ==================================================
            // UPDATE FRONTEND STATE IMMEDIATELY
            // ==================================================

            setIssues((previousIssues) => {

                // GROUP UPDATE
                if (Array.isArray(issueId)) {

                    const idSet = new Set(
                        issueId.map(Number)
                    );

                    return previousIssues.map((issue) => {

                        if (idSet.has(Number(issue.id))) {

                            return {
                                ...issue,
                                status: newStatus,
                                resolutionNote:
                                    resolutionNote || ""
                            };

                        }

                        return issue;

                    });

                }


                // SINGLE ISSUE UPDATE
                return previousIssues.map((issue) => {

                    if (Number(issue.id) === Number(issueId)) {

                        return {
                            ...issue,
                            status: newStatus,
                            resolutionNote:
                                resolutionNote || ""
                        };

                    }

                    return issue;

                });

            });


            // ==================================================
            // CLEAR TEMPORARY STATUS
            // ==================================================

            setPendingStatus({});


            // ==================================================
            // CLEAR RESOLUTION NOTES
            // ==================================================

            setResolutionNotes({});


        } catch (error) {

            console.error(
                "Update status error:",
                error
            );


            setMessage(
                error.response?.data?.message ||
                "Failed to update issue status."
            );

        }

    };
// ==================================================
// SEARCH + FILTER
// ==================================================

    const filteredIssues =
        issues.filter((issue) => {

            const searchText =
                search
                    .toLowerCase()
                    .trim();


            const matchesSearch =

                issue.title
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.location
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.description
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.category
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.reporterName
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.reporterRollNo
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                issue.reporterEmail
                    ?.toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                categoryFilter === "All" ||
                issue.category ===
                categoryFilter;


            const matchesStatus =
                statusFilter === "All" ||
                issue.status ===
                statusFilter;


            const matchesPriority =
                priorityFilter === "All" ||
                issue.priority ===
                priorityFilter;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus &&
                matchesPriority
            );

        });


// Count unique students who reported the same problem.
// Reports are NOT deleted; they remain individual records.
    const problemReportCounts = {};

    issues.forEach((issue) => {
        const key = getProblemKey(issue);

        if (!problemReportCounts[key]) {
            problemReportCounts[key] = new Set();
        }

        if (issue.reportedBy !== undefined && issue.reportedBy !== null) {
            problemReportCounts[key].add(String(issue.reportedBy));
        } else if (issue.reporterRollNo) {
            problemReportCounts[key].add(String(issue.reporterRollNo));
        } else if (issue.reporterEmail) {
            problemReportCounts[key].add(String(issue.reporterEmail));
        }
    });


// Group filtered reports into one card per underlying problem.
// Individual reports remain stored in MySQL.
    const groupedIssuesMap = {};

    filteredIssues.forEach((issue) => {
        const key = getProblemKey(issue);

        if (!groupedIssuesMap[key]) {
            groupedIssuesMap[key] = {
                key,
                representative: issue,
                issues: []
            };
        }

        groupedIssuesMap[key].issues.push(issue);
    });

    const groupedIssues = Object.values(groupedIssuesMap);


// A grouped problem is considered:
// Pending       -> if ANY student report is Pending
// In Progress   -> if there are no Pending reports but ANY is In Progress
// Resolved      -> only when ALL reports are Resolved
    const getGroupStatus = (group) => {
        const statuses = group.issues.map((item) => item.status);

        if (statuses.includes("Pending")) {
            return "Pending";
        }

        if (statuses.includes("In Progress")) {
            return "In Progress";
        }

        return "Resolved";
    };


// Build groups from ALL reports for dashboard statistics.
    const allGroupsMap = {};

    issues.forEach((issue) => {
        const key = getProblemKey(issue);

        if (!allGroupsMap[key]) {
            allGroupsMap[key] = {
                key,
                representative: issue,
                issues: []
            };
        }

        allGroupsMap[key].issues.push(issue);
    });

    const allProblemGroups = Object.values(allGroupsMap);


// ==================================================
// STATISTICS — COUNT PROBLEMS, NOT INDIVIDUAL REPORTS
// ==================================================

    const totalIssues =
        allProblemGroups.length;


    const pendingIssues =
        allProblemGroups.filter(
            (group) =>
                getGroupStatus(group) === "Pending"
        ).length;


    const inProgressIssues =
        allProblemGroups.filter(
            (group) =>
                getGroupStatus(group) === "In Progress"
        ).length;


    const resolvedIssues =
        allProblemGroups.filter(
            (group) =>
                getGroupStatus(group) === "Resolved"
        ).length;


    const highPriorityIssues =
        allProblemGroups.filter(
            (group) =>
                group.issues.some(
                    (issue) => issue.priority === "High"
                )
        ).length;


// ==================================================
// CATEGORY ANALYTICS
// ==================================================

    const categories = [

        "Laboratory",

        "Classroom",

        "Wi-Fi",

        "Water",

        "Cleaning",

        "Electrical",

        "Furniture",

        "Other"

    ];


    const categoryCounts =
        categories.map(
            (category) => {

                return {

                    category: category,

                    count: issues.filter(
                        (issue) =>
                            issue.category ===
                            category
                    ).length

                };

            }
        );


    const maxCategoryCount =
        Math.max(

            ...categoryCounts.map(
                (item) =>
                    item.count
            ),

            1

        );


// ==================================================
// CLEAR FILTERS
// ==================================================

    const clearFilters = () => {

        setSearch("");

        setCategoryFilter("All");

        setStatusFilter("All");

        setPriorityFilter("All");

    };


// ==================================================
// LOGOUT
// ==================================================

    const logout = () => {

        sessionStorage.removeItem("token");

        sessionStorage.removeItem("user");

        navigate("/login");

    };


// ==================================================
// LOADING SCREEN
// ==================================================

    if (loading) {

        return (

            <div className="app-container">


                {/* NAVBAR */}

                <nav className="navbar">

                    <div className="logo">
                        🛠 CampusFix
                    </div>

                </nav>


                {/* LOADING */}

                <main className="page-container">

                    <div className="loading">

                        Loading Admin Dashboard...

                    </div>

                </main>

            </div>

        );

    }


// ==================================================
// MAIN UI
// ==================================================

    return (

        <div className="app-container">


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <nav className="navbar">


                <div className="logo">

                    🛠 CampusFix

                </div>


                <div
                    className="nav-links"
                >

                    <span>

                        Admin:{" "}

                        {user?.name ||
                            "Administrator"}

                    </span>


                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="page-container">


                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div className="page-header">

                    <h1>
                        🛠 Admin Dashboard
                    </h1>

                    <p>
                        Manage and track all
                        reported campus issues.
                    </p>

                </div>


                {/* ==================================================
                    MESSAGE
                ================================================== */}

                {message && (

                    <div
                        className="message"
                        style={{
                            marginBottom:
                                "20px"
                        }}
                    >

                        {message}

                    </div>

                )}


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="section">


                    <h2 className="section-title">

                        📊 Issue Statistics

                    </h2>


                    <div className="stats-grid">


                        {/* TOTAL */}

                        <div className="stat-card">

                            <div
                                className="stat-number"
                            >
                                {totalIssues}
                            </div>

                            <div
                                className="stat-title"
                            >
                                Total Issues
                            </div>

                        </div>


                        {/* PENDING */}

                        <div className="stat-card">

                            <div
                                className="stat-number"
                            >
                                {pendingIssues}
                            </div>

                            <div
                                className="stat-title"
                            >
                                Pending
                            </div>

                        </div>


                        {/* IN PROGRESS */}

                        <div className="stat-card">

                            <div
                                className="stat-number"
                            >
                                {inProgressIssues}
                            </div>

                            <div
                                className="stat-title"
                            >
                                In Progress
                            </div>

                        </div>


                        {/* RESOLVED */}

                        <div className="stat-card">

                            <div
                                className="stat-number"
                            >
                                {resolvedIssues}
                            </div>

                            <div
                                className="stat-title"
                            >
                                Resolved
                            </div>

                        </div>


                        {/* HIGH PRIORITY */}

                        <div className="stat-card">

                            <div
                                className="stat-number"
                            >
                                {highPriorityIssues}
                            </div>

                            <div
                                className="stat-title"
                            >
                                High Priority
                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    CATEGORY ANALYTICS
                ================================================== */}

                <section className="section">


                    <h2 className="section-title">

                        📊 Category-wise Issue Analytics

                    </h2>


                    <div
                        className="issue-card"
                        style={{
                            marginTop:
                                "20px"
                        }}
                    >

                        {categoryCounts.map(
                            (item) => {

                                const barWidth =
                                    item.count === 0

                                        ? 0

                                        :

                                        (
                                            item.count /
                                            maxCategoryCount
                                        ) * 100;


                                return (

                                    <div
                                        key={
                                            item.category
                                        }
                                        style={{
                                            marginBottom:
                                                "20px"
                                        }}
                                    >


                                        {/* CATEGORY NAME */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                marginBottom:
                                                    "7px"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color:
                                                        "#cbd5e1",
                                                    fontSize:
                                                        "14px"
                                                }}
                                            >

                                                {
                                                    item.category
                                                }

                                            </span>


                                            <strong
                                                style={{
                                                    color:
                                                        "#60a5fa"
                                                }}
                                            >

                                                {
                                                    item.count
                                                }

                                            </strong>

                                        </div>


                                        {/* BAR */}

                                        <div
                                            style={{
                                                width:
                                                    "100%",
                                                height:
                                                    "12px",
                                                background:
                                                    "#334155",
                                                borderRadius:
                                                    "10px",
                                                overflow:
                                                    "hidden"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width:
                                                        `${barWidth}%`,
                                                    height:
                                                        "100%",
                                                    background:
                                                        "#2563eb",
                                                    borderRadius:
                                                        "10px",
                                                    transition:
                                                        "width 0.4s ease"
                                                }}
                                            />

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </section>


                {/* ==================================================
                    STATUS OVERVIEW
                ================================================== */}

                <section className="section">


                    <h2 className="section-title">

                        📈 Status Overview

                    </h2>


                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap:
                                "15px",
                            marginTop:
                                "20px"
                        }}
                    >


                        {/* PENDING */}

                        <div
                            style={{
                                background:
                                    "#422006",
                                border:
                                    "1px solid #854d0e",
                                borderRadius:
                                    "12px",
                                padding:
                                    "20px"
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        "#fef3c7",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                Pending
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        "30px",
                                    fontWeight:
                                        "bold",
                                    color:
                                        "#facc15",
                                    marginTop:
                                        "5px"
                                }}
                            >
                                {pendingIssues}
                            </div>

                        </div>


                        {/* IN PROGRESS */}

                        <div
                            style={{
                                background:
                                    "#172554",
                                border:
                                    "1px solid #1d4ed8",
                                borderRadius:
                                    "12px",
                                padding:
                                    "20px"
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        "#dbeafe",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                In Progress
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        "30px",
                                    fontWeight:
                                        "bold",
                                    color:
                                        "#60a5fa",
                                    marginTop:
                                        "5px"
                                }}
                            >
                                {inProgressIssues}
                            </div>

                        </div>


                        {/* RESOLVED */}

                        <div
                            style={{
                                background:
                                    "#052e16",
                                border:
                                    "1px solid #166534",
                                borderRadius:
                                    "12px",
                                padding:
                                    "20px"
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        "#dcfce7",
                                    fontSize:
                                        "14px"
                                }}
                            >
                                Resolved
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        "30px",
                                    fontWeight:
                                        "bold",
                                    color:
                                        "#4ade80",
                                    marginTop:
                                        "5px"
                                }}
                            >
                                {resolvedIssues}
                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    SEARCH & FILTER
                ================================================== */}

                <section className="section">


                    <h2 className="section-title">

                        🔎 Search & Filter Issues

                    </h2>


                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "2fr 1fr 1fr 1fr",
                            gap:
                                "15px",
                            alignItems:
                                "end"
                        }}
                    >


                        {/* SEARCH */}

                        <div className="form-group">

                            <label>
                                Search
                            </label>


                            <input
                                type="text"
                                placeholder="Search title, location, student..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="form-group">

                            <label>
                                Category
                            </label>


                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(e) =>
                                    setCategoryFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Categories
                                </option>

                                <option value="Laboratory">
                                    Laboratory
                                </option>

                                <option value="Classroom">
                                    Classroom
                                </option>

                                <option value="Wi-Fi">
                                    Wi-Fi
                                </option>

                                <option value="Water">
                                    Water
                                </option>

                                <option value="Cleaning">
                                    Cleaning
                                </option>

                                <option value="Electrical">
                                    Electrical
                                </option>

                                <option value="Furniture">
                                    Furniture
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* STATUS */}

                        <div className="form-group">

                            <label>
                                Status
                            </label>


                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Status
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Resolved">
                                    Resolved
                                </option>

                            </select>

                        </div>


                        {/* PRIORITY */}

                        <div className="form-group">

                            <label>
                                Priority
                            </label>


                            <select
                                value={
                                    priorityFilter
                                }
                                onChange={(e) =>
                                    setPriorityFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Priorities
                                </option>

                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* FILTER RESULTS */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            marginTop:
                                "15px",
                            flexWrap:
                                "wrap",
                            gap:
                                "10px"
                        }}
                    >

                        <span
                            style={{
                                color:
                                    "#94a3b8",
                                fontSize:
                                    "14px"
                            }}
                        >

                            Showing{" "}

                            <strong
                                style={{
                                    color:
                                        "#60a5fa"
                                }}
                            >
                                {
                                    groupedIssues.length
                                }
                            </strong>{" "}

                            of{" "}

                            <strong
                                style={{
                                    color:
                                        "#60a5fa"
                                }}
                            >
                                {issues.length}
                            </strong>{" "}

                            issues

                        </span>


                        <button
                            className="btn btn-secondary"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear Filters
                        </button>

                    </div>

                </section>


                {/* ==================================================
                    ALL REPORTED ISSUES
                ================================================== */}

                <section className="section">


                    <h2 className="section-title">

                        All Reported Issues

                    </h2>


                    {groupedIssues.length === 0 ? (

                        <div className="empty-state">

                            <div
                                style={{
                                    fontSize:
                                        "45px",
                                    marginBottom:
                                        "15px"
                                }}
                            >
                                🔍
                            </div>


                            <h3
                                style={{
                                    color:
                                        "#f8fafc",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                No Matching Issues
                            </h3>


                            <p
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                Try changing your
                                search or filters.
                            </p>


                            <button
                                className="btn btn-primary"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        groupedIssues.map(
                            (group) => {

                                const issue = group.representative;
                                const groupId = group.key;
                                const issueIds = group.issues.map(
                                    (item) => item.id
                                );

                                const groupStatus = getGroupStatus(group);

                                // The visible status represents the whole problem group,
                                // not just the first student's report.
                                const selectedStatus =
                                    pendingStatus[groupId] ??
                                    groupStatus;

                                const currentNote =
                                    resolutionNotes[groupId] ??
                                    issue.resolutionNote ??
                                    "";


                                return (

                                    <div
                                        className="issue-card"
                                        key={
                                            groupId
                                        }
                                    >


                                        {/* ==================================================
                                            TITLE
                                        ================================================== */}

                                        <h3>

                                            {issue.title}

                                        </h3>


                                        {/* Affected students */}
                                        <div
                                            style={{
                                                marginTop: "10px",
                                                marginBottom: "16px",
                                                padding: "10px 14px",
                                                background: "#172554",
                                                border: "1px solid #1d4ed8",
                                                borderRadius: "8px",
                                                color: "#bfdbfe",
                                                fontSize: "14px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            👥 {group.issues.length} student{
                                            group.issues.length === 1 ? "" : "s"
                                        } reported this problem

                                            {group.issues.length > 1 && (
                                                <div
                                                    style={{
                                                        marginTop: "8px",
                                                        fontWeight: "500",
                                                        color: "#dbeafe"
                                                    }}
                                                >
                                                    {group.issues.map((item) => (
                                                        <span
                                                            key={item.id}
                                                            style={{
                                                                display: "inline-block",
                                                                marginRight: "12px",
                                                                marginTop: "4px"
                                                            }}
                                                        >
                                      • {item.reporterName || "Student"}
                                                            {item.reporterRollNo
                                                                ? ` (${item.reporterRollNo})`
                                                                : ""}
                                    </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ==================================================
                                            ISSUE INFORMATION
                                        ================================================== */}

                                        <div className="issue-info">


                                            {/* STUDENT */}

                                            <div>

                                                <strong>
                                                    Student:
                                                </strong>{" "}

                                                {
                                                    issue.reporterName ||
                                                    "Unknown"
                                                }

                                            </div>


                                            {/* ROLL NUMBER */}

                                            <div>

                                                <strong>
                                                    Roll No:
                                                </strong>{" "}

                                                {
                                                    issue.reporterRollNo ||
                                                    "N/A"
                                                }

                                            </div>


                                            {/* CATEGORY */}

                                            <div>

                                                <strong>
                                                    Category:
                                                </strong>{" "}

                                                {
                                                    issue.category
                                                }

                                            </div>


                                            {/* LOCATION */}

                                            <div>

                                                <strong>
                                                    Location:
                                                </strong>{" "}

                                                {
                                                    issue.location
                                                }

                                            </div>


                                            {/* PRIORITY */}

                                            <div>

                                                <strong>
                                                    Priority:
                                                </strong>{" "}


                                                <span
                                                    className={`badge ${
                                                        issue.priority ===
                                                        "High"

                                                            ? "priority-high"

                                                            : issue.priority ===
                                                            "Medium"

                                                                ? "priority-medium"

                                                                : "priority-low"
                                                    }`}
                                                >

                                                    {
                                                        issue.priority
                                                    }

                                                </span>

                                            </div>


                                            {/* STATUS */}

                                            <div>

                                                <strong>
                                                    Status:
                                                </strong>{" "}


                                                <span
                                                    className={`status-badge ${
                                                        selectedStatus ===
                                                        "Pending"

                                                            ? "status-pending"

                                                            : selectedStatus ===
                                                            "In Progress"

                                                                ? "status-progress"

                                                                : "status-resolved"
                                                    }`}
                                                >

                                                    {
                                                        selectedStatus
                                                    }

                                                </span>

                                            </div>

                                        </div>


                                        {/* ==================================================
                                            DESCRIPTION
                                        ================================================== */}

                                        <div
                                            className="issue-description"
                                        >

                                            <strong>
                                                Description:
                                            </strong>{" "}

                                            {
                                                issue.description
                                            }

                                        </div>


                                        {/* ==================================================
                                            REPORTED DATE
                                        ================================================== */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                color:
                                                    "#94a3b8",
                                                fontSize:
                                                    "14px"
                                            }}
                                        >

                                            <strong>
                                                Reported On:
                                            </strong>{" "}

                                            {
                                                issue.createdAt
                                                    ? new Date(
                                                        issue.createdAt
                                                    ).toLocaleString()
                                                    : "Not available"
                                            }

                                        </div>


                                        {/* ==================================================
                                            LAST UPDATED
                                        ================================================== */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "8px",
                                                color:
                                                    "#94a3b8",
                                                fontSize:
                                                    "14px"
                                            }}
                                        >

                                            <strong>
                                                Last Updated:
                                            </strong>{" "}

                                            {
                                                issue.updatedAt
                                                    ? new Date(
                                                        issue.updatedAt
                                                    ).toLocaleString()
                                                    : "Not available"
                                            }

                                        </div>


                                        {/* ==================================================
                                            STATUS HISTORY
                                        ================================================== */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",
                                                padding:
                                                    "16px",
                                                background:
                                                    "#0f172a",
                                                border:
                                                    "1px solid #334155",
                                                borderRadius:
                                                    "10px"
                                            }}
                                        >


                                            <h4
                                                style={{
                                                    color:
                                                        "#f8fafc",
                                                    marginBottom:
                                                        "15px"
                                                }}
                                            >

                                                🕒 Status History

                                            </h4>


                                            {issue.statusHistory &&
                                            issue.statusHistory.length >
                                            0 ? (

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap:
                                                            "12px"
                                                    }}
                                                >

                                                    {issue.statusHistory.map(
                                                        (
                                                            history,
                                                            index
                                                        ) => (

                                                            <div
                                                                key={`${issue.id}-history-${index}`}
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "12px"
                                                                }}
                                                            >


                                                                {/* ICON */}

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "30px",
                                                                        height:
                                                                            "30px",
                                                                        minWidth:
                                                                            "30px",
                                                                        borderRadius:
                                                                            "50%",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",

                                                                        background:
                                                                            history.status ===
                                                                            "Resolved"

                                                                                ? "#166534"

                                                                                : history.status ===
                                                                                "In Progress"

                                                                                    ? "#1d4ed8"

                                                                                    : "#854d0e"
                                                                    }}
                                                                >

                                                                    {
                                                                        history.status ===
                                                                        "Resolved"

                                                                            ? "✓"

                                                                            : history.status ===
                                                                            "In Progress"

                                                                                ? "🔧"

                                                                                : "🕐"
                                                                    }

                                                                </div>


                                                                {/* DETAILS */}

                                                                <div>

                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#f8fafc",
                                                                            fontWeight:
                                                                                "600"
                                                                        }}
                                                                    >

                                                                        {
                                                                            history.status
                                                                        }

                                                                    </div>


                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "12px",
                                                                            marginTop:
                                                                                "3px"
                                                                        }}
                                                                    >

                                                                        {
                                                                            history.changed_at

                                                                                ? new Date(
                                                                                    history.changed_at
                                                                                ).toLocaleString()

                                                                                : "Date not available"
                                                                        }

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            ) : (

                                                <div
                                                    style={{
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "13px"
                                                    }}
                                                >

                                                    No status history
                                                    available.

                                                </div>

                                            )}

                                        </div>


                                        {/* ==================================================
                                            EXISTING RESOLUTION NOTE
                                        ================================================== */}

                                        {issue.resolutionNote && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "15px",
                                                    padding:
                                                        "15px",
                                                    background:
                                                        "#052e16",
                                                    border:
                                                        "1px solid #166534",
                                                    borderRadius:
                                                        "10px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        color:
                                                            "#86efac",
                                                        fontWeight:
                                                            "600",
                                                        marginBottom:
                                                            "6px"
                                                    }}
                                                >

                                                    📝 Resolution Note

                                                </div>


                                                <div
                                                    style={{
                                                        color:
                                                            "#dcfce7",
                                                        fontSize:
                                                            "14px",
                                                        lineHeight:
                                                            "1.5"
                                                    }}
                                                >

                                                    {
                                                        issue.resolutionNote
                                                    }

                                                </div>

                                            </div>

                                        )}


                                        {/* ==================================================
                                            CHANGE STATUS
                                        ================================================== */}

                                        <div
                                            className="status-control"
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <label>
                                                Change Status:
                                            </label>


                                            <select
                                                value={
                                                    selectedStatus
                                                }
                                                onChange={(e) => {

                                                    const newStatus =
                                                        e.target.value;


                                                    setPendingStatus(
                                                        (
                                                            previous
                                                        ) => ({

                                                            ...previous,

                                                            [groupId]:
                                                            newStatus

                                                        })
                                                    );

                                                }}
                                            >

                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="In Progress">
                                                    In Progress
                                                </option>

                                                <option value="Resolved">
                                                    Resolved
                                                </option>

                                            </select>

                                        </div>


                                        {/* ==================================================
                                            RESOLUTION NOTE INPUT
                                        ================================================== */}

                                        {selectedStatus ===
                                            "Resolved" && (

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "15px"
                                                    }}
                                                >


                                                    <label
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#cbd5e1",
                                                            fontWeight:
                                                                "600",
                                                            marginBottom:
                                                                "8px"
                                                        }}
                                                    >

                                                        📝 Resolution Note

                                                    </label>


                                                    <textarea
                                                        rows="3"
                                                        placeholder="Example: Projector cable replaced and tested successfully."
                                                        value={
                                                            currentNote
                                                        }
                                                        onChange={(e) => {

                                                            setResolutionNotes(
                                                                (
                                                                    previous
                                                                ) => ({

                                                                    ...previous,

                                                                    [groupId]:
                                                                    e.target.value

                                                                })
                                                            );

                                                        }}
                                                        style={{
                                                            width:
                                                                "100%",
                                                            boxSizing:
                                                                "border-box",
                                                            resize:
                                                                "vertical"
                                                        }}
                                                    />


                                                    <button
                                                        className="btn btn-success"
                                                        style={{
                                                            marginTop:
                                                                "10px"
                                                        }}
                                                        onClick={() => {

                                                            updateStatus(

                                                                issueIds,

                                                                "Resolved",

                                                                currentNote

                                                            );

                                                        }}
                                                    >

                                                        💾 Save Resolution

                                                    </button>

                                                </div>

                                            )}


                                        {/* ==================================================
                                            SAVE NORMAL STATUS
                                        ================================================== */}

                                        {selectedStatus !==
                                            groupStatus &&

                                            selectedStatus !==
                                            "Resolved" && (

                                                <button
                                                    className="btn btn-primary"
                                                    style={{
                                                        marginTop:
                                                            "10px"
                                                    }}
                                                    onClick={() => {

                                                        updateStatus(

                                                            issueIds,

                                                            selectedStatus

                                                        );

                                                    }}
                                                >

                                                    💾 Save Status

                                                </button>

                                            )}


                                    </div>

                                );

                            }

                        )

                    )}

                </section>

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="footer">

                CampusFix © 2026 | College Issue Reporting System

            </footer>

        </div>

    );

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [otpMode, setOtpMode] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSendOtp = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!email) {
            setError("Please enter your registered email.");
            return;
        }

        setLoading(true);

        try {

            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/auth/forgot-password",
                { email }
            );

            setMessage(
                response.data.message ||
                "If an account exists for this email, a password reset OTP has been sent."
            );

            setOtpMode(true);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to send password reset OTP."
            );

        } finally {

            setLoading(false);

        }

    };


    const handleResetPassword = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!/^\d{6}$/.test(otp)) {

            setError("Please enter the 6-digit OTP.");
            return;

        }

        if (newPassword.length < 6) {

            setError(
                "New password must contain at least 6 characters."
            );
            return;

        }

        if (newPassword !== confirmPassword) {

            setError("Passwords do not match.");
            return;

        }

        setLoading(true);

        try {

            const response = await axios.post(
                "https://campusfix-bqs3.onrender.com/api/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword
                }
            );

            setMessage(
                response.data.message ||
                "Password reset successful."
            );

            setOtp("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Password reset failed."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="app-container">

            <main className="login-container">

                <div className="login-card">

                    <h1>
                        🛠 CampusFix
                    </h1>

                    <p>
                        College Issue Reporting System
                    </p>


                    <h2>
                        🔑 Forgot Password
                    </h2>


                    {!otpMode ? (

                        <>
                            <p
                                style={{
                                    marginBottom: "20px",
                                    color: "#94a3b8",
                                    lineHeight: "1.5"
                                }}
                            >
                                Enter your registered email address.
                                We will send you a 6-digit OTP to reset
                                your password.
                            </p>


                            <form onSubmit={handleSendOtp}>

                                <div className="form-group">

                                    <label>
                                        Registered Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: "100%",
                                        padding: "13px"
                                    }}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Sending OTP..."
                                        : "Send Reset OTP"
                                    }
                                </button>

                            </form>
                        </>

                    ) : (

                        <>
                            <p
                                style={{
                                    marginBottom: "20px",
                                    color: "#94a3b8",
                                    lineHeight: "1.5"
                                }}
                            >
                                Enter the 6-digit OTP sent to your
                                registered email and create a new password.
                                The OTP expires in 5 minutes.
                            </p>


                            <form onSubmit={handleResetPassword}>

                                <div className="form-group">

                                    <label>
                                        6-Digit OTP
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="6"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        autoFocus
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: "100%",
                                        padding: "13px"
                                    }}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Resetting Password..."
                                        : "Reset Password"
                                    }
                                </button>


                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        width: "100%",
                                        marginTop: "10px",
                                        padding: "13px"
                                    }}
                                    onClick={() => {

                                        setOtpMode(false);
                                        setOtp("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setMessage("");
                                        setError("");

                                    }}
                                >
                                    ← Change Email
                                </button>

                            </form>
                        </>

                    )}


                    {message && (

                        <div
                            className="message"
                            style={{
                                marginTop: "15px",
                                background: "#14532d",
                                borderColor: "#166534",
                                color: "#bbf7d0"
                            }}
                        >
                            ✅ {message}
                        </div>

                    )}


                    {error && (

                        <div
                            className="message"
                            style={{
                                marginTop: "15px",
                                background: "#7f1d1d",
                                borderColor: "#991b1b",
                                color: "#fecaca"
                            }}
                        >
                            ⚠️ {error}
                        </div>

                    )}


                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            color: "#94a3b8"
                        }}
                    >

                        Remember your password?

                        <button
                            type="button"
                            className="btn"
                            style={{
                                background: "transparent",
                                color: "#60a5fa",
                                padding: "5px",
                                marginLeft: "5px"
                            }}
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Login
                        </button>

                    </div>

                </div>

            </main>

        </div>

    );

}


// ======================================================
// APP ROUTES
// ======================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* FORGOT PASSWORD */}

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />


                {/* REGISTER */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* STUDENT DASHBOARD */}

                <Route
                    path="/dashboard"
                    element={
                        <StudentRoute>
                            <Dashboard />
                        </StudentRoute>
                    }
                />


                {/* REPORT ISSUE */}

                <Route
                    path="/report"
                    element={
                        <StudentRoute>
                            <ReportIssue />
                        </StudentRoute>
                    }
                />


                {/* MY ISSUES */}

                <Route
                    path="/my-issues"
                    element={
                        <StudentRoute>
                            <MyIssues />
                        </StudentRoute>
                    }
                />


                {/* ADMIN DASHBOARD */}

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />


                {/* UNKNOWN URL */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;



