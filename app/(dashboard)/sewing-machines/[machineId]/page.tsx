import AddSewingMachineForm from "@/components/dashboard/forms/add-sewing-machine-form";
import { db } from "@/lib/db";

const SewingMachineId = async ({
  params,
}: {
  params: { machineId: string };
}) => {
  const devices = await db.eliotDevice.findMany({
    where: {
      isAssigned: false,
    },
    select: {
      id: true,
      serialNumber: true,
      modelNumber: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const units = await db.unit.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const machine = await db.sewingMachine.findUnique({
    where: {
      id: params.machineId,
    },
    include: {
      eliotDevice: {
        select: {
          id: true,
          serialNumber: true,
          modelNumber: true,
        },
      },
    },
  });
  // console.log("MACHINE", machine);

  const machineTypes = await db.machineType.findMany({
    select: {
      name: true,
      code: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const machineBrands = await db.machineBrands.findMany({
      select:{
        brandName:true
      },
      orderBy:{
        brandName:"asc"
      }
    })
  return (
    <AddSewingMachineForm
      devices={devices}
      units={units}
      machineId={params.machineId}
      initialData={machine}
      machineTypes={machineTypes}
      machineBrands={machineBrands}
    />
  );
};

export default SewingMachineId;
