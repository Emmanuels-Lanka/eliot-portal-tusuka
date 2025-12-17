import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { configurations } = body;

        await db.$transaction(
            configurations.map((config: any) => 
                db.offstandCategories.upsert({
                    where: { optionName: config.optionName }, 
                    update: { optionValue: config.optionValue }, 
                    create: { 
                        optionName: config.optionName,
                        optionValue: config.optionValue
                    }  
                })
            )
        );

        return NextResponse.json({ message: 'Configuration saved successfully'}, { status: 200 });

    } catch (error) {
        console.error("[OFFSTAND_SAVE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}