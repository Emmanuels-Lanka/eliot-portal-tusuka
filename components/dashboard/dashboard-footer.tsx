
const DashboardFooter = () => {
  return (
    <footer className='w-full md:h-[40px] max-md:py-2 px-4 bg-white flex justify-between items-center gap-2'>
        <p className='text-sm text-slate-600 font-normal'>
            © {new Date().getFullYear()}, Emmanuel&apos;s Lanka Pvt Ltd. All rights reserved
        </p>
        <div className='flex items-end gap-1'>
            <p className='text-sm text-slate-600 font-semibold'>ELIoT Web Portal</p>
            <p className='hidden md:flex text-[10px] text-slate-500'>v1.0.d17.31</p>
        </div>
    </footer>
  )
}

export default DashboardFooter