"use server";

import crypto from "crypto";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Class from "@/models/Class";
import AttendanceSession from "@/models/AttendanceSession";
import Attendance from "@/models/Attendance";

// Helper to check professor access
async function verifyProfessor() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "professor") {
    throw new Error("Unauthorized: Only the professor can manage sessions.");
  }
  return session.user;
}

export async function startSession() {
  const user = await verifyProfessor();
  await connectToDatabase();

  // 1. Get class ID for MJT
  let mjtClass = await Class.findOne({ code: "MJT" });
  if (!mjtClass) {
    mjtClass = await Class.create({
      name: "Materials Joining Technology",
      code: "MJT",
    });
  }

  // 2. Set all prior sessions to inactive
  await AttendanceSession.updateMany(
    { classId: mjtClass._id, active: true },
    { $set: { active: false } }
  );

  // 3. Generate secure random token
  const token = crypto.randomBytes(16).toString("hex");

  // 4. Expiration is 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 5. Create new session
  const newSession = await AttendanceSession.create({
    classId: mjtClass._id,
    token,
    expiresAt,
    active: true,
    createdBy: user.email || "professor",
  });

  return {
    id: newSession._id.toString(),
    token: newSession.token,
    expiresAt: newSession.expiresAt.toISOString(),
    active: newSession.active,
  };
}

import { syncSessionToSheet } from "@/lib/googleSheets";
import { getSessionDetails } from "./reports";

export async function endSession(sessionId: string) {
  await verifyProfessor();
  await connectToDatabase();

  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  await AttendanceSession.findByIdAndUpdate(sessionId, {
    $set: { active: false },
  });

  // Format the date for the spreadsheet
  const sessionDate = new Date(session.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fetch all students and their attendance status for this session
  const records = await getSessionDetails(sessionId);

  // Trigger Google Sheets sync and await it (Vercel kills serverless functions if we don't await)
  await syncSessionToSheet(sessionDate, records);

  return { success: true };
}

export async function getActiveSessionState() {
  await verifyProfessor();
  await connectToDatabase();

  let mjtClass = await Class.findOne({ code: "MJT" });
  if (!mjtClass) {
    mjtClass = await Class.create({
      name: "Materials Joining Technology",
      code: "MJT",
    });
  }

  // Find active session where expiresAt is in the future and active is true
  const session = await AttendanceSession.findOne({
    classId: mjtClass._id,
    active: true,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  // Get total present count for this session
  const presentCount = await Attendance.countDocuments({
    sessionId: session._id,
    status: "PRESENT",
  });

  return {
    id: session._id.toString(),
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
    active: session.active,
    presentCount,
  };
}
