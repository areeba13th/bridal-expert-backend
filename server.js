const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARES =================
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ YEH LINE ADD KARO
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ YAHAN ADD KARO - frontend files serve karne ke liye



// ✅ YAHAN RAKHO — sabse upar
app.get("/HOME.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/HOME.html"));
});
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html");
});
app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html");
});
app.get("/admin-bookings.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-bookings.html");
});
app.get("/admin-appointment.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-appointment.html");
});
app.get("/dress-inventory.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dress-inventory.html");
});
app.get("/client-list.html", (req, res) => {
    res.sendFile(path.join(__dirname, "client-list.html");
});
app.get("/sales-report.html", (req, res) => {
    res.sendFile(path.join(__dirname, "sales-report.html");
});
app.get("/settings.html", (req, res) => {
    res.sendFile(path.join(__dirname, "settings.html");
});
app.get("/Ready to wear.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Ready to wear.html"));
});
app.get("/Bridal.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Bridal.html"));
});
app.get("/Couture collection.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Couture collection.html"));
});
app.get("/Appointment.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Appointment.html"));
});
app.get("/signature-collection.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signature-collection.html"));
});
app.get("/Modern collectioction.html",(req, res) => {
     res.sendFile(path.join(__dirname, "../frontend/signature-collection.html"));
});

// Uploads directory config
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created missing uploads directory at:", uploadsDir);
}

app.use("/uploads", express.static(uploadsDir));

// ================= DATABASE =================

const atlasUrl = process.env.MONGO_URI || "mongodb+srv://admin:12345@cluster0.mnaqjbb.mongodb.net/bridalDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.set("strictQuery", false);
mongoose
    .connect(atlasUrl)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Error:", err.message));

// ================= EMAIL =================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || "dbyareeba@gmail.com",
        pass: process.env.EMAIL_PASS || "gmxh blfv ymyo ghmz"
    }
});

// ================= MULTER =================

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, "-");
        cb(null, Date.now() + "-" + safeName);
    }
});

const upload = multer({ storage });

// ================= SCHEMAS =================

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});

const cartSchema = new mongoose.Schema({
    productName: String,
    price: Number,
    size: String,
    color: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    items: Array,
    total: Number,
    paymentMethod: String,
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    service: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
    standardSize: String,
    measurements: Object,
    fabricType: String,
    embroidery: String,
    customerName: String,
    email: String,
    phone: String,
    city: { type: String, default: "Faisalabad" },
    total: { type: Number, default: 0 },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

const dressSchema = new mongoose.Schema({
    code: String,
    name: String,
    collectionName: String,
    category: { type: String, default: "Ready to Wear" },
    price: Number,
    image: String,
    description: String,
    status: { type: String, default: "Available" },
    createdAt: { type: Date, default: Date.now }
});

const collectionSchema = new mongoose.Schema({
    name: { type: String, unique: true }
});

const reviewSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
});

// ================= MODELS =================

