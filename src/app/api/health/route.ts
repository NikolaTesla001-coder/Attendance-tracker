import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Seed the default course if not present
    let defaultClass = await Class.findOne({ code: "MJT" });
    if (!defaultClass) {
      defaultClass = await Class.create({
        name: "Materials Joining Technology",
        code: "MJT",
      });
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      course: defaultClass.name,
      code: defaultClass.code,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}
