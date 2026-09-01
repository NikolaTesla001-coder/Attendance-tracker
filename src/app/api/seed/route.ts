import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Ensure Class is seeded
    let defaultClass = await Class.findOne({ code: "MJT" });
    if (!defaultClass) {
      defaultClass = await Class.create({
        name: "Materials Joining Technology",
        code: "MJT",
      });
    }

    // 2. Clear existing students and seed a list of 4 students
    await Student.deleteMany({});

    const students = [
      {
        rollNo: "106",
        name: "Abhishek Patil",
        email: "student@gmail.com",
        active: true,
      },
      {
        rollNo: "101",
        name: "Ananya Sharma",
        email: "ananya@gmail.com",
        active: true,
      },
      {
        rollNo: "102",
        name: "Divya Teja",
        email: "divya@gmail.com",
        active: true,
      },
      {
        rollNo: "103",
        name: "Ishaan Verma",
        email: "ishaan@gmail.com",
        active: false, // Inactive student (should be rejected by sign-in)
      },
      {
        rollNo: "999",
        name: "Test Student",
        email: "test@gmail.com",
        active: true,
      },
      {
        rollNo: "100",
        name: "Sai Abhishek Patil",
        email: "sai28abhishekpatil@gmail.com",
        active: true,
      },
      {
        rollNo: "003",
        name: "Abhishek Patil",
        email: "abhishek.p.patil001@gmail.com",
        active: true,
      }
    ];

    await Student.insertMany(students);

    return NextResponse.json({
      status: "success",
      message: `Seeded ${students.length} whitelist students, cleared prior entries.`,
      course: defaultClass.name,
      studentsCount: students.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || error },
      { status: 500 }
    );
  }
}