const User = mongoose.model("User", userSchema);
const Cart = mongoose.model("Cart", cartSchema);
const Order = mongoose.model("Order", orderSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Dress = mongoose.model("Dress", dressSchema, "dresses");
const Collection = mongoose.model("Collection", collectionSchema);
const Review = mongoose.model("Review", reviewSchema);

// ================= HELPERS =================

function cleanImageValue(image) {
    if (!image) return "";
    let value = String(image).trim();
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    value = value.replace(/^\/+/, "");
    value = value.replace(/^uploads\//, "");
    return value;
}

function normalizeDress(dress) {
    const obj = dress.toObject ? dress.toObject() : { ...dress };
    if (!obj.image) {
        obj.image = "";
        return obj;
    }
    if (obj.image.startsWith("http://") || obj.image.startsWith("https://")) {
        return obj;
    }
    const filename = cleanImageValue(obj.image);
    obj.image = `/uploads/${filename}`;
    return obj;
}

// ================= BASE ROUTES =================

app.get("/", (req, res) => {
    res.send("<h1>🚀 Bridal Expert Backend Server Is Running Successfully!</h1>");
});

app.get("/test", (req, res) => {
    res.json({ message: "Server Working Fine" });
});



// ================= APPOINTMENTS =================

app.post("/api/appointments/book", async (req, res) => {
    try {
        console.log("🚀 Appointment Data:", req.body);
        const appt = new Appointment(req.body);
        const saved = await appt.save();
        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment: saved
        });
    } catch (err) {
        console.log("❌ Appointment Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/api/appointments", async (req, res) => {
    try {
        const allAppointments = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).json(allAppointments);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= ORDERS =================

app.post("/api/orders", async (req, res) => {
    try {
        const order = new Order(req.body);
        const saved = await order.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER || "dbyareeba@gmail.com",
            to: req.body.email,
            subject: "🛍️ Order Confirmation - Bridal Expert",
            html: `
                <h2>Thank you for your order!</h2>
                <p>Hi ${req.body.customerName},</p>
                <p>Your order has been received successfully.</p>
                <p><b>Total:</b> ${req.body.total}</p>
                <p>We will contact you soon.</p>
            `
        });

        console.log("📧 Order Email Sent");
        res.status(201).json({ message: "Order placed", order: saved });
    } catch (err) {
        console.log("❌ Order Error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/orders", async (req, res) => {
    try {
        const allOrders = await Order.find().sort({ date: -1 });
        res.status(200).json(allOrders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get("/dashboard-style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard-style.css"));
});

// ================= AUTH =================

app.post("/api/register", async (req, res) => {
    try {
        const exists = await User.findOne({ email: req.body.email });
        if (exists) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashed = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashed
        });
        await user.save();
        res.status(201).json({ message: "User Registered" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid password" });
        }
        // FIX: Password field ko response se hata diya (security)
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ message: "Login Success", user: userObj });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ================= DRESSES ROUTES =================

// GET ALL DRESSES
app.get("/api/dresses", async (req, res) => {
    try {
        const dresses = await Dress.find({}).sort({ createdAt: -1 });
        res.json(dresses.map(normalizeDress));
    } catch (err) {
        console.error("❌ Fetch Dresses Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET SINGLE DRESS (for edit modal)
app.get("/api/dresses/:id", async (req, res) => {
    try {
        const dress = await Dress.findById(req.params.id);
        if (!dress) {
            return res.status(404).json({ success: false, message: "Dress not found!" });
        }
        res.json(normalizeDress(dress));
    } catch (err) {
        console.error("❌ Fetch Single Dress Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get("/api/new-arrivals", async (req, res) => {
    try {
        const dresses = await Dress.find({}).sort({ createdAt: -1 }).limit(8);
        res.json(dresses.map(normalizeDress));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/gallery", async (req, res) => {
    try {
        const dresses = await Dress.find({}).limit(10);
        res.json(dresses.map(normalizeDress));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get("/api/get-orders", async (req, res) => {
    try {
        const allOrders = await Order.find().sort({ date: -1 });
        res.status(200).json(allOrders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get("/dashboard-style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard-style.css"));
});

// ADD NEW DRESS (POST)
app.post("/api/dresses", upload.single("image"), async (req, res) => {
    try {
        console.log("🚀 BODY RECEIVED:", req.body);
        console.log("📂 FILE RECEIVED:", req.file);

        let imagePath = "";
        if (req.file) {
            imagePath = req.file.filename;
        } else if (req.body.image) {
            imagePath = cleanImageValue(req.body.image);
        }

        const dress = new Dress({
            code: req.body.code,
            name: req.body.name,
            collectionName: req.body.collectionName,
            category: req.body.category || "Ready to Wear",
            price: Number(req.body.price || 0),
            image: imagePath,
            description: req.body.description || "",
            status: req.body.status || "Available"
        });

        const saved = await dress.save();
        res.status(201).json({
            success: true,
            message: "Dress Added Successfully",
            dress: normalizeDress(saved)
        });
    } catch (err) {
        console.log("❌ ADD DRESS CRASH ERROR:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
app.post("/api/change-password", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const match = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!match) return res.status(401).json({ message: "Current password galat hai" });
        const hashed = await bcrypt.hash(req.body.newPassword, 10);
        await User.findByIdAndUpdate(user._id, { password: hashed });
        res.json({ message: "Password updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE DRESS (PUT)
app.put("/api/dresses/:id", upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            code: req.body.code,
            name: req.body.name,
            price: Number(req.body.price || 0),
            status: req.body.status,
            category: req.body.category,
            collectionName: req.body.collectionName,
            description: req.body.description
        };

        if (req.file) {
            updateData.image = req.file.filename;
        } else if (req.body.image) {
            updateData.image = cleanImageValue(req.body.image);
        }

        const updated = await Dress.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Dress not found" });
        }

        res.json({
            success: true,
            message: "Dress Updated Successfully",
            dress: normalizeDress(updated)
        });
    } catch (err) {
        console.log("❌ UPDATE DRESS CRASH ERROR:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE DRESS
app.delete("/api/dresses/:id", async (req, res) => {
    try {
        const deleted = await Dress.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Dress not found" });
        }
        res.json({ success: true, message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE STATUS (PATCH)
app.patch("/api/dresses/:id/status", async (req, res) => {
    try {
        const updated = await Dress.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Dress not found" });
        }
        res.json({ success: true, dress: normalizeDress(updated) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= BOOKINGS =================

app.post("/api/bookings", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const saved = await booking.save();
        res.status(201).json({ message: "Booking saved", booking: saved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.post("/api/bookings/create", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const saved = await booking.save();
        res.status(201).json({ message: "Booking saved", booking: saved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get("/api/bookings", async (req, res) => {
    try {
        const allBookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(allBookings);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= COLLECTIONS & CATEGORIES =================

// FIX: GET ALL COLLECTIONS (missing route added)
app.get("/api/collections", async (req, res) => {
    try {
        const collections = await Dress.distinct("collectionName");
        res.json(collections.filter(Boolean));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/collections/:category", async (req, res) => {
    try {
        const categoryParam = req.params.category;
        const dresses = await Dress.find({
            $or: [
                { collectionName: { $regex: categoryParam, $options: "i" } },
                { name: { $regex: categoryParam, $options: "i" } },
                { category: { $regex: categoryParam, $options: "i" } }
            ]
        });
        res.json(dresses.map(normalizeDress));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// ================= REVIEWS =================

app.post("/api/reviews", async (req, res) => {
    try {
        console.log("⭐ Review Received:", req.body);
        const newReview = new Review({
            name: req.body.name,
            rating: req.body.rating,
            comment: req.body.comment
        });
        const saved = await newReview.save();
        res.status(201).json({
            success: true,
            message: "Review saved successfully!",
            review: saved
        });
    } catch (error) {
        console.log("❌ Review Save Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/api/reviews", async (req, res) => {
    try {
        console.log("📥 Fetching Reviews");
        const reviews = await Review.find().sort({ date: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.log("❌ Review Fetch Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================= SERVER START =================

app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
    console.log("============== BRIDAL EXPERT ============");
});