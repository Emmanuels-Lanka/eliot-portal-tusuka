import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Step 1: Find all device IDs that have at least one 'REPLACEMENT_NEEDED' log.
        const devicesThatNeededReplacement = await db.deviceDefectLog.findMany({
            where: { status: 'REPLACEMENT_NEEDED' },
            select: { deviceId: true },
            distinct: ['deviceId']
        });

        const deviceIds = devicesThatNeededReplacement.map(d => d.deviceId);
        if (deviceIds.length === 0) {
            return NextResponse.json([]); // No devices need replacement, return early.
        }

        // Step 2: For each of those devices, find their most recent log entry.
        const latestLogs = await db.deviceDefectLog.findMany({
            where: {
                deviceId: { in: deviceIds }
            },
            orderBy: { reportedAt: 'desc' },
            distinct: ['deviceId'], // This powerful Prisma feature gets only the first record for each deviceId
            include: {
                device: { select: { serialNumber: true, modelNumber: true } },
                predefinedDefect: { select: { description: true } }
            }
        });
        
        // Step 3: From that list of latest logs, filter down to only the ones where the status is STILL 'REPLACEMENT_NEEDED'.
        // This automatically excludes devices that have been subsequently fixed.
        const prioritizedList = latestLogs.filter(log => log.status === 'REPLACEMENT_NEEDED');

        return NextResponse.json(prioritizedList);

    } catch (error) {
        console.error("[PRIORITIZED_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}