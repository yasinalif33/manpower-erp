import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const cors = require("cors");

app.use(
  cors({
    origin: "*", // Or specify your Vercel frontend URL for production security
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Seed Endpoint
app.get("/api/seed", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@manpower.erp" },
      update: {},
      create: {
        email: "admin@manpower.erp",
        password: hashedPassword,
        name: "Super Admin",
        role: "Super Admin",
      },
    });
    res.json({
      message: "Database seeded successfully",
      user: { email: admin.email, role: admin.role },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to seed database", details: error.message });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or inactive account" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
});

const PORT = process.env.PORT || 5000;

// -----------------------------------------------------
// CANDIDATES ENDPOINTS
// -----------------------------------------------------

// Get all candidates
app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Enroll a new candidate
app.post("/api/candidates", async (req, res) => {
  try {
    const data = req.body;

    // Calculate initial due amount
    const total = Number(data.totalPackageAmount) || 0;
    const advance = Number(data.advanceAmount) || 0;
    const due = Math.max(0, total - advance);

    const newCandidate = await prisma.candidate.create({
      data: {
        fullName: data.fullName,
        fatherName: data.fatherName,
        phone: data.phone,
        nid: data.nid,
        dateOfBirth: data.dateOfBirth,
        passportNo: data.passportNo,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        district: data.district,
        destinationCountry: data.destinationCountry,
        trade: data.trade,
        companyName: data.companyName,
        demandNo: data.demandNo || null,
        agentName: data.agentName,
        agentId: data.agentId || null,

        totalPackageAmount: total,
        paidAmount: advance,
        dueAmount: due,
      },
    });

    res.json({
      message: "Candidate enrolled successfully",
      candidate: newCandidate,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A candidate with this Passport Number already exists.",
      });
    }
    res.status(500).json({ error: "Failed to enroll candidate" });
  }
});

// Bulk update candidate stages
app.put("/api/candidates/bulk-stage", async (req, res) => {
  const { candidateIds, stage, stageDot } = req.body;

  try {
    const result = await prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds },
      },
      data: {
        stage,
        stageDot,
      },
    });

    res.json({
      message: `Successfully updated ${result.count} candidates`,
      count: result.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update candidate stages" });
  }
});

// -----------------------------------------------------
// FINANCIAL ENDPOINTS (MONEY RECEIPTS)
// -----------------------------------------------------

