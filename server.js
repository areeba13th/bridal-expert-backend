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

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/HOME.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/HOME.html")); });
app.get("/admin", (req, res) => { res.sendFile(path.join(__dirname, "admin.html")); });
app.get("/admin.html", (req, res) => { res.sendFile(path.join(__dirname, "admin.html")); });
app.get("/admin-bookings.html", (req, res) => { res.sendFile(path.join(__dirname, "admin-bookings.html")); });
app.get("/admin-appointment.html", (req, res) => { res.sendFile(path.join(__dirname, "admin-appointment.html")); });
app.get("/dress-inventory.html", (req, res) => { res.sendFile(path.join(__dirname, "dress-inventory.html")); });
app.get("/client-list.html", (req, res) => { res.sendFile(path.join(__dirname, "client-list.html")); });
app.get("/sales-report.html", (req, res) => { res.sendFile(path.join(__dirname, "sales-report.html")); });
app.get("/settings.html", (req, res) => { res.sendFile(path.join(__dirname, "settings.html")); });
app.get("/Ready to wear.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/Ready to wear.html")); });
app.get("/Bridal.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/Bridal.html")); });
app.get("/Couture collection.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/Couture collection.html")); });
app.get("/Appointment.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/Appointment.html")); });
app.get("/signature-collection.html", (req, res) => { res.sendFile(path.join(__dirname, "../frontend/signature-collection.html")); });
app.get("/dashboard-style.css", (req, res) => { res.sendFile(path.join(__dirname, "dashboard-style.css")); });

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }
app.use("/uploads", express.static(uploadsDir));

const atlasUrl = process.env.MONGO_URI || "mongodb+srv://admin:12345@cluster0.mnaqjbb.mongodb.net/bridalDB?retryWrites=true&w=majority&appName=Cluster0";
mongoose.set("strictQuery", false);
mongoose.connect(atlasUrl).then(() => console.log("✅ MongoDB Connected Successfully")).catch(err => console.log("❌ DB Error:", err.message));

const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 587, secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });

const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")); } });
const upload = multer({ storage });

const userSchema = new mongoose.Schema({ username: String, email: { type: String, unique: true }, password: String });
const cartSchema = new mongoose.Schema({ productName: String, price: Number, size: String, color: String, image: String, createdAt: { type: Date, default: Date.now } });
const orderSchema = new mongoose.Schema({ customerName: String, email: String, phone: String, address: String, city: String, items: Array, total: Number, paymentMethod: String, status: { type: String, default: "Pending" }, date: { type: Date, default: Date.now } });
const appointmentSchema = new mongoose.Schema({ name: String, email: String, phone: String, date: String, time: String, service: String, notes: String, createdAt: { type: Date, default: Date.now } });
const bookingSchema = new mongoose.Schema({ standardSize: String, measurements: Object, fabricType: String, embroidery: String, customerName: String, email: String, phone: String, city: { type: String, default: "Faisalabad" }, total: { type: Number, default: 0 }, status: { type: String, default: "Pending" }, createdAt: { type: Date, default: Date.now } });
const dressSchema = new mongoose.Schema({ code: String, name: String, collectionName: String, category: { type: String, default: "Ready to Wear" }, price: Number, image: String, description: String, status: { type: String, default: "Available" }, createdAt: { type: Date, default: Date.now } });
const collectionSchema = new mongoose.Schema({ name: { type: String, unique: true } });
const reviewSchema = new mongoose.Schema({ name: String, rating: Number, comment: String, date: { type: Date, default: Date.now } });

