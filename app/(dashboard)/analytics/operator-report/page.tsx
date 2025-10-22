



import { Cog } from 'lucide-react'
import React from 'react'
import LogTable from '../../../../components/log/LogTable'
import { db } from '@/lib/db';
import ReportTable from './_components/daily-report';
import { getEmployee } from './_components/actions';
import { UnderConstruction } from '../daily-report/_components/loadCompo';
import NewReportTable from './_components/Daily-report-new';

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


  
}

)

const emp = await getEmployee()


// const operators = await db.operator.findMany({
//   orderBy
//   : {
//     rfid:"asc"
//   },
//   select:{
//     id:true,
//     name:true,
//     employeeId:true,
    
    
//   }
// })
// ;



  return (
    <div>
    
        <div className="container">
        <NewReportTable obbSheets={obbSheets} operators={emp}   ></NewReportTable>
        {/* <ReportTable obbSheets={obbSheets} operators={emp}   ></ReportTable> */}
        {/* <UnderConstruction /> */}
      </div>
  </div>
  )
}

export default page