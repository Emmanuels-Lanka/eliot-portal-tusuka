import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueId } from "@/actions/generate-unique-id";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    const existingBrand = await db.machineBrands.findUnique({
      where: { brandName:name },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand with this Name already exists" },
        { status: 400 }
      );
    }

    const id = generateUniqueId()
    const machineType = await db.machineBrands.create({
      data: {
        id,
        brandName:name
       
      },
    });

    return NextResponse.json(machineType);
  } catch (error) {
    console.error("[MACHINE_TYPE_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
