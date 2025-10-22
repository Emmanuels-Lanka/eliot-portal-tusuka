import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const serialNumber = searchParams.get("serialNumber");

    if (!serialNumber) {
        return new NextResponse("Serial Number is required", { status: 400 });
    }

    try {
        const device = await db.eliotDevice.findUnique({
            where: {
                serialNumber: serialNumber,
            },
            include: {
                details: true,
            },
        });

        if (!device) {
            return new NextResponse("Device not found with the provided serial number", { status: 404 });
        }
                
        return NextResponse.json(device);

    } catch (error) {
        console.error("[MAINTENANCE_DEVICE_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}