const User = mongoose.model("User", userSchema);
const Cart = mongoose.model("Cart", cartSchema);
const Order = mongoose.model("Order", orderSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Dress = mongoose.model("Dress", dressSchema, "dresses");
const Collection = mongoose.model("Collection", collectionSchema);
const Review = mongoose.model("Review", reviewSchema);

function cleanImageValue(image) { if (!image) return ""; let v = String(image).trim(); if (!v) return ""; if (v.startsWith("http://") || v.startsWith("https://")) return v; v = v.replace(/^\/+/, "").replace(/^uploads\//, ""); return v; }
function normalizeDress(dress) { const obj = dress.toObject ? dress.toObject() : { ...dress }; if (!obj.image) { obj.image = ""; return obj; } if (obj.image.startsWith("http://") || obj.image.startsWith("https://")) return obj; obj.image = `/uploads/${cleanImageValue(obj.image)}`; return obj; }

app.get("/", (req, res) => { res.send("<h1>🚀 Bridal Expert Backend Running!</h1>"); });
app.get("/test", (req, res) => { res.json({ message: "Server Working Fine" }); });

app.post("/api/appointments/book", async (req, res) => { try { const saved = await new Appointment(req.body).save(); res.status(201).json({ success: true, appointment: saved }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } });
app.get("/api/appointments", async (req, res) => { try { res.json(await Appointment.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ message: err.message }); } });

app.post("/api/orders", async (req, res) => { try { const saved = await new Order(req.body).save(); try { await transporter.sendMail({ from: process.env.EMAIL_USER, to: req.body.email, subject: "🛍️ Order Confirmation - Bridal Expert", html: `<h2>Thank you ${req.body.customerName}! Order received. Total: ${req.body.total}</h2>` }); } catch(e) { console.log("Email error:", e.message); } res.status(201).json({ message: "Order placed", order: saved }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/orders", async (req, res) => { try { res.json(await Order.find().sort({ date: -1 })); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/get-orders", async (req, res) => { try { res.json(await Order.find().sort({ date: -1 })); } catch (err) { res.status(500).json({ message: err.message }); } });

app.post("/api/register", async (req, res) => { try { if (await User.findOne({ email: req.body.email })) return res.status(400).json({ message: "Email already exists" }); const hashed = await bcrypt.hash(req.body.password, 10); await new User({ username: req.body.username, email: req.body.email, password: hashed }).save(); res.status(201).json({ message: "User Registered" }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.post("/api/login", async (req, res) => { try { const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(404).json({ message: "User not found" }); if (!await bcrypt.compare(req.body.password, user.password)) return res.status(401).json({ message: "Invalid password" }); const u = user.toObject(); delete u.password; res.json({ message: "Login Success", user: u }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.post("/api/change-password", async (req, res) => { try { const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(404).json({ message: "User not found" }); if (!await bcrypt.compare(req.body.currentPassword, user.password)) return res.status(401).json({ message: "Current password galat hai" }); await User.findByIdAndUpdate(user._id, { password: await bcrypt.hash(req.body.newPassword, 10) }); res.json({ message: "Password updated" }); } catch (err) { res.status(500).json({ message: err.message }); } });

app.get("/api/dresses", async (req, res) => { try { res.json((await Dress.find({}).sort({ createdAt: -1 })).map(normalizeDress)); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/dresses/:id", async (req, res) => { try { const d = await Dress.findById(req.params.id); if (!d) return res.status(404).json({ message: "Not found" }); res.json(normalizeDress(d)); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/new-arrivals", async (req, res) => { try { res.json((await Dress.find({}).sort({ createdAt: -1 }).limit(8)).map(normalizeDress)); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/gallery", async (req, res) => { try { res.json((await Dress.find({}).limit(10)).map(normalizeDress)); } catch (err) { res.status(500).json({ message: err.message }); } });
app.post("/api/dresses", upload.single("image"), async (req, res) => { try { const imagePath = req.file ? req.file.filename : cleanImageValue(req.body.image || ""); const saved = await new Dress({ code: req.body.code, name: req.body.name, collectionName: req.body.collectionName, category: req.body.category || "Ready to Wear", price: Number(req.body.price || 0), image: imagePath, description: req.body.description || "", status: req.body.status || "Available" }).save(); res.status(201).json({ success: true, dress: normalizeDress(saved) }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } });
app.put("/api/dresses/:id", upload.single("image"), async (req, res) => { try { const updateData = { code: req.body.code, name: req.body.name, price: Number(req.body.price || 0), status: req.body.status, category: req.body.category, collectionName: req.body.collectionName, description: req.body.description }; if (req.file) updateData.image = req.file.filename; else if (req.body.image) updateData.image = cleanImageValue(req.body.image); const updated = await Dress.findByIdAndUpdate(req.params.id, updateData, { new: true }); if (!updated) return res.status(404).json({ message: "Not found" }); res.json({ success: true, dress: normalizeDress(updated) }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.delete("/api/dresses/:id", async (req, res) => { try { await Dress.findByIdAndDelete(req.params.id); res.json({ success: true, message: "Deleted" }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.patch("/api/dresses/:id/status", async (req, res) => { try { const updated = await Dress.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); res.json({ success: true, dress: normalizeDress(updated) }); } catch (err) { res.status(500).json({ message: err.message }); } });

app.post("/api/bookings", async (req, res) => { try { const saved = await new Booking(req.body).save(); res.status(201).json({ message: "Booking saved", booking: saved }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.post("/api/bookings/create", async (req, res) => { try { const saved = await new Booking(req.body).save(); res.status(201).json({ message: "Booking saved", booking: saved }); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/bookings", async (req, res) => { try { res.json(await Booking.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ message: err.message }); } });

app.get("/api/collections", async (req, res) => { try { res.json((await Dress.distinct("collectionName")).filter(Boolean)); } catch (err) { res.status(500).json({ message: err.message }); } });
app.get("/api/collections/:category", async (req, res) => { try { const dresses = await Dress.find({ $or: [{ collectionName: { $regex: req.params.category, $options: "i" } }, { name: { $regex: req.params.category, $options: "i" } }, { category: { $regex: req.params.category, $options: "i" } }] }); res.json(dresses.map(normalizeDress)); } catch (err) { res.status(500).json({ message: err.message }); } });

app.post("/api/reviews", async (req, res) => { try { const saved = await new Review({ name: req.body.name, rating: req.body.rating, comment: req.body.comment }).save(); res.status(201).json({ success: true, review: saved }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } });
app.get("/api/reviews", async (req, res) => { try { res.json(await Review.find().sort({ date: -1 })); } catch (err) { res.status(500).json({ success: false, error: err.message }); } });

app.listen(PORT, () => { console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`); });