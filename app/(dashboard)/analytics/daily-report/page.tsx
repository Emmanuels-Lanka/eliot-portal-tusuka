



import { Cog } from 'lucide-react'
import React from 'react'
import LogTable from '../../../../components/log/LogTable'
import { db } from '@/lib/db';
import ReportTable from './_components/daily-report';
import { UnderConstruction } from './_components/loadCompo';
import DailyRepCompo from './_components/daily-rep';
import { getUnit } from '../RLine-efficiency/_components/actions';

const page = async () => {


  const obbSheets = await db.obbSheet.findMany({
    where: {
        isActive: true,
    },
    orderBy: {
        createdAt: "desc",
    },
    select: {
        id: true,
        name: true
    }
});

const unit = await getUnit();

  return (
    <div>
    
        <div className="container">
          <DailyRepCompo obbSheets={obbSheets}  ></DailyRepCompo>
        {/* <ReportTable obbSheets={obbSheets} ></ReportTable>     */}
        {/* <UnderConstruction /> */}
      </div>
  </div>
  )
}

export default page