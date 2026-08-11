"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import AttendanceSession from "@/models/AttendanceSession";
import Attendance from "@/models/Attendance";

// 1. Get statistics for a student
export async function getStudentStats() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }

  const studentId = session.user.studentId;
  if (!studentId) {
    return {
      stats: {
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      },
      history: [],
    };
  }

  await connectToDatabase();

  let mjtClass = await Class.findOne({ code: "MJT" });
  if (!mjtClass) {
    mjtClass = await Class.create({
      name: "Materials Joining Technology",
      code: "MJT",
    });
  }

  // Get all conducted sessions (sessions created for this class that have expired or are inactive)
  const conductedSessions = await AttendanceSession.find({
    classId: mjtClass._id,
    $or: [{ active: false }, { expiresAt: { $lt: new Date() } }],
  }).sort({ createdAt: -1 });

  // Get the student's attendance records
  const attendanceRecords = await Attendance.find({
    studentId,
    classId: mjtClass._id,
  });

  const presentSessionIds = new Set(
    attendanceRecords.map((r) => r.sessionId.toString())
  );

  const history = conductedSessions.map((s) => {
    const isPresent = presentSessionIds.has(s._id.toString());
    return {
      id: s._id.toString(),
      date: new Date(s.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: isPresent ? ("PRESENT" as const) : ("ABSENT" as const),
    };
  });

  const total = conductedSessions.length;
  const present = history.filter((h) => h.status === "PRESENT").length;
  const absent = total - present;
  const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

  return {
    stats: {
      present,
      absent,
      total,
      percentage,
    },
    history,
  };
}

// 2. Get history of all sessions for the professor
export async function getProfessorHistory() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "professor") {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  let mjtClass = await Class.findOne({ code: "MJT" });
  if (!mjtClass) {
    mjtClass = await Class.create({
      name: "Materials Joining Technology",
      code: "MJT",
    });
  }

  // Get total whitelisted student count dynamically
  const registeredCount = await Student.countDocuments({ active: true });

  // Get all conducted/ended sessions
  const sessions = await AttendanceSession.find({
    classId: mjtClass._id,
  }).sort({ createdAt: -1 });

  const history = await Promise.all(
    sessions.map(async (s) => {
      const present = await Attendance.countDocuments({
        sessionId: s._id,
        status: "PRESENT",
      });

      const total = registeredCount;
      const absent = Math.max(0, total - present);
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) + "%" : "0%";

      return {
        id: s._id.toString(),
        date: new Date(s.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        present,
        absent,
        percentage,
        active: s.active && new Date(s.expiresAt) > new Date(),
      };
    })
  );

  return history;
}

// 3. Get student attendance list for a specific session
export async function getSessionDetails(sessionId: string) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "professor") {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  // Find all active/inactive whitelisted students
  const students = await Student.find({ active: true }).sort({ rollNo: 1 });

  // Find all present records for this session
  const attendance = await Attendance.find({ sessionId });
  const presentStudentIds = new Set(
    attendance.map((a) => a.studentId.toString())
  );

  const studentsList = students.map((s) => {
    const isPresent = presentStudentIds.has(s._id.toString());
    return {
      rollNo: s.rollNo,
      name: s.name,
      email: s.email,
      status: isPresent ? ("PRESENT" as const) : ("ABSENT" as const),
    };
  });

  return studentsList;
}

export async function getProfessorSummaryStats() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "professor") {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const totalStudents = await Student.countDocuments({ active: true });

  // Get total check-ins today (unique students present today)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const presentToday = await Attendance.countDocuments({
    timestamp: { $gte: todayStart },
  });

  // Calculate overall attendance rate: average present count / total registered across all conducted sessions
  let mjtClass = await Class.findOne({ code: "MJT" });
  if (!mjtClass) {
    return { totalStudents, presentToday, overallRate: "0%" };
  }

  const conductedSessions = await AttendanceSession.find({
    classId: mjtClass._id,
    $or: [{ active: false }, { expiresAt: { $lt: new Date() } }],
  });

  let rate = 0;
  if (conductedSessions.length > 0 && totalStudents > 0) {
    let totalPresentMarks = 0;
    for (const s of conductedSessions) {
      const marks = await Attendance.countDocuments({ sessionId: s._id });
      totalPresentMarks += marks;
    }
    const averagePresent = totalPresentMarks / conductedSessions.length;
    rate = parseFloat(((averagePresent / totalStudents) * 100).toFixed(1));
  }

  return {
    totalStudents,
    presentToday,
    overallRate: rate + "%",
  };
}
