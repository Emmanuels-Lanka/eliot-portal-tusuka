import { cn } from "@/lib/utils"

const AuthFooter = ({ page }: { page?: string }) => {
    return (
        <footer className={cn(
            'w-full h-[80px] md:h-[50px] max-md:py-2 px-4 flex justify-between items-center gap-2',
            page !== 'root' && "bg-white/80"
        )}>
            <p className='text-sm text-slate-600 font-normal'>
            © {new Date().getFullYear()}, Emmanuel&apos;s Lanka Pvt Ltd. All rights reserved
            </p>
            <div className='flex items-end gap-1'>
                <p className='text-sm text-slate-600 font-semibold'>ELIoT Web Portal</p>
                <p className='hidden md:flex text-[10px] text-slate-500'>v1.0.a1</p>
            </div>
        </footer>
    )
}

export default AuthFooter