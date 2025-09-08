import { db } from '@/lib/db'
import { columns } from './_components/columns'
import { DataTable } from './_components/data-table'
import { Prisma } from '@prisma/client'

const EliotDevices = async ({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string; search?: string };
}) => {
  // Get pagination parameters from URL or use defaults
  const page = Number(searchParams.page) || 0;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || "";

  const skip = page * pageSize;

  // Create the where condition for searching
  const whereCondition = search
    ? {
        OR: [
          {
            machineId: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            eliotDevice: {
              serialNumber: {
                contains: search,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          },
        ],
      }
    : undefined;

  const totalMachines = await db.sewingMachine.count({
    where: whereCondition,
  });

  const machines = await db.sewingMachine.findMany({
    where: whereCondition,
    skip,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
    include: {
    eliotDevice: {
      select: {
        serialNumber: true,
        modelNumber: true
      }
    },
    productionLines: {
      select: {
        id: true,
        name: true,
        unitId: true
      }
    }
  }
});

  return (
    <div className='mx-auto max-w-7xl mt-12'>
      <DataTable 
        columns={columns} 
        data={machines} 
        totalCount={totalMachines}
        pageCount={Math.ceil(totalMachines / pageSize)}
        pageSize={pageSize}
        pageIndex={page}
      />
    </div>
  )
}

export default EliotDevices