import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { issueId: string } }
) {
    try {
        const { issueId } = params;
        
        const updatedIssue = await db.factoryIssueLog.update({
            where: { id: issueId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
            }
        });

        return NextResponse.json(updatedIssue);

    } catch (error) {
        console.error("[FACTORY_ISSUE_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}