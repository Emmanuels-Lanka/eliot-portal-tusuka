import { db } from "@/lib/db";
import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const issues = await db.factoryIssueLog.findMany({
            include: {
                reportedBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(issues);
    } catch (error) {
        console.error("[FACTORY_ISSUES_GET]", error);
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
        
        const { description } = await req.json();
        if (!description) {
            return new NextResponse("Description is required", { status: 400 });
        }

        const newIssue = await db.factoryIssueLog.create({
            data: {
                description,
                reportedById: userId,
            }
        });

        // Refetch to include user name for immediate display on frontend
        const result = await db.factoryIssueLog.findUnique({
            where: { id: newIssue.id },
            include: { reportedBy: { select: { name: true } } }
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("[FACTORY_ISSUES_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}