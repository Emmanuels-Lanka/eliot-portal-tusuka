"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCallback, useRef } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalCount: number
    pageCount: number
    pageSize: number
    pageIndex: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    totalCount,
    pageCount,
    pageSize: initialPageSize,
    pageIndex: initialPageIndex,
}: DataTableProps<TData, TValue>) {
    const router = useRouter()
    const searchParams = useSearchParams()
    console.log(data,"asdasd")
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [pageSize, setPageSize] = React.useState(initialPageSize || 10)
    const [pageIndex, setPageIndex] = React.useState(initialPageIndex || 0)
    const [searchValue, setSearchValue] = React.useState(
        searchParams.get("search") || ""
    )

    // Use useRef to store the debounce timeout
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Debounced search function with proper dependencies
    const debouncedSearch = useCallback(
        (value: string) => {
            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }

            // Set new timeout
            debounceTimeoutRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", "0"); // Reset to first page on search

                if (value) {
                    params.set("search", value);
                } else {
                    params.delete("search");
                }

                router.push(`?${params.toString()}`);
            }, 500)
        },
        [searchParams, router]
    );

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    const handlePageSizeChange = (value: string) => {
        const newSize = Number(value);
        setPageSize(newSize);

        const params = new URLSearchParams(searchParams.toString());
        params.set("pageSize", newSize.toString());
        params.set("page", "0"); // Reset to first page when changing page size

        router.push(`?${params.toString()}`);
    };

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        pageCount,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater({
                    pageIndex,
                    pageSize,
                });

                // Update URL with new page index
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", newState.pageIndex.toString());
                router.push(`?${params.toString()}`);

                setPageIndex(newState.pageIndex);
            }
        },
    })

    return (
        <div>
            {/* Search bar */}
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Search machine ID or Eliot device ID..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="max-w-sm"
                />
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">Items per page</p>
                    <Select
                        value={pageSize?.toString() || "10"}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100, 500].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            

            {/* Table */}
            <div className="rounded-md border bg-white box-shadow">
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
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination with page info */}
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-gray-500">
                    Showing {pageIndex * pageSize + 1} to{" "}
                    {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}{" "}
                    entries
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-white"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-white"
                    >
                        Next   
                    </Button>
                </div>
            </div>
        </div>
    )
}








// "use client"

// import * as React from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import {
//     ColumnDef,
//     ColumnFiltersState,
//     SortingState,
//     flexRender,
//     getCoreRowModel,
//     getFilteredRowModel,
//     getPaginationRowModel,
//     getSortedRowModel,
//     useReactTable,
// } from "@tanstack/react-table"

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { useCallback } from "react"

// interface DataTableProps<TData, TValue> {
//     columns: ColumnDef<TData, TValue>[]
//     data: TData[]
//     totalCount: number
//     pageCount: number
//     pageSize: number
//     pageIndex: number
// }

// // Utility function for debouncing
// function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;

//   return function (...args: Parameters<T>) {
//     const later = () => {
//       timeout = null;
//       func(...args);
//     };

//     if (timeout !== null) {
//       clearTimeout(timeout);
//     }

//     timeout = setTimeout(later, wait);
//   };
// }

// export function DataTable<TData, TValue>({
//     columns,
//     data,
//     totalCount,
//     pageCount,
//     pageSize: initialPageSize,
//     pageIndex: initialPageIndex,
// }: DataTableProps<TData, TValue>) {
//     const router = useRouter()
//     const searchParams = useSearchParams()
//     console.log(data,"asdasd")
//     const [sorting, setSorting] = React.useState<SortingState>([])
//     const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
//     const [pageSize, setPageSize] = React.useState(initialPageSize)
//     const [pageIndex, setPageIndex] = React.useState(initialPageIndex)
//     const [searchValue, setSearchValue] = React.useState(
//         searchParams.get("search") || ""
//     )

//     // Debounced search function
//     const debouncedSearch = useCallback(
//         debounce((value: string) => {
//             const params = new URLSearchParams(searchParams.toString());
//             params.set("page", "0"); // Reset to first page on search

//             if (value) {
//                 params.set("search", value);
//             } else {
//                 params.delete("search");
//             }

