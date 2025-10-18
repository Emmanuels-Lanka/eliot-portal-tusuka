import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const defects = await db.predefinedDefect.findMany({
            orderBy: {
                description: 'asc',
            }
        });
        return NextResponse.json(defects);
    } catch (error) {
        console.error("[PREDEFINED_DEFECTS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}