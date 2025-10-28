import { db } from '@/lib/db';
import AnalyticsChart from './components/analytics-chart';


  

const page = async() => {
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
    

    return (
        <div>
            <AnalyticsChart
                obbSheets={obbSheets}
                title='Daily Efficiency Chart'
            />
        </div>
    )
}

export default page;