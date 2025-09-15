import AddSewingMachineForm from "@/components/dashboard/forms/add-sewing-machine-form";
import { db } from "@/lib/db";
import { FileSpreadsheet } from "lucide-react";
import BulkUploadSewingMachineData from "../_components/bulk-upload-data";

const CreateNewSewingMachine = async () => {
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
    <>
      <AddSewingMachineForm
        devices={devices}
        units={units}
        machineBrands={machineBrands}
        machineTypes={machineTypes}
        mode="create"
      />

      {/* Feeding the data to database from Excel */}
      <div className="mt-12 lg:mt-20 mx-auto max-w-7xl w-full max-lg:p-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Bulk Sewing Machine Data
            </h2>
          </div>
          <p className="text-gray-600">
            Upload your Excel file to import machine data into the database.
            Make sure your file contains the required columns.
          </p>
        </div>
        <BulkUploadSewingMachineData />
      </div>
    </>
  );
};

export default CreateNewSewingMachine;
