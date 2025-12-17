import { db } from '@/lib/db'
import OffstandCategoriesClient from './_components/offstand-categories-client';



const OffstandCategories = async () => {
  const categories = await db.offstandCategories.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className=''>
        <OffstandCategoriesClient categories={categories}/>
    </div>
  )
}

export default OffstandCategories