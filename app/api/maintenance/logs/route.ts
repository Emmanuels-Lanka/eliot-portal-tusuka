import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const serialNumber = searchParams.get("serialNumber");

    if (!serialNumber) {
        return new NextResponse("Serial Number is required", { status: 400 });
    }

    try {
        const logs = await db.deviceDefectLog.findMany({
            where: {
                device: {
                    serialNumber: serialNumber,
                },
            },
            include: {
                attendedBy: {
                    select: {
                        name: true,
                    },
                },
                predefinedDefect:{
                    select:{
                        description: true,
                    }
                }
            },
            orderBy: {
                reportedAt: 'desc',
            }
        });

        return NextResponse.json(logs);

    } catch (error) {
        console.error("[MAINTENANCE_LOGS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('AUTH_TOKEN');

        if (!token) {
            return new NextResponse("Unauthorized: No token provided.", { status: 401 });
        }

        const { value } = token;
        const secret = process.env.JWT_SECRET || "";
        
        const verifiedUser = verify(value, secret) as JwtPayload;
        const userEmail = verifiedUser.email;

        if (!userEmail) {
            return new NextResponse("Unauthorized: Invalid token payload, email missing.", { status: 401 });
        }
        
        const user = await db.user.findUnique({ where: { email: userEmail }, select: { id: true } });

        if (!user) {
            return new NextResponse("Unauthorized: User not found.", { status: 403 });
        }

        const userId = user.id;

        const body = await req.json();
        const {
            deviceId, attendedAt, fixedAt, status,
            predefinedDefectId, customDefectDescription, isReplaced,
            replacementDeviceId, physicalDamage, rootCause, remarks,
            replacedPart, reportedTo // These are the new string fields
        } = body;

        if (!deviceId || !attendedAt || !status) {
            return new NextResponse("Missing required fields.", { status: 400 });
        }

        const newLog = await db.deviceDefectLog.create({
            data: {
                attendedAt: new Date(attendedAt),
                fixedAt: fixedAt ? new Date(fixedAt) : null,
                status: status,
                customDefectDescription: customDefectDescription,
                isReplaced: isReplaced || false,
                replacementDeviceId: replacementDeviceId,
                physicalDamage: physicalDamage || false,
                rootCause: rootCause,
                remarks: remarks,
                replacedPart: replacedPart, // Save the string value
                reportedTo: reportedTo,     // Save the string value
                
                device: { connect: { id: deviceId } },
                attendedBy: { connect: { id: userId } },

                ...(predefinedDefectId && predefinedDefectId !== 'other' && {
                    predefinedDefect: { connect: { id: predefinedDefectId } }
                })
            }
        });

        return NextResponse.json(newLog, { status: 201 });

    } catch (error) {
        console.error("[MAINTENANCE_LOGS_POST_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}