//             router.push(`?${params.toString()}`);
//         }, 500),
//         [searchParams, router]
//     );

//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value;
//         setSearchValue(value);
//         debouncedSearch(value);
//     };

//     const handlePageSizeChange = (value: string) => {
//         const newSize = Number(value);
//         setPageSize(newSize);

//         const params = new URLSearchParams(searchParams.toString());
//         params.set("pageSize", newSize.toString());
//         params.set("page", "0"); // Reset to first page when changing page size

//         router.push(`?${params.toString()}`);
//     };

//     // Create table instance
//     const table = useReactTable({
//         data,
//         columns,
//         pageCount,
//         getCoreRowModel: getCoreRowModel(),
//         manualPagination: true,
//         onSortingChange: setSorting,
//         getSortedRowModel: getSortedRowModel(),
//         onColumnFiltersChange: setColumnFilters,
//         getFilteredRowModel: getFilteredRowModel(),
//         state: {
//             sorting,
//             columnFilters,
//             pagination: {
//                 pageIndex,
//                 pageSize,
//             },
//         },
//         onPaginationChange: (updater) => {
//             if (typeof updater === "function") {
//                 const newState = updater({
//                     pageIndex,
//                     pageSize,
//                 });

//                 // Update URL with new page index
//                 const params = new URLSearchParams(searchParams.toString());
//                 params.set("page", newState.pageIndex.toString());
//                 router.push(`?${params.toString()}`);

//                 setPageIndex(newState.pageIndex);
//             }
//         },
//     })

//     return (
//         <div>
//             {/* Search bar */}
//             <div className="flex items-center justify-between py-4">
//                 <Input
//                     placeholder="Search machine ID or Eliot device ID..."
//                     value={searchValue}
//                     onChange={handleSearchChange}
//                     className="max-w-sm"
//                 />
//                 <div className="flex items-center space-x-2">
//                     <p className="text-sm text-gray-500">Items per page</p>
//                     <Select
//                         value={pageSize.toString()}
//                         onValueChange={handlePageSizeChange}
//                     >
//                         <SelectTrigger className="h-8 w-[70px]">
//                             <SelectValue placeholder={pageSize.toString()} />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {[10, 20, 50, 100, 500].map((size) => (
//                                 <SelectItem key={size} value={size.toString()}>
//                                     {size}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
//             </div>
            

//             {/* Table */}
//             <div className="rounded-md border bg-white box-shadow">
//                 <Table>
//                     <TableHeader className="bg-slate-50">
//                         {table.getHeaderGroups().map((headerGroup) => (
//                             <TableRow key={headerGroup.id}>
//                                 {headerGroup.headers.map((header) => {
//                                     return (
//                                         <TableHead key={header.id}>
//                                             {header.isPlaceholder
//                                                 ? null
//                                                 : flexRender(
//                                                     header.column.columnDef.header,
//                                                     header.getContext()
//                                                 )}
//                                         </TableHead>
//                                     )
//                                 })}
//                             </TableRow>
//                         ))}
//                     </TableHeader>
//                     <TableBody>
//                         {table.getRowModel().rows?.length ? (
//                             table.getRowModel().rows.map((row) => (
//                                 <TableRow
//                                     key={row.id}
//                                     data-state={row.getIsSelected() && "selected"}
//                                 >
//                                     {row.getVisibleCells().map((cell) => (
//                                         <TableCell key={cell.id}>
//                                             {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                         </TableCell>
//                                     ))}
//                                 </TableRow>
//                             ))
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan={columns.length} className="h-24 text-center">
//                                     No results.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </div>

//             {/* Pagination with page info */}
//             <div className="flex items-center justify-between space-x-2 py-4">
//                 <div className="text-sm text-gray-500">
//                     Showing {pageIndex * pageSize + 1} to{" "}
//                     {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}{" "}
//                     entries
//                 </div>
//                 <div className="flex items-center space-x-2">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => table.previousPage()}
//                         disabled={!table.getCanPreviousPage()}
//                         className="bg-white"
//                     >
//                         Previous
//                     </Button>
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => table.nextPage()}
//                         disabled={!table.getCanNextPage()}
//                         className="bg-white"
//                     >
//                         Next   
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }
