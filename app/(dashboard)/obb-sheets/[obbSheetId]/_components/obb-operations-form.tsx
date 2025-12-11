"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Check,
    ChevronsUpDown,
    Edit,
    Info,
    Loader2,
    Plus,
    PlusCircle,
    Zap,
} from "lucide-react";
import { ObbOperation, Operation, SewingMachine } from "@prisma/client";
import { useWatch } from "react-hook-form";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchCurrentOperationsCount } from "../../_actions/fetch-current-operations-count";

interface ObbOperationsFormProps {
    defaultData?: ObbOperation;
    obbSheetId: string;
    operations: Operation[] | null;
    machines: SewingMachine[] | null;
    obbSheetLineTarget?: number | null;
}

const formSchema = z.object({
    seqNo: z.number(),
    operationId: z.string().min(1, "Operation is required"),
    sewingMachineId: z.string(),
    smv: z.string(),
    target: z.number(),
    spi: z.number(),
    length: z.number(),
    totalStitches: z.number(),
    obbSheetId: z.string(),
    part: z.string(),
    isCombined: z.boolean().default(false),
    lineTarget: z.number().optional().nullable(),
});

const ObbOperationsForm = ({
    defaultData,
    obbSheetId,
    operations,
    machines,
    obbSheetLineTarget,
}: ObbOperationsFormProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // seqNo: defaultData?.seqNo,
            seqNo: defaultData?.seqNo || 0,
            operationId: defaultData?.operationId || "",
            sewingMachineId: defaultData?.sewingMachineId || "",
            smv: defaultData?.smv.toString() || "",
            target: defaultData?.target,
            spi: defaultData?.spi || 0,
            length: defaultData?.length || 0,
            totalStitches: defaultData?.totalStitches || 0,
            obbSheetId: obbSheetId,
            part: defaultData?.part || "",
            isCombined: defaultData?.isCombined || false,
            lineTarget: defaultData?.lineTarget || obbSheetLineTarget || null,
        },
    });

    const sewingMachineId = useWatch({ control: form.control, name: "sewingMachineId" });
    const lineTargetValue = useWatch({ control: form.control, name: "lineTarget",});

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid },
    } = form;

    useEffect(() => {
        const fetchObbOperations = async () => {
            const operationsCount = await fetchCurrentOperationsCount(
                obbSheetId
            );
            form.setValue("seqNo", operationsCount + 1);
        };
        if (!defaultData) {
            fetchObbOperations();
        }
    }, [obbSheetId, form, defaultData, isDialogOpen]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log("Form Data on Submit:", data);
        try {
            const endpoint = defaultData
                ? `/api/obb-operation/${defaultData.id}`
                : "/api/obb-operation";
            const method = defaultData ? axios.put : axios.post;

            const response = await method(endpoint, data);
            console.log("end point Data", endpoint);
            toast({
                title: `Successfully ${
                    defaultData ? "updated" : "created"
                } OBB operation`,
                variant: "success",
            });
            router.refresh();
            form.reset();
            setIsDialogOpen(false);
            window.location.reload();
        } catch (error: any) {
            toast({
                title:
                    error.response?.data || "Something went wrong! Try again",
                variant: "error",
            });
        }
    };

    const handleUnassign = async () => {
        if (defaultData && defaultData.sewingMachineId) {
            try {
                await axios.put(
                    `/api/obb-operation/${defaultData.id}/unassign-machine?machineId=${defaultData.sewingMachineId}`
                );
                toast({
                    title: "Successfully unassigned",
                    variant: "success",
                });
            } catch (error: any) {
                toast({
                    title:
                        error.response?.data ||
                        "Something went wrong! Try again",
                    variant: "error",
                });
            } finally {
                setIsDialogOpen(false);
                window.location.reload();
            }
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        form.reset({
            seqNo: defaultData?.seqNo || 0,
            operationId: defaultData?.operationId || "",
            sewingMachineId: defaultData?.sewingMachineId || "",
            smv: defaultData?.smv.toString() || "",
            target: defaultData?.target || 0,
            spi: defaultData?.spi || 0,
            length: defaultData?.length || 0,
            totalStitches: defaultData?.totalStitches || 0,
            obbSheetId: obbSheetId,
            part: defaultData?.part || "",
            lineTarget: defaultData?.lineTarget || obbSheetLineTarget || null,
        });
    };

    return (
        <Dialog open={isDialogOpen}>
            <DialogTrigger asChild>
                {defaultData ? (
                    <Button
                        className="w-full flex justify-start gap-2 pr-5"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                ) : (
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="ghost"
                        className="text-base"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Create new
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-md:py-8 md:p-8 w-full">
                <DialogHeader className="mt-2">
                    <DialogTitle>
                        {defaultData ? "Update " : "Create new "} OBB Operation
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4"
                    >
                        {obbSheetLineTarget && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                               <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="font-medium text-blue-900">
                            OBB Sheet Line Target:{" "}
                            <span className="font-bold">{obbSheetLineTarget}</span>{" "}
                            pieces/day
                        </p>
                        <p className="text-blue-700 text-xs mt-1">
                            This is the default line target. You can customize it for this operation below.
                        </p>
                        </div>
                    </div>
                )}
                        <div className="w-full flex gap-x-4 items-end">
                            <FormField
                                control={form.control}
                                name="operationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Operation</FormLabel>
                                        <Popover
                                            open={open1}
                                            onOpenChange={setOpen1}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open1}
                                                    className="w-full justify-between font-normal"
                                                >
                                                    {operations ? (
                                                        <>
                                                            {field.value
                                                                ? operations.find(
                                                                      (
                                                                          operation
                                                                      ) =>
                                                                          operation.id ===
                                                                          field.value
                                                                  )?.name
                                                                : "Select Operation..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </>
                                                    ) : (
                                                        "No operation available!"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search operation..." />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No operation found!
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {operations &&
                                                                operations.map(
                                                                    (
                                                                        operation
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                operation.id
                                                                            }
                                                                            value={
                                                                                operation.name
                                                                            }
                                                                            onSelect={() => {
                                                                                form.setValue(
                                                                                    "operationId",
                                                                                    operation.id
                                                                                );
                                                                                setOpen1(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value ===
                                                                                        operation.id
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {
                                                                                operation.name
                                                                            }
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sewingMachineId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Machine</FormLabel>
                                        <Popover
                                            open={open2}
                                            onOpenChange={setOpen2}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open2}
                                                    className="w-full justify-between font-normal"
                                                >
                                                    {machines ? (
                                                        <>
                                                            {field.value
                                                                ? machines.find(
                                                                      (
                                                                          machine
                                                                      ) =>
                                                                          machine.id ===
                                                                          field.value
                                                                  )?.machineId
                                                                : "Select machine ID..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </>
                                                    ) : (
                                                        "No machine available!"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search machine..." />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No machine found!
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {/* {machines?.filter(machine => !assignedMachinesToOperations?.includes(machine.id)).map((machine) => ( */}
                                                            {machines?.map(
                                                                (machine) => (
                                                                    <CommandItem
                                                                        key={
                                                                            machine.id
                                                                        }
                                                                        value={
                                                                            machine.machineId
                                                                        }
                                                                        onSelect={() => {
                                                                            form.setValue(
                                                                                "sewingMachineId",
                                                                                machine.id
                                                                            );
                                                                            setOpen2(
                                                                                false
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value ===
                                                                                    machine.id
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {`${machine.brandName}-${machine.machineType}-${machine.machineId}`}
                                                                    </CommandItem>
                                                                )
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {defaultData && defaultData.sewingMachineId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleUnassign}
                                >
                                    Unassign
                                </Button>
                            )}
                        </div>

                        <div className="w-full flex gap-x-2">
                            <div className="w-28">
                                <FormField
                                    control={form.control}
                                    name="seqNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seq</FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        form.setValue(
                                                            "seqNo",
                                                            value === ""
                                                                ? 0
                                                                : Number(value)
                                                        );
                                                    }}
                                                    onBlur={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        form.setValue(
                                                            "seqNo",
                                                            value === ""
                                                                ? 0
                                                                : Number(value)
                                                        );
                                                    }}
                                                    placeholder="seqNo"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-2/3">
                                <FormField
                                    control={form.control}
                                    name="part"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Part</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={
                                                    defaultData
                                                        ? (defaultData.part as string)
                                                        : field.value
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select part" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="front">
                                                        FRONT
                                                    </SelectItem>
                                                    <SelectItem value="back">
                                                        BACK
                                                    </SelectItem>
                                                    <SelectItem value="assembly">
                                                        ASSEMBLY
                                                    </SelectItem>
                                                    <SelectItem value="line-end">
                                                        LINE END
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="smv"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SMV</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isSubmitting}
                                                placeholder="smv"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="hide-steps-number-input"
                                                disabled={isSubmitting}
                                                {...field}
                                                onChange={(e) => {
                                                    const newValue: number =
                                                        parseInt(
                                                            e.target.value
                                                        );
                                                    form.setValue(
                                                        "target",
                                                        newValue,
                                                        {
                                                            shouldValidate:
                                                                true,
                                                            shouldDirty: true,
                                                        }
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <div className="w-16">
                                <FormField
                                    control={form.control}
                                    name="spi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                spi
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="hide-steps-number-input"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const newValue: number = parseInt(e.target.value);
                                                        form.setValue('spi', newValue, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-16">
                                <FormField
                                    control={form.control}
                                    name="length"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Length
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="hide-steps-number-input"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const newValue: number = parseInt(e.target.value);
                                                        form.setValue('length', newValue, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-44">
                                <FormField
                                    control={form.control}
                                    name="totalStitches"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="max-lg:line-clamp-1">
                                                Total Stitches
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="hide-steps-number-input"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const newValue: number = parseInt(e.target.value);
                                                        form.setValue('totalStitches', newValue, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div> */}
                        </div>
                        {/* <Input {...register("operationId")} placeholder="Operation ID" /> */}
                        
                        <div>
                            {/* ✅ Line Target Field - Editable for each operation */}
                            <FormField
                              control={form.control}
                              name="lineTarget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Line Target for This Operation
                                    <div className="relative group">
                                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                        <div className="font-medium mb-1">
                                                    Operation Line Target
                                        </div>
                                        <div className="leading-relaxed">
                                                    • Set a custom line target for this specific operation
                                                    <br />• Defaults to OBB sheet line target:{" "}
                                                    {obbSheetLineTarget || "N/A"}
                                                    <br />
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                      </div>
                                    </div>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="hide-steps-number-input"
                                      disabled={isSubmitting}
                                      placeholder={`Default: ${
                                        obbSheetLineTarget || "Not set"
                                      }`}
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                                    field.onChange(
                                                      value === "" ? null : parseInt(value)
                                                    );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Leave empty to use OBB sheet default (
                                    {obbSheetLineTarget || "N/A"})
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>

                        <div>
                            <FormField
                                control={form.control}
                                name="isCombined"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Is this combined operations?
                                            </FormLabel>
                                            <FormDescription>
                                                If this machine will work for multiple operations.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={!sewingMachineId}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <div className="mt-4 flex justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex gap-2 pr-5 text-red-600"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className="flex gap-2 pr-5 w-40"
                                >
                                    <Zap
                                        className={cn(
                                            "w-5 h-5",
                                            isSubmitting && "hidden"
                                        )}
                                    />
                                    <Loader2
                                        className={cn(
                                            "animate-spin w-5 h-5 hidden",
                                            isSubmitting && "flex"
                                        )}
                                    />
                                    Save
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ObbOperationsForm;