// Get all receipts with candidate details attached
app.get("/api/receipts", async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        candidate: {
          select: { fullName: true, passportNo: true, dueAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

// Issue a new receipt & update candidate balance safely using a Transaction
app.post("/api/receipts", async (req, res) => {
  const {
    candidateId,
    amount,
    paymentMethod,
    reference,
    receivedBy,
    notes,
    date,
  } = req.body;

  try {
    const numAmount = Number(amount);

    // Prisma Transaction: Ensures both the receipt is created AND the balance is updated.
    // If one fails, it rolls back both to prevent data corruption.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate unique auto-incrementing Receipt No
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const count = await tx.receipt.count();
      const receiptNo = `MR-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

      // 2. Create the Receipt record
      const receipt = await tx.receipt.create({
        data: {
          receiptNo,
          candidateId,
          amount: numAmount,
          paymentMethod,
          reference,
          receivedBy,
          notes,
          date: date ? new Date(date) : new Date(),
        },
      });

      // 3. Calculate and update the candidate's new balances
      const candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
      });
      const newPaid = candidate.paidAmount + numAmount;
      const newDue = Math.max(0, candidate.totalPackageAmount - newPaid);

      await tx.candidate.update({
        where: { id: candidateId },
        data: { paidAmount: newPaid, dueAmount: newDue },
      });

      return receipt;
    });

    res.json({ message: "Receipt issued successfully", receipt: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to issue receipt" });
  }
});

// -----------------------------------------------------
// DASHBOARD ENDPOINTS
// -----------------------------------------------------

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    // Run all database queries in parallel for maximum speed
    const [totalCandidates, financials, recentCandidates, recentReceipts] =
      await Promise.all([
        prisma.candidate.count(),
        prisma.candidate.aggregate({
          _sum: {
            totalPackageAmount: true,
            paidAmount: true,
            dueAmount: true,
          },
        }),
        prisma.candidate.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            destinationCountry: true,
            stage: true,
            stageDot: true,
          },
        }),
        prisma.receipt.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { candidate: { select: { fullName: true } } },
        }),
      ]);

    res.json({
      metrics: {
        totalCandidates,
        totalRevenue: financials._sum.totalPackageAmount || 0,
        totalReceived: financials._sum.paidAmount || 0,
        totalDue: financials._sum.dueAmount || 0,
      },
      recentCandidates,
      recentReceipts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// -----------------------------------------------------
// SUB-AGENTS ENDPOINTS
// -----------------------------------------------------

// Get all agents with their candidate count
app.get("/api/agents", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

// Register a new Sub-Agent
app.post("/api/agents", async (req, res) => {
  try {
    const newAgent = await prisma.agent.create({
      data: {
        name: req.body.name,
        phone: req.body.phone,
        district: req.body.district,
      },
    });
    res.json({ message: "Agent registered successfully", agent: newAgent });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "An agent with this phone number already exists." });
    }
    res.status(500).json({ error: "Failed to register agent" });
  }
});

// -----------------------------------------------------
// FLIGHT SCHEDULE & MANIFEST ENDPOINTS
// -----------------------------------------------------

// Get all flights with their assigned candidates
app.get("/api/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: { candidates: true },
      orderBy: { departureDate: "asc" },
    });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

// Create a new flight
app.post("/api/flights", async (req, res) => {
  try {
    const newFlight = await prisma.flight.create({
      data: {
        flightNumber: req.body.flightNumber,
        airline: req.body.airline,
        departureDate: new Date(req.body.departureDate),
        sector: req.body.sector,
      },
    });
    res.json({ message: "Flight scheduled successfully", flight: newFlight });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule flight" });
  }
});

// Assign candidates to a flight manifest
app.put("/api/flights/:id/assign", async (req, res) => {
  const { candidateIds } = req.body;
  try {
    await prisma.candidate.updateMany({
      where: { id: { in: candidateIds } },
      data: {
        flightId: req.params.id,
        stage: "Flight Ticket Issued",
        stageDot: "bg-amber-600",
      },
    });
    res.json({ message: "Manifest updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update manifest" });
  }
});

// Mark flight as departed (Using a Transaction to update all candidates automatically)
app.put("/api/flights/:id/depart", async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const flight = await tx.flight.update({
        where: { id: req.params.id },
        data: { status: "Departed" },
      });

      await tx.candidate.updateMany({
        where: { flightId: req.params.id },
        data: { stage: "Departed (Fly Done)", stageDot: "bg-slate-500" },
      });

      return flight;
    });
    res.json({ message: "Flight departed successfully", flight: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark flight as departed" });
  }
});

// -----------------------------------------------------
// FOREIGN DEMANDS & QUOTA ENDPOINTS
// -----------------------------------------------------

// Get all demands with filled quota counts
app.get("/api/demands", async (req, res) => {
  try {
    const demands = await prisma.demand.findMany({
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(demands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch demands" });
  }
});

// Register a new Demand Letter
app.post("/api/demands", async (req, res) => {
  try {
    const newDemand = await prisma.demand.create({
      data: {
        demandNo: req.body.demandNo,
        companyName: req.body.companyName,
        country: req.body.country,
        trade: req.body.trade,
        quota: Number(req.body.quota),
      },
    });
    res.json({ message: "Demand created successfully", demand: newDemand });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Demand No already exists in the system." });
    }
    res.status(500).json({ error: "Failed to create demand" });
  }
});

// -----------------------------------------------------
// EXPENSE VOUCHERS ENDPOINTS
// -----------------------------------------------------

// Get all vouchers
app.get("/api/vouchers", async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: { agent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
});

// Create a new expense voucher
app.post("/api/vouchers", async (req, res) => {
  const {
    category,
    amount,
    paymentMethod,
    reference,
    date,
    notes,
    issuedBy,
    agentId,
  } = req.body;

  try {
    const numAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Voucher No
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const count = await tx.voucher.count();
      const voucherNo = `EX-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

      // 2. Create the Voucher
      const voucher = await tx.voucher.create({
        data: {
          voucherNo,
          category,
          amount: numAmount,
          paymentMethod,
          reference,
          date: date ? new Date(date) : new Date(),
          notes,
          issuedBy,
          agentId: agentId || null,
        },
      });

      // 3. Auto-update Agent Ledger if this is a commission payment
      if (category === "Agent Commission" && agentId) {
        const agent = await tx.agent.findUnique({ where: { id: agentId } });
        if (agent) {
          const newPaid = agent.paidAmount + numAmount;
          const newDue = Math.max(0, agent.dueAmount - numAmount);
          await tx.agent.update({
            where: { id: agentId },
            data: { paidAmount: newPaid, dueAmount: newDue },
          });
        }
      }

      return voucher;
    });

    res.json({ message: "Voucher posted successfully", voucher: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to post voucher" });
  }
});

// -----------------------------------------------------
// FINANCIAL REPORTS & P&L ENDPOINTS
// -----------------------------------------------------

app.get("/api/reports/financials", async (req, res) => {
  try {
    const [candidateAgg, receiptAgg, voucherAgg, expensesByCategory] =
      await Promise.all([
        prisma.candidate.aggregate({
          _sum: { totalPackageAmount: true, dueAmount: true },
        }),
        prisma.receipt.aggregate({
          _sum: { amount: true },
        }),
        prisma.voucher.aggregate({
          _sum: { amount: true },
        }),
        prisma.voucher.groupBy({
          by: ["category"],
          _sum: { amount: true },
        }),
      ]);

    const expectedRevenue = candidateAgg._sum.totalPackageAmount || 0;
    const totalReceived = receiptAgg._sum.amount || 0;
    const totalExpenses = voucherAgg._sum.amount || 0;
    const netCash = totalReceived - totalExpenses; // Live Cash on Hand
    const totalDue = candidateAgg._sum.dueAmount || 0;

    res.json({
      expectedRevenue,
      totalReceived,
      totalExpenses,
      netCash,
      totalDue,
      expensesByCategory: expensesByCategory
        .map((e) => ({
          category: e.category,
          amount: e._sum.amount || 0,
        }))
        .sort((a, b) => b.amount - a.amount), // Sort highest expense to lowest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate financial report" });
  }
});

// -----------------------------------------------------
// ROLES & PERMISSIONS (USER MANAGEMENT)
// -----------------------------------------------------

// Get all system users (excluding passwords)
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new staff account
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.json({
      message: "Staff account created successfully",
      user: { id: newUser.id, name: newUser.name },
    });
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Failed to create user account" });
  }
});

// Update staff role or access status
app.put("/api/users/:id", async (req, res) => {
  try {
    const { role, isActive } = req.body;
    await prisma.user.update({
      where: { id: req.params.id },
      data: { role, isActive },
    });
    res.json({ message: "Account updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend] Server running on http://localhost:${PORT}`);
});
