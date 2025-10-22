import {
  Airplay,
  AlignHorizontalDistributeCenter,
  BarChart3,
  BarChartHorizontal,
  Blocks,
  Cable,
  Cog,
  FileCog,
  FileSpreadsheet,
  icons,
  LayoutDashboard,
  LayoutPanelTop,
  Mail,
  PlusSquare,
  ScissorsLineDashed,
  Send,
  ServerCog,
  Settings,
  Sliders,
  Table,
  UserRoundCog,
  TableProperties,
  UserRoundPlus,
  LineChart,
  LocateFixed,
  QrCode,
  UserRound,
  QrCodeIcon,
  User2,
  UserX2,
  LucideUserCheck2,
  Server,
  Building2,
} from "lucide-react";

export const ROAMING_QC_DEFECTS = [
  "Broken, Skip , Loose, Stitche",
  "Pucker,Easing, Pleated, Run of",
  "Uneven, Hilow, Unbaance",
  "Oil",
  "Dirt",
  "Shad/unmatching",
  "Fabric Flaws",
  "Other",
];

export const MACHINE_BRANDS = [
  { name: "JUKI" },
  { name: "JACK" },
  { name: "DURKOPP ADLER" },
  { name: "VIBE MAC" },
  { name: "KANSAI" },
  { name: "BROTHER" },
  { name: "BOSS" },
  { name: "TREASURE" },
  { name: "ZUSUN" },
  { name: "GOLDEN WHEEL" },
  { name: "TYPICAL" },
  { name: "MORILA" },
  { name: "VI.BE.MAC" },
  { name: "SGGEMSY" },
  { name: "VITONI" },
  { name: "MORATA" },
];

