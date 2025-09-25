import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MACHINE_BRANDS } from "@/constants";
import { generateUniqueId } from "@/actions/generate-unique-id";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return new NextResponse("Invalid data format. Expected an array.", {
        status: 400,
      });
    }

    const brands = await db.machineBrands.findMany({

  select: { brandName: true },
});
    const errors: string[] = [];
    const machinesData = await Promise.all(
      body.map(async (item, index) => {
        const {
          unitName,
          machineType,
          brandName,
          serialNumber,
          modelNumber,
          machineId,
          eliotDeviceName,
          ownership,
        } = item;

        const isInvalid = (val: any) =>
          !val ||
          val === "undefined" ||
          val === null ||
          val?.toString().trim() === "";

        // Remove eliotDeviceName from required fields validation
        const fieldsToCheck = {
          unitName,
          machineType,
          brandName,
          serialNumber,
          modelNumber,
          machineId,
          ownership,
        };

        const missingFields = Object.entries(fieldsToCheck)
          .filter(([_, val]) => isInvalid(val))
          .map(([key]) => key);

        if (missingFields.length > 0) {
          errors.push(
            `Row ${index + 1}: Missing fields - ${missingFields.join(", ")}`
          );
          return null;
        }

        // Check if eliotDeviceName is provided and not empty
        const hasEliotDevice = !isInvalid(eliotDeviceName);

        const [unit, brand, type, eliotDevice, assignedeliotDevice] =
          await Promise.all([
            db.unit.findFirst({
              where: { name: unitName as string },
              select: { id: true },
            }),
            brands.find((brand) => brand.brandName === brandName),
            db.machineType.findUnique({
              where: { code: machineType },
              select: { name: true },
            }),
            // Only query for eliot device if eliotDeviceName is provided
            hasEliotDevice
              ? db.eliotDevice.findUnique({
                  where: { serialNumber: eliotDeviceName },
                  select: { id: true },
                })
              : null,
            // Only check for assigned device if eliotDeviceName is provided
            hasEliotDevice
              ? db.eliotDevice.findUnique({
                  where: { serialNumber: eliotDeviceName, isAssigned: true },
                })
              : null,
          ]);

        if (!unit)
          errors.push(
            `Row ${index + 1}: The unit name you entered is not recognized.`
          );
        if (!brand)
          errors.push(
            `Row ${
              index + 1
            }: The brand name seems incorrect or is not in our list.`
          );
        if (!type)
          errors.push(`Row ${index + 1}: The machine type code '${machineType}' is not valid.`);
        
        // Only validate eliot device if eliotDeviceName is provided
        if (hasEliotDevice) {
          if (!eliotDevice)
            errors.push(
              `Row ${
                index + 1
              }: The device name (Eliot) is not found in the system.`
            );
          if (assignedeliotDevice)
            errors.push(
              `Row ${
                index + 1
              }: The Eliot device is already assigned to another machine.`
            );
        }

        if (!unit || !brand || !type || (hasEliotDevice && !eliotDevice)) return null;

        return {
          id: generateUniqueId(),
          unitId: unit.id,
          machineType,
          brandName,
          serialNumber,
          modelNumber,
          machineId,
          eliotDeviceId: hasEliotDevice && eliotDevice ? eliotDevice.id : null,
          ownership,
        };
      })
    );

    const validMachines = machinesData.filter((m) => m !== null) as NonNullable<
      (typeof machinesData)[number]
    >[];

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors: errors.join("\n") },
        { status: 400 }
      );
    }

    await db.sewingMachine.createMany({
      data: validMachines,
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Bulk machine data created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[BULK_SEWING_MACHINE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}