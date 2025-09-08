import TVLinkCards from "@/components/tvUrl/page";
import Image from "next/image";
import React from "react";

const page = () => {
  const tvLinks = [
    {
      id: "1",
      title: "Operation Efficiency Heatmaps",
      description:
        "This component visualizes horly efficiency for each operation  ",
      url: "https://tiswlunit2.eliot.global/efficiency-live",
      imageUrl: "/tv/efficiency.png",
    },
    {
      id: "2",
      title: "Operator Efficiency Heatmap",
      description:
        "This Chart visualizes  efficiency for each operator ",
      url: "https://tiswlunit2.eliot.global/oe60",
      imageUrl: "/tv/operator.png",
    },
    {
      id: "3",
      title: "Production Heatmap",
      description:
        "This Heatmap shows hourly production of each operation.",
      url: "https://tiswlunit2.eliot.global/prod60",
      imageUrl: "/tv/prod.png",
    },
    {
      id: "4",
      title: "SMV vs Cycle Time",
      description:
        "This Graph shows the difference between the SMV and the Actual Cycle Time.",
      url: "https://tiswlunit2.eliot.global/SvC",
      imageUrl: "/tv/svc.png",
    },
    {
      id: "5",
      title: "Overall Operation Efficiency",
      description:
        "Shows, for each operation, how much of their production target they have achieved so far in the day.",
      url: "https://tiswlunit2.eliot.global/ovef",
      imageUrl: "/tv/overall.png",
    },
    
    {
      id: "6",
      title: "Hourly Production (Operator)",
      description:
        "This Heatmap shows hourly production of each operator.",
      url: "https://tiswlunit2.eliot.global/operator-prod",
      imageUrl: "/tv/HourlyProd.png",
    },
    
    // Add more cards as needed
  ];
  return (
    <div className="h-full w-full bg-gray-900 ">
<div className="max-w-7xl mx-auto  " >
        <div className="flex justify-center items-center mb-8">
            <Image
                                            src="/eliot-logo.png"
                                            alt='logo'
                                            width={200}
                                            height={200}
                                            className='py-0'
                                        />
                            
                                
      <h1 className="text-3xl text-[#0071c1] font-bold pt-8 mb-8">
        Featured TV Links
      </h1>
        </div>
      <div className="min-h-screen bg-gray-900 text-white">
  <TVLinkCards cards={tvLinks} />
</div>
    </div>
    </div>
  );
};

export default page;
