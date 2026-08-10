"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import AttendanceSession from "@/models/AttendanceSession";
import Attendance from "@/models/Attendance";

export async function submitAttendance(token: string) {
  // 1. Verify student access
  const session = await auth();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized: Please sign in." };
  }

  const { role, studentId, rollNo } = session.user;
  if (role !== "student" || !studentId || !rollNo) {
    return { success: false, error: "Access Denied: Only whitelisted students can record attendance." };
  }

  try {
    await connectToDatabase();

    // 2. Find attendance session matching token
    const attendanceSession = await AttendanceSession.findOne({
      token,
    });

    if (!attendanceSession) {
      return { success: false, error: "Invalid attendance QR code." };
    }

    // 3. Check if session has been manually ended
    if (!attendanceSession.active) {
      return { success: false, error: "This attendance session has ended." };
    }

    // 4. Check if session has expired
    if (new Date() > new Date(attendanceSession.expiresAt)) {
      return { success: false, error: "This attendance session has expired. Please ask your professor to start a new session." };
    }

    // 5. Check if whitelist student matches and is active
    const student = await Student.findById(studentId);
    if (!student || !student.active) {
      return { success: false, error: "Your account is inactive or not whitelisted. Please contact your professor." };
    }

    // 6. Check for duplicate attendance submission
    const duplicate = await Attendance.findOne({
      sessionId: attendanceSession._id,
      studentId: student._id,
    });

    if (duplicate) {
      return { success: false, error: "Your attendance has already been recorded." };
    }

    // 7. Create attendance document
    await Attendance.create({
      sessionId: attendanceSession._id,
      classId: attendanceSession.classId,
      studentId: student._id,
      rollNo: student.rollNo,
      timestamp: new Date(),
      status: "PRESENT",
    });

    return {
      success: true,
      studentName: student.name,
      rollNo: student.rollNo,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error("Attendance submission error:", err);
    if (err.code === 11000) {
      return { success: false, error: "Your attendance has already been recorded." };
    }
    return {
      success: false,
      error: "A database error occurred. Please try again later.",
    };
  }
}