export const SIDEBAR_ROUTES = [
  {
    categoryName: "Dashboard",
    icon: LayoutDashboard,
    routes: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Activity Log",
        href: "/activity-log",
        icon: Cog,
      },
    ],
  },
  {
    categoryName: "Live Operator Production Analytics",
    icon: BarChartHorizontal,
    routes: [
      // {
      //     label: "Hourly Achievement",
      //     href: "/analytics/hourly-production",
      //     icon: BarChart3
      // },
      {
        label: "Daily Target vs Actual",
        href: "/analytics/daily-achivement",
        icon: BarChartHorizontal,
      },
      {
        label: "Real Time Target vs Actual (Instance)",
        href: "/analytics/daily-achivement-ins",
        icon: BarChartHorizontal,
      },
      // {
      //     label: "Production Heatmap (15min)",
      //     href: "/analytics/operation-efficiency-15",
      //     icon: BarChartHorizontal
      // },
      {
        label: "Hourly Production",
        href: "/analytics/production-hourly",
        icon: BarChartHorizontal,
      },
      {
        label: "Hourly Production (Operator)",
        href: "/analytics/operator-hourly",
        icon: BarChartHorizontal,
      },
      // {
      //     label: "Overall Performance",
      //     href: "/analytics/achievement-rate-operation",
      //     icon: BarChart3
      // },
    ],
  },
  {
    categoryName: "SMV Analytics",
    icon: BarChart3,
    routes: [
      {
        label: "Cycle Time Analysis",
        href: "/analytics/operation-smv-hourly",
        icon: BarChart3,
      },
      {
        label: "SMV vs Cycle Time",
        href: "/analytics/operation-smv",
        icon: BarChart3,
      },
      {
        label: "Yamuzami Graph",
        href: "/analytics/yamuzami-graph",
        icon: BarChart3,
      },
    ],
  },
  {
    categoryName: "Operation Efficiency Analytics",
    icon: LineChart,
    routes: [
      {
        label: "Operation Efficiency (60min)",
        href: "/analytics/operation-efficiency-60",
        icon: BarChartHorizontal,
      },

      // {
      //     label: "Operation Efficiency (15min)",
      //     href: "/analytics/operation-efficiency-15m",
      //     icon: BarChartHorizontal
      // },
      {
        label: "Overall Operation Efficiency",
        href: "/analytics/efficiency-rate",
        icon: BarChartHorizontal,
      },
      {
        label: "Pitch Diagram",
        href: "/analytics/pitch-diagram",
        icon: LineChart,
      },
      {
        label: "Capacity Diagram",
        href: "/analytics/capacity-graph",
        icon: LineChart,
      },
    ],
  },
  {
    categoryName: "Operator Efficiency Analytics",
    icon: BarChartHorizontal,
    routes: [
      {
        label: "Operator Efficiency (60min)",
        href: "/analytics/operator-efficiency-60",
        icon: BarChartHorizontal,
      },
      // {
      //     label: "Resource Utilization",
      //     href: "/analytics/operator-effective-time",
      //     icon: Table
      // },
      // {
      //     label: "Operator Efficiency (15min)",
      //     href: "/analytics/operator-efficiency-15",
      //     icon: BarChartHorizontal
      // },
      {
        label: "Top Performence Operators",
        href: "/analytics/top-operator",
        icon: BarChartHorizontal,
      },
      {
        label: "Operator Efficiency Overview",
        href: "/analytics/overall-operator",
        icon: BarChartHorizontal,
      },
    ],
  },
  {
    categoryName: "Records",
    icon: Table,
    routes: [
      {
        label: "Resource Utilization",
        href: "/analytics/operator-effective-time",
        icon: Table,
      },
      {
        label: "Logs",
        href: "/analytics/log",
        icon: Table,
      },
    ],
  },
  {
    categoryName: "Reports",
    icon: Table,
    routes: [
      {
        label: "Daily Efficiency Report",
        href: "/analytics/daily-report",
        icon: Table,
      },
      {
        label: "Line Individual Efficiency report",
        href: "/analytics/RLine-efficiency",
        icon: Table,
      },
      // {
      //     label: "Line Individual Efficiency report",
      //     href: "/analytics/line-efficiency-report",
      //     icon: Table
      // },
      {
        label: "Avg Efficiency Report- Individual Operator",
        href: "/analytics/operator-report",
        icon: Table,
      },
    ],
  },
  {
    categoryName: "DHU Status",
    icon: BarChartHorizontal,
    routes: [
      // {
      //     label: "Real-time DHU",
      //     href: "/analytics/tls-productions",
      //     icon: BarChartHorizontal
      // },
      // {
      //     label: "GMT DHU",
      //     href: "/analytics/tls-operators",
      //     icon: BarChartHorizontal
      // },
      {
        label: "Operator DHU Report",
        href: "/analytics/operator-dhu",
        icon: BarChartHorizontal,
      },
      {
        label: "Operator  DHU ",
        href: "/analytics/dhu-operator",
        icon: BarChartHorizontal,
      },
      // {
      //     label: "Sectional DHU",
      //     href: "/analytics/defect-chart",
      //     icon: BarChartHorizontal
      // },
    ],
  },
  {
    categoryName: "Roaming QC",
    icon: FileSpreadsheet,
    routes: [
      {
        label: "Roaming QC Analytics",
        href: "/analytics/roaming-qc",
        icon: AlignHorizontalDistributeCenter,
      },
      {
        label: "Roaming QC Report",
        href: "/reports/roaming-qc",
        icon: FileSpreadsheet,
      },
    ],
  },

  {
    categoryName: "Production Lines",
    icon: AlignHorizontalDistributeCenter,
    routes: [
      {
        label: "Add Production Lines",
        href: "/production-lines/create-new",
        icon: AlignHorizontalDistributeCenter,
      },
    ],
  },
  {
    categoryName: "Factory Units",
    icon: Building2,
    routes: [
      {
        label: "Manage Units",
        href: "/factory-units",
        icon: AlignHorizontalDistributeCenter,
      },
    ],
  },
  {
    categoryName: "ELIoT Devices",
    icon: Airplay,
    routes: [
      {
        label: "Add",
        href: "/eliot-devices/create-new",
        icon: Airplay,
      },
      {
        label: "Manage",
        href: "/eliot-devices",
        icon: Blocks,
      },
    ],
  },
  {
    categoryName: "Sewing Machines",
    icon: Cog,
    routes: [
      {
        label: "Add",
        href: "/sewing-machines/create-new",
        icon: Cog,
      },
      {
        label: "Manage",
        href: "/sewing-machines",
        icon: Blocks,
      },
      {
        label: "Machine types",
        href: "/analytics/machine-type",
        icon: BarChart3,
      },
      // {
      //     label: "Machine Summary",
      //     href: "/analytics/machine-summary",
      //     icon: TableProperties
      // },
      {
        label: "Machine Summary",
        href: "/analytics/machine-summary-new",
        icon: TableProperties,
      },
    ],
  },
  {
    categoryName: "Sewing Operators",
    icon: ScissorsLineDashed,
    routes: [
      {
        label: "Add",
        href: "/sewing-operators/create-new",
        icon: ScissorsLineDashed,
      },
      {
        label: "Manage",
        href: "/sewing-operators",
        icon: Blocks,
      },
    ],
  },
  {
    categoryName: "Factory Staff",
    icon: UserRound,
    routes: [
      {
        label: "Add",
        href: "/factory-staffs/create-new",
        icon: UserRoundPlus,
      },
      {
        label: "Manage",
        href: "/factory-staffs",
        icon: UserRoundCog,
      },
    ],
  },
  {
    categoryName: "QR Generators",
    icon: QrCodeIcon,
    routes: [
      {
        label: "User Credentials",
        href: "/analytics/qr-generator",
        icon: QrCode,
      },
      {
        label: "Sewing Machine",
        href: "/analytics/sm-qr-generator",
        icon: QrCode,
      },
    ],
  },
  {
    categoryName: "Portal Account Users",
    icon: LucideUserCheck2,
    routes: [
      {
        label: "Add",
        href: "/portal-accounts/create-new",
        icon: UserRoundPlus,
      },
      {
        label: "Manage",
        href: "/portal-accounts",
        icon: UserRoundCog,
      },
    ],
  },
  {
    categoryName: "Production Lines & Operations",
    icon: Server,
    routes: [
      {
        label: "Manage Operations",
        href: "/operations",
        icon: Settings,
      },
      {
        label: "Manage Production Lines",
        href: "/production-lines",
        icon: ServerCog,
      },
    ],
  },
  {
    categoryName: "Operation BreakDown & Balancing Sheet",
    icon: FileSpreadsheet,
    routes: [
      {
        label: "Create Operation Bulletin",
        href: "/obb-sheets/create-new",
        icon: FileSpreadsheet,
      },
      {
        label: "Manage Operation Bulletin",
        href: "/obb-sheets",
        icon: FileCog,
      },
    ],
  },
  {
    categoryName: "SMS & Email Alerts",
    icon: Send,
    routes: [
      {
        label: "Alert logs",
        href: "/alert-logs",
        icon: Send,
      },
    ],
  },
];

