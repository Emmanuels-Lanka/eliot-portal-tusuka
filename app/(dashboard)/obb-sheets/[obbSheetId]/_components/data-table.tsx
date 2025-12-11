"use client";

import * as React from "react";
import {
    Ban,
    Loader2,
    Sparkle,
    Trash2,
    MoreHorizontal,
    GripVertical,
    Combine,
    Menu,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ObbOperation, Operation, SewingMachine } from "@prisma/client";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sortable,
    SortableDragHandle,
    SortableItem,
} from "@/components/ui/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmModel from "@/components/model/confirm-model";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import ObbOperationsForm from "./obb-operations-form";
import { handleBulkObbOperationsActivate } from "../../_actions/handle-bulk-obb-operations-activate";
import { handleBulkObbOperationsDeactivate } from "../../_actions/handle-bulk-obb-operations-deactivate";

interface DataTableProps<TData, TValue> {
    data: ObbOperationData[];
    obbSheetId: string;
    operations: Operation[] | null;
    machines: SewingMachine[] | null;
}

export function DataTable<TData, TValue>({
    data: tableData,
    obbSheetId,
    operations,
    machines,
}: DataTableProps<TData, TValue>) {
    const [data, setData] = React.useState<ObbOperationData[]>(tableData);
    const [initialData, setInitialData] =
        React.useState<ObbOperationData[]>(tableData);
    const [isModified, setIsModified] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const updateSeqNoAfterDrag = (newData: ObbOperationData[]) => {
        newData.forEach((item, index) => {
            item.seqNo = index + 1;
        });
        setData([...newData]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`/api/obb-operation/reorder`, {
                obbOperations: data.map((item) => ({
                    id: item.id,
                    seqNo: item.seqNo,
                })),
            });
            toast({
                title: "Successfully re-ordered operations!",
                variant: "success",
            });
            setInitialData([...data]);
            setIsModified(false);
            router.refresh();
        } catch (error: any) {
            console.error("ERROR", error);
            toast({
                title: error.response?.data || "Something went wrong!",
                variant: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        const resetData = [...initialData];
        resetData.forEach((item, index) => {
            item.seqNo = index + 1;
        });
        setData(resetData);
        setIsModified(false);
    };

    // From the `columns.tsx` file
    const ActionCell = ({ row }: { row: any }) => {
        const { id } = row.original;

        const onDelete = async (obbOperationId: string) => {
            try {
                setIsLoading(true);
                await axios.delete(`/api/obb-operation/${obbOperationId}`);
                window.location.reload();
                toast({
                    title: "Successfully removed OBB operation!",
                    variant: "success",
                });
            } catch (error: any) {
                console.error("ERROR", error);
                toast({
                    title:
                        error.response.data ||
                        "Something went wrong! Try again",
                    variant: "error",
                });
            } finally {
                setIsLoading(false);
            }
        };

        const handleStatus = async (obbOperationId: string) => {
            const route: string = row.original.isActive ? "deactive" : "active";
            try {
                setIsLoading(true);
                await axios.patch(
                    `/api/obb-operation/${obbOperationId}/${route}`
                );
                window.location.reload();
                toast({
                    title: `Successfully ${route}ed OBB operation!`,
                    variant: "success",
                });
            } catch (error: any) {
                console.error("STATUS_CHANGE_ERROR", error);
                toast({
                    title: error.response.data || "Something went wrong! Try again",
                    variant: "error",
                });
            }
            setIsLoading(false);
        };

        return (
            <div className="w-full flex justify-between items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
                            <span className="sr-only">Open menu</span>
                            {/* <MoreHorizontal className="h-4 w-4" /> */}
                            <Menu className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        <ObbOperationsForm
                            defaultData={row.original}
                            obbSheetId={obbSheetId}
                            operations={operations}
                            machines={machines}
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={isLoading}
                            onClick={() => handleStatus(id)}
                            className={cn(
                                "gap-2 font-medium",
                                row.original.isActive === true
                                    ? "text-red-500 hover:text-red-500"
                                    : "text-green-600"
                            )}
                        >
                            {row.original.isActive === true ? (
                                <Ban className="w-4 h-4" />
                            ) : (
                                <Sparkle className="w-4 h-4" />
                            )}
                            {row.original.isActive === true
                                ? "Deactive"
                                : "Active"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmModel onConfirm={() => onDelete(id)}>
                            <Button
                                size="sm"
                                disabled={isLoading}
                                variant="destructive"
                                className="w-full gap-2 justify-start"
                            >
                                <Loader2
                                    className={cn(
                                        "animate-spin w-4 h-4 hidden",
                                        isLoading && "flex"
                                    )}
                                />
                                <Trash2
                                    className={cn(
                                        "w-4 h-4",
                                        isLoading && "hidden"
                                    )}
                                />
                                Delete
                            </Button>
                        </ConfirmModel>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className={cn("hidden px-1.5 pt-[7px] pb-1.5 bg-[#0070c0] rounded-full", row.original.isCombined && "flex")}>
                    <Combine className="size-4 text-white" />
                </div>
                <div
                    className={cn(
                        "w-2.5 h-2.5 bg-orange-600 rounded-full",
                        row.original.isActive === true &&
                        "w-2 h-2 bg-green-600 animate-ping"
                    )}
                />
            </div>
        );
    };

    const handleBulkStatus = async ({ type }: { type: "activate" | "deactivate" }) => {
        setIsBulkUpdating(true);
        const selectedOperations = table.getFilteredSelectedRowModel().rows.map((op) => op.original);

        try {
            const results = type === "activate" ?
                await handleBulkObbOperationsActivate(selectedOperations) :
                await handleBulkObbOperationsDeactivate(selectedOperations);

            console.log("Update Results:", results);
            
        } catch (error: any) {
            console.error("BULK_STATUS_ERROR", error);
            toast({
                title: error.response.data || "Something went wrong! Try again",
                variant: "error",
            });
        } finally {
            table.getFilteredSelectedRowModel().rows.push();
            setIsBulkUpdating(false);
            window.location.reload();
        }

        // try {
        //     setIsBulkUpdating(true);
        //     const data = await axios.put(`/api/obb-operation/bulk/${type}`, {
        //         obbOperationIds,
        //     });
        //     window.location.reload();
        //     toast({
        //         title: `Successfully ${type === "active" ? "activated" : "deactivated"
        //             } the selected operations!`,
        //         variant: "success",
        //     });
        // } catch (error: any) {
        //     console.error("BULK_STATUS_ERROR", error);
        //     toast({
        //         title: error.response.data || "Something went wrong! Try again",
        //         variant: "error",
        //     });
        // } finally {
        //     table.getFilteredSelectedRowModel().rows.push();
        //     setIsBulkUpdating(false);
        // }
    };

    const columns: ColumnDef<ObbOperation | any>[] = [
        {
            id: "select",
            header: ({ table }) => {
                // Get only the rows that are not combined
                const selectableRows = table.getFilteredRowModel().rows.filter(
                    (row) => !row.original.isCombined
                );

                const allSelectableRowsSelected = selectableRows.every((row) =>
                    table.getSelectedRowModel().rows.includes(row)
                );

                return (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value: any) =>
                            // table.toggleAllPageRowsSelected(!!value)

                            // Only toggle selectable rows (isCombined: false)
                            selectableRows.forEach((row) =>
                                row.toggleSelected(!allSelectableRowsSelected)
                            )
                        }
                        aria-label="Select all"
                    />
                )
            },
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: any) =>
                        row.toggleSelected(!!value)
                    }
                    disabled={row.original.isCombined}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "seqNo",
            header: "Seq No",
        },
        {
            accessorFn: (row) => row.operation?.name,
            id: "operation.name",
            header: "Operation Desc",
            cell: (info) => info.getValue() || "-",
        },
        {
            accessorFn: (row) => row.operation?.code,
            id: "operation.code",
            header: "Op. Code",
            cell: (info) => info.getValue() || "-",
        },
        {
            accessorFn: (row) => row.sewingMachine?.machineId,
            id: "sewingMachine.machineId",
            header: "Machine",
            cell: (info) => info.getValue() || "-",
        },
        {
            accessorKey: "supervisor.name",
            header: "Supervisor",
        },
        {
            accessorKey: "smv",
            header: "SMV",
        },
        {
            accessorKey: "target",
            header: "Target",
        },
        {
            accessorKey: "part",
            header: "Part",
        },
        {
        accessorKey: "lineTarget",
        header: "Line Target",
        cell: ({ row }) => {
            return row.original.lineTarget ?? "-";
        },
        },
        // {
        //     accessorKey: "spi",
        //     header: "SPI",
        // },
        // {
        //     accessorKey: "length",
        //     header: "Length",
        // },
        // {
        //     accessorKey: "totalStitches",
        //     header: "Stitches",
        // },
        {
            id: "actions",
            header: () => <p className="text-center">Actions</p>,
            cell: ({ row }) => <ActionCell row={row} />,
            enableHiding: false,
            enableSorting: false,
        },
        {
            id: "drag",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <SortableDragHandle
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={row.original.isCombined}
                    >
                        <GripVertical className="size-4" aria-hidden="true" />
                    </SortableDragHandle>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
        manualPagination: false,
        initialState: {
            pagination: {
                pageSize: 150,
            },
        },
    });

    return (
        <div>
            <div className="flex justify-between items-end">
                {/* Filters */}
                <div className="flex items-center pt-4 space-x-4">
                    <Input
                        placeholder="Search Operation..."
                        value={
                            (table
                                .getColumn("operation.name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("operation.name")
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    <Input
                        placeholder="Search Machine ID..."
                        value={
                            (table
                                .getColumn("sewingMachine.machineId")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("sewingMachine.machineId")
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />

                    <Select
                        value={
                            (table
                                .getColumn("part")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onValueChange={(value) =>
                            table.getColumn("part")?.setFilterValue(value)
                        }
                    >
                        <SelectTrigger className="max-w-sm">
                            <SelectValue placeholder="Select Part" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Front">Front</SelectItem>
                            <SelectItem value="Back">Back</SelectItem>
                            <SelectItem value="line-end">Line-end</SelectItem>
                            <SelectItem value="assembly">Assembly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Update buttons */}
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="mt-4 space-x-4">
                        <Button
                            onClick={() => handleBulkStatus({ type: "activate" })}
                            className="bg-green-600 hover:bg-green-600 hover:opacity-90"
                            disabled={isBulkUpdating}
                        >
                            <Sparkle className="w-4 h-4" />
                            Activate
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                handleBulkStatus({ type: "deactivate" })
                            }
                            className="gap-1"
                            disabled={isBulkUpdating}
                        >
                            <Ban className="w-4 h-4" />
                            Deactivate
                        </Button>
                    </div>
                )}

                {/* Re-order buttons */}
                {isModified && (
                    <div className="flex gap-4">
                        <Button
                            onClick={handleCancel}
                            variant="link"
                            className="text-red-600"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-32"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white/50 mt-4 max-h-[780px] overflow-y-auto">
                {isBulkUpdating ? (
                    <div className="w-full h-[600px] flex flex-col justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin w-6 h-6" />
                        Bulk operation in progress...
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column
                                                            .columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <Sortable
                                value={data}
                                // onValueChange={setData}
                                onValueChange={(newOrder) => {
                                    updateSeqNoAfterDrag(newOrder);
                                    setIsModified(true); // Indicate that changes were made
                                }}
                                overlay={
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <div className="h-12 w-full bg-accent/10" />
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                }
                            >
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <SortableItem
                                            key={row.id}
                                            value={row.original.id}
                                            asChild
                                        >
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    "selected"
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        </SortableItem>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Sortable>
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="mt-3 flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>

            {/* Pagination */}
            {/* <div className="flex items-center justify-end space-x-2 pb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="bg-white"
                >
                    Previous
                </Button>
                <span className="text-sm text-slate-500">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {Math.ceil(
                        table.getCoreRowModel().rows.length /
                            table.getState().pagination.pageSize
                    )}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="bg-white"
                >
                    Next
                </Button>
            </div> */}
        </div>
    );
}
