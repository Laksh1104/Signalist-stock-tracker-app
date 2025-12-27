import { connectToDatabase } from "@/database/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
              return NextResponse.json({ message: "Endpoint not available" }, { status: 404 });
         }

    try {
        await connectToDatabase();
        return NextResponse.json({ message: "Connected to database successfully!" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to connect to database", error: error.message }, { status: 500 });
    }
}