export const HEADER_INFO = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutPanelTop,
  },
  {
    label: "Add Production Lines",
    href: "/production-lines/create-new",
    icon: AlignHorizontalDistributeCenter,
  },
  {
    label: "Add ELIoT Devices",
    href: "/eliot-devices/create-new",
    icon: PlusSquare,
  },
  {
    label: "Manage ELIoT Devices",
    href: "/eliot-devices",
    icon: Settings,
  },
  {
    label: "Operator Wise DHU ",
    href: "/analytics/dhu-operator",
    icon: BarChartHorizontal,
  },
  {
    label: "Add Sewing Machines",
    href: "/sewing-machines/create-new",
    icon: PlusSquare,
  },
  {
    label: "Manage Sewing Machines",
    href: "/sewing-machines",
    icon: Settings,
  },
  {
    label: "Sewing Machine types",
    href: "/analytics/machine-type",
    icon: BarChart3,
  },
  {
    label: "Line Individual Efficiency report",
    href: "/analytics/RLine-efficiency",
    icon: Table,
  },
  {
    label: "Roaming QC",
    href: "/analytics/roaming-qc",
    icon: AlignHorizontalDistributeCenter,
  },
  // {
  //     label: "Machine Summary",
  //     href: "/analytics/machine-summary",
  //     icon: TableProperties
  // },
  {
    label: "Machine Summary",
    href: "/analytics/machine-summary-new",
    icon: TableProperties,
  },
  {
    label: "Add Sewing Operators",
    href: "/sewing-operators/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Operator DHU Report",
    href: "/analytics/operator-dhu",
    icon: BarChartHorizontal,
  },
  {
    label: "Manage Sewing Operators",
    href: "/sewing-operators",
    icon: UserRoundCog,
  },
  {
    label: "User Credentials",
    href: "/analytics/qr-generator",
    icon: QrCode,
  },
  {
    label: "Sewing Machine Details",
    href: "/analytics/sm-qr-generator",
    icon: QrCode,
  },
  {
    label: "Add Factory Staff",
    href: "/factory-staffs/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Manage Factory Staff",
    href: "/factory-staffs",
    icon: UserRoundCog,
  },
  {
    label: "Add Portal Account User",
    href: "/portal-accounts/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Manage Portal Account Users",
    href: "/portal-accounts",
    icon: UserRoundCog,
  },
  {
        label: "Avg Efficiency Report- Individual Operator",
    href: "/analytics/operator-report",
    icon: Table,
  },
  {
    label: "Manage Operations",
    href: "/operations",
    icon: Settings,
  },
  {
    label: "Manage Production Lines",
    href: "/production-lines",
    icon: ServerCog,
  },
  {
    label: "Line Individual Efficiency report",
    href: "/analytics/line-efficiency-report",
    icon: Table,
  },
  {
    label: "SMS & Email Alert Logs",
    href: "/alert-logs",
    icon: Mail,
  },
  {
    label: "Create Bulletin",
    href: "/obb-sheets/create-new",
    icon: FileSpreadsheet,
  },
  {
    label: "Manage Bulletin",
    href: "/obb-sheets",
    icon: FileCog,
  },
  {
    label: "Hourly Production Achievements",
    href: "/analytics/hourly-production",
    icon: BarChart3,
  },
  {
    label: "Cycle Time Analysis vs Target SMV",
    href: "/analytics/operation-smv-hourly",
    icon: BarChart3,
  },
  {
    label: "SMV vs Cycle Time",
    href: "/analytics/operation-smv",
    icon: BarChart3,
  },
  {
    label: "Yamuzami Graph",
    href: "/analytics/yamuzami-graph",
    icon: BarChart3,
  },
  {
    label: "Operation Efficiency (60 Minute)",
    href: "/analytics/operation-efficiency-60",
    icon: BarChartHorizontal,
  },
  {
    label: "Production Heatmap (15 Minute)",
    href: "/analytics/operation-efficiency-15",
    icon: BarChartHorizontal,
  },
  {
    label: "Operator Efficiency (60 Minute)",
    href: "/analytics/operator-efficiency-60",
    icon: BarChartHorizontal,
  },
  {
    label: "Operator Efficiency (15 Minute)",
    href: "/analytics/operator-efficiency-15",
    icon: BarChartHorizontal,
  },
  {
    label: "Resource Utilization",
    href: "/analytics/operator-effective-time",
    icon: Table,
  },
  {
    label: "DHU Status",
    href: "/analytics/tls-productions",
    icon: Sliders,
  },

  {
    label: "Opertor Wise DHU",
    href: "/analytics/tls-operators",
    icon: Sliders,
  },
  {
        label: "Hourly Production (Operator)",
        href: "/analytics/operator-hourly",
        icon: BarChartHorizontal,
      },
  {
    label: "Sectional DHU",
    href: "/analytics/defect-chart",
    icon: BarChartHorizontal,
  },

  {
    label: "Daily Target vs Actual - Pieces",
    href: "/analytics/daily-achivement",
    icon: Sliders,
  },
  {
    label: "Daily Target vs Actual (Instance)",
    href: "/analytics/daily-achivement-ins",
    icon: BarChartHorizontal,
  },
  {
    label: "Hourly Production",
    href: "/analytics/production-hourly",
    icon: LocateFixed,
  },
  {
    label: "Overall Performance - Operations (Live Data)",
    href: "/analytics/achievement-rate-operation",
    icon: Sliders,
  },
  {
    label: "Log Records",
    href: "/analytics/log",
    icon: Sliders,
  },
  {
    label: "Overall Operation Efficiency ",
    href: "/analytics/efficiency-rate",
    icon: Sliders,
  },
  {
    label: "Operator Daily Efficiency Report",
    href: "/analytics/daily-report",
    icon: Sliders,
  },
  {
    label: "Operation Efficiency-(15minute)",
    href: "/analytics/operation-efficiency-15m",
    icon: Sliders,
  },
  {
    label: "Line Efficiency Resources",
    href: "/line-efficiency-resources",
    icon: Cable,
  },
  {
    label: "Pitch Graph",
    href: "/analytics/pitch-diagram",
    icon: LineChart,
  },
   {
        label: "Operator Efficiency Overview",
        href: "/analytics/overall-operator",
        icon: BarChartHorizontal,
      },
  {
    label: "Capacity Diagram",
    href: "/analytics/capacity-graph",
    icon: LineChart,
  },
  {
    label: "Top Performence Operators",
    href: "/analytics/top-operator",
    icon: BarChartHorizontal,
  },
];
