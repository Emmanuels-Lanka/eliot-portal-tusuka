import { Loader2 } from "lucide-react";

const EliotLoading = () => {
    return (
        <div className='loading-body-height w-full flex justify-center items-center'>
            <Loader2 className="animate-spin w-8 h-8" />
        </div>
    )
}

export default EliotLoading;