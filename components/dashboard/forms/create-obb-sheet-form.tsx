"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { ObbSheet, ProductionLine, Staff } from "@prisma/client";
import { ArrowLeft, Info, Loader2, Zap } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SelectBundleStyles from "../common/select-bundle-styles";
import moment from "moment-timezone";

interface CreateObbSheetFormProps {
  units:
    | {
        name: string;
        id: string;
      }[]
    | null;
  mechanics: Staff[] | null;
  supervisor: Staff[] | null;
  qualityInspector: Staff[] | null;
  industrialEngineer: Staff[] | null;
  accessoriesInputMan: Staff[] | null;
  fabricInputMan: Staff[] | null;
  lineChief: Staff[] | null;
  initialData?: ObbSheet | null;
  obbSheetId?: string;
  mode?: string;
  user?: {
    email: string;
    role: string;
  };
}

const formSchema = z.object({
  version: z.string(),
  unitId: z.string().min(1, {
    message: "Production Unit is required",
  }),
  productionLineId: z.string().min(1, {
    message: "Production Line is required",
  }),
  indEngineer: z.string().min(1, {
    message: "Industrial Engineer is required",
  }),
  supervisor1: z.string().min(1, {
    message: "Supervisor is required",
  }),
  supervisor2: z.string().nullable(),
  supervisor3: z.string().nullable(),
  supervisor4: z.string().nullable(),
  mechanic: z.string().min(1, {
    message: "Mechanic is required",
  }),
  qualityIns: z.string().min(1, {
    message: "Quality Inspector is required",
  }),
  accInputMan: z.string().min(1, {
    message: "Accessories Input Man is required",
  }),
  fabInputMan: z.string().min(1, {
    message: "Fabric Input Man is required",
  }),
  lineChief: z.string().min(1, {
    message: "Line chief is required",
  }),
  buyer: z.string().min(1, {
    message: "Buyer is required",
  }),
  style: z.string().min(1, {
    message: "Style is required",
  }),
  item: z.string().min(1),
  operators: z.number(),
  helpers: z.number(),
  startingDate: z.date(),
  endingDate: z.date(),
  factoryStartTime: z.string().optional(),
  factoryStopTime: z.string().optional(),
  intervalStartTime: z.string().optional(),
  intervalStopTime: z.string().optional(),
  bundleTime: z.string().optional(),
  personalAllowance: z.string().optional(),
  workingHours: z.number().optional(),
  efficiencyLevel1: z.number().optional(),
  efficiencyLevel2: z.number().optional(),
  efficiencyLevel3: z.number().optional(),
  itemReference: z.string().optional().nullable(),
  totalMP: z.number().optional().nullable(),
  totalSMV: z.string().optional(),
  obbOperationsNo: z.number().optional(),
  availableMinPerHour: z.number().optional(),
  bottleNeckTarget: z.number().optional().nullable(),
  target100: z.number().optional().nullable(),
  ucl: z.number().optional().nullable(),
  lcl: z.number().optional().nullable(),
  balancingLoss: z.number().optional().nullable(),
  balancingRatio: z.number().optional().nullable(),
  colour: z.string(),
  supResponseTime: z.number().optional().nullable(),
  mecResponseTime: z.number().optional().nullable(),
  qiResponseTime: z.number().optional().nullable(),
  lineTarget: z.number().optional().nullable(),
});

const CreateObbSheetForm = ({
  units,
  mechanics,
  supervisor,
  qualityInspector,
  industrialEngineer,
  accessoriesInputMan,
  fabricInputMan,
  lineChief,
  initialData,
  obbSheetId,
  mode,
  user,
}: CreateObbSheetFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const startingDateFormated = initialData?.startingDate
    ? new Date(initialData.startingDate)
    : undefined;
  const endingDateFormated = initialData?.endingDate
    ? new Date(initialData.endingDate)
    : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: initialData?.version || "1.0",
      unitId: initialData?.unitId || "",
      productionLineId: initialData?.productionLineId || "",
      indEngineer: initialData?.indEngineerId || "",
      supervisor1: initialData?.supervisorFrontId || "",
      supervisor2: initialData?.supervisorBackId || "",
      supervisor3: initialData?.supervisorAssemblyId || "",
      supervisor4: initialData?.supervisorLineEndId || "",
      mechanic: initialData?.mechanicId || "",
      qualityIns: initialData?.qualityInsId || "",
      accInputMan: initialData?.accInputManId || "",
      fabInputMan: initialData?.fabInputManId || "",
      lineChief: initialData?.lineChiefId || "",
      buyer: initialData?.buyer || "",
      style: initialData?.style || "",
      item: initialData?.item || "",
      operators: initialData?.operators || 0,
      helpers: initialData?.helpers || 0,
      startingDate: startingDateFormated || undefined,
      endingDate: endingDateFormated || undefined,
      factoryStartTime: initialData?.factoryStartTime || "",
      factoryStopTime: initialData?.factoryStopTime || "",
      intervalStartTime: initialData?.intervalStartTime || "",
      intervalStopTime: initialData?.intervalStopTime || "",
      bundleTime: initialData?.bundleTime || "",
      personalAllowance: initialData?.personalAllowance || "",
      workingHours: initialData?.workingHours || 10,
      efficiencyLevel1: initialData?.efficiencyLevel1 || 0,
      efficiencyLevel2: initialData?.efficiencyLevel2 || 0,
      efficiencyLevel3: initialData?.efficiencyLevel3 || 0,
      itemReference: initialData?.itemReference || "",
      totalMP: initialData?.totalMP || 0,
      totalSMV: initialData?.totalSMV?.toString() || "0.1",
      obbOperationsNo: initialData?.obbOperationsNo || undefined,
      availableMinPerHour: initialData?.availableMinPerHour || undefined,
      bottleNeckTarget: initialData?.bottleNeckTarget || 0,
      target100: initialData?.target100 || 0,
      ucl: initialData?.ucl || 0,
      lcl: initialData?.lcl || 0,
      balancingLoss: initialData?.balancingLoss || 0,
      balancingRatio: initialData?.balancingRatio || 0,
      colour: initialData?.colour || "",
      supResponseTime: initialData?.supResponseTime || 10,
      mecResponseTime: initialData?.mecResponseTime || 15,
      qiResponseTime: initialData?.qiResponseTime || 12,
      lineTarget: initialData?.lineTarget || 0,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const [lines, setLines] = useState<ProductionLine[]>([]);
  // const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const handleUnitChange = async (selectedUnitId: string) => {
    try {
      const response = await axios.get(
        `/api/production-line?unitId=${selectedUnitId}`
      );
      setLines(response.data.data);
    } catch (error) {
      console.error("Error fetching production lines:", error);
    }
  };

  useEffect(() => {
    if (mode !== "create") {
      handleUnitChange(initialData?.unitId as string);
    }
  });

  const handleCreateActivityLog = async (activity: string) => {
    const payload = {
      part: "Obb Sheet",
      activity,
    };
    console.log("Created activity log: ", activity);

    try {
      const res = await axios.post("/api/activity-log", payload);
    } catch (error: any) {
      console.error("ERROR", error);
      toast({
        title: error.response.data || "Something went wrong! Try again",
        variant: "error",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (mode && mode === "create") {
      try {
        const res = await axios.post("/api/obb-sheet", data);
        toast({
          title: `Successfully created new OBB sheet: ${res.data.data.style}`,
          variant: "success",
        });
        router.push(`/obb-sheets/${res.data.data.id}`);
        router.refresh();
      } catch (error: any) {
        console.error("ERROR", error);
        toast({
          title: error.response.data || "Something went wrong! Try again",
          variant: "error",
        });
      } finally {
        const selectedLine = lines.find(
          (line) => line.id === data.productionLineId
        );
        const productionLineName = selectedLine?.name ?? "Unknown Line";
        await handleCreateActivityLog(
          `Created new OBB sheet for style ${
            data.style
          } , ${productionLineName} by ${user?.email ?? "unknown"} (${
            user?.role
          })`
        );
      }
    } else {
      try {
        const res = await axios.put(`/api/obb-sheet/${obbSheetId}`, data);
        toast({
          title: "Updated successfully",
          variant: "success",
        });
        router.refresh();
      } catch (error: any) {
        console.error("ERROR", error);
        toast({
          title: error.response.data || "Something went wrong! Try again",
          variant: "error",
        });
      } finally {
        await handleCreateActivityLog(
          `Updated the OBB style (${data.style}) by ${
            user?.email ?? "unknown"
          } (${user?.role})`
        );
      }
    }
  };

  useEffect(() => {
    const fetchOBBOperations = async () => {
      try {
        const response = await axios.get(
          `/api/obb-sheet?obbSheetId=${obbSheetId}`
        );

        // console.log(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
    };

    fetchOBBOperations();
  }, [obbSheetId]);

  const calculateWorkingHours = (startTime: string, stopTime: string) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [stopHours, stopMinutes] = stopTime.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0);

    const stopDate = new Date();
    stopDate.setHours(stopHours, stopMinutes, 0);

    // Calculate the difference in milliseconds
    const timeDiff = stopDate.getTime() - startDate.getTime();

    // Convert milliseconds to total hours (including fractional part)
    const totalHours = timeDiff / (1000 * 60 * 60); // 1 hour = 1000 * 60 * 60 ms

    return totalHours;
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl border rounded-lg",
        mode === "create"
          ? "shadow-xl my-16 px-12 pt-6 pb-10 max-xl:px-8 max-xl:pt-4"
          : "bg-slate-100 px-8 pt-4 pb-8"
      )}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <div className="flex flex-col gap-y-6">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OBB Version</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. '1.0'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Production Unit</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleUnitChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units &&
                          units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionLineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Production Line</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lines.length > 0 &&
                          lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lineChief"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Line Chief</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lineChief &&
                          lineChief.map((lc) => (
                            <SelectItem key={lc.id} value={lc.id}>
                              {lc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="indEngineer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Responsible Industrial Engineer
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industrialEngineer &&
                          industrialEngineer.map((eng) => (
                            <SelectItem key={eng.id} value={eng.id}>
                              {eng.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
    control={form.control}
    name="supervisor1"
    render={({ field }) => (
        <FormItem>
            <FormLabel className="text-sm">
                Supervisor Front
            </FormLabel>
            <Select
                onValueChange={field.onChange} // Remove setSelectedSupervisor from here
                defaultValue={field.value}
            >
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {supervisor && supervisor.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FormMessage />
        </FormItem>
    )}
/>
              <FormField
                control={form.control}
                name="supervisor2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Supervisor Back</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisor &&
                          supervisor.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supervisor3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Supervisor Assembly
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisor &&
                          supervisor.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisor4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Supervisor Line End</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisor &&
                          supervisor.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mechanic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Responsible Mechanic
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mechanics &&
                          mechanics.map((mech) => (
                            <SelectItem key={mech.id} value={mech.id}>
                              {mech.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qualityIns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Responsible Quality Inspector
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualityInspector &&
                          qualityInspector.map((qi) => (
                            <SelectItem key={qi.id} value={qi.id}>
                              {qi.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-6">
              <FormField
                control={form.control}
                name="accInputMan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Responsible Accessories Input Man
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accessoriesInputMan &&
                          accessoriesInputMan.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fabInputMan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Responsible Fabric Input Man
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fabricInputMan &&
                          fabricInputMan.map((fab) => (
                            <SelectItem key={fab.id} value={fab.id}>
                              {fab.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buyer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the buyer name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                                control={form.control}
                                name="style"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Style
                                        </FormLabel>
                                        <FormControl>
                                            
                                            <SelectBundleStyles 
                                                defaultValue={field.value}
                                                onChange={(value) => {
                                                    // console.log("Selected style:", value);
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Style</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the style"
                        value={field.value ?? ""} // Ensure value is always a string
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the item"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startingDate"
                render={({
                  field,
                }: {
                  field: FieldValues["fields"]["date"];
                }) => (
                  <FormItem>
                    <FormLabel>Starting Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                        placeholder="Enter starting date."
                        {...field}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          form.setValue("startingDate", selectedDate, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endingDate"
                render={({
                  field,
                }: {
                  field: FieldValues["fields"]["date"];
                }) => (
                  <FormItem>
                    <FormLabel>Ending Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                        placeholder="Enter ending date."
                        {...field}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          form.setValue("endingDate", selectedDate, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoryStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factory Starting Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={isSubmitting}
                        placeholder="Enter starting time    "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="factoryStopTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factory Stoping Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={
                          isSubmitting || !form.watch("factoryStartTime")
                        }
                        placeholder="Enter starting time    "
                        {...field}
                        onChange={(e) => {
                          const stopTime = e.target.value;
                          const startTime = form.watch("factoryStartTime");

                          field.onChange(stopTime);

                          if (startTime && stopTime) {
                            const totalHours = calculateWorkingHours(
                              startTime,
                              stopTime
                            );
                            console.log(
                              `Working hours: ${totalHours.toFixed(2)} hours`
                            );
                            form.setValue("workingHours", totalHours);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Starting Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={isSubmitting}
                        placeholder="Enter starting time    "
                        value={field.value ? field.value.slice(0, 5) : ""}
                        onChange={(e) => field.onChange(`${e.target.value}:00`)} // Appends :00
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalStopTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Ending Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={isSubmitting}
                        placeholder="Enter Interval Ending time    "
                        value={field.value ? field.value.slice(0, 5) : ""}
                        onChange={(e) => field.onChange(`${e.target.value}:00`)} // Appends :00
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-6">
              <FormField
                control={form.control}
                name="totalSMV"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total SMV</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g '0.32'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableMinPerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Min Per Hour</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="hide-steps-number-input"
                        disabled={isSubmitting}
                        placeholder="Enter the number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (Number(value) >= 0 && Number(value) <= 60)
                          ) {
                            field.onChange(e);
                            const newValue: number = parseInt(value);
                            form.setValue(
                              "availableMinPerHour",
                              newValue || undefined,
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="obbOperationsNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      No of Obb Operations (Helper + Iron + Sewing)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="hide-steps-number-input"
                        disabled={isSubmitting}
                        placeholder="Enter the number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || Number(value) >= 0) {
                            field.onChange(e);
                            const newValue: number = parseInt(value);
                            form.setValue(
                              "obbOperationsNo",
                              newValue || undefined,
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bundleTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Time (Minutes)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g '0.32'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personalAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowance (%)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g '60'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="hide-steps-number-input"
                        disabled={true}
                        placeholder="(End time - Start time)"
                        {...field}
                        // onChange={(e) => {
                        //     const newValue: number = parseInt(e.target.value);
                        //     form.setValue('workingHours', newValue, { shouldValidate: true, shouldDirty: true });
                        // }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="efficiencyLevel1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efficiency Set Level 1 (Low) - TLS</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="hide-steps-number-input"
                        disabled={isSubmitting}
                        placeholder="Enter the number"
                        {...field}
                        onChange={(e) => {
                          const newValue: number = parseInt(e.target.value);
                          form.setValue("efficiencyLevel1", newValue, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="efficiencyLevel3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efficiency Set Level 3 (High) - TLS</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="hide-steps-number-input"
                        disabled={isSubmitting}
                        placeholder="Enter the number"
                        {...field}
                        onChange={(e) => {
                          const newValue: number = parseInt(e.target.value);
                          form.setValue("efficiencyLevel3", newValue, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Item Reference</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the value"
                        value={field.value ?? ""} // Ensure value is always a string
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colour</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the colour"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                                control={form.control}
                                name="supResponseTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Supervisor Response Time
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="hide-steps-number-input"
                                                disabled={isSubmitting}
                                                placeholder="Enter the time"
                                                value={field.value ?? 0}   // Nullable input
                                                onChange={(e) => {
                                                    const newValue: number = parseInt(e.target.value);
                                                    form.setValue('supResponseTime', newValue, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                onBlur={field.onBlur}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mecResponseTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mechanic Response Time
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="hide-steps-number-input"
                                                disabled={isSubmitting}
                                                placeholder="Enter the time"
                                                value={field.value ?? 0}   // Nullable input
                                                onChange={(e) => {
                                                    const newValue: number = parseInt(e.target.value);
                                                    form.setValue('mecResponseTime', newValue, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                onBlur={field.onBlur}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="qiResponseTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            QI Response Time
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="hide-steps-number-input"
                                                disabled={isSubmitting}
                                                placeholder="Enter the time"
                                                value={field.value ?? 0}   // Nullable input
                                                onChange={(e) => {
                                                    const newValue: number = parseInt(e.target.value);
                                                    form.setValue('qiResponseTime', newValue, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                onBlur={field.onBlur}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                            
                            <FormField
                control={form.control}
                name="lineTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Line Target (Daily)
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="text-xs font-medium mb-1">
                            Line Target Information:
                          </div>
                          <div className="text-xs leading-relaxed">
                            • Daily production target for this line <br />
                            • Example: 580 pieces per day
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
                        placeholder="Enter daily line target"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>
          {mode && mode === "create" ? (
            <div className="mt-4 flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex gap-2 pr-5"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex gap-2 pr-5"
              >
                <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                <Loader2
                  className={cn(
                    "animate-spin w-5 h-5 hidden",
                    isSubmitting && "flex"
                  )}
                />
                Create OBB Sheet
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex justify-between gap-2">
              <Link href="/obb-sheets">
                <Button
                  type="button"
                  variant="outline"
                  className="flex gap-2 pr-5 hover:border-slate-300 text-slate-600"
                  onClick={() => form.reset()}
                >
                  <ArrowLeft className="w-4 h-4" />
                  View all sheets
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex gap-2 pr-5"
              >
                <Zap className={cn("w-5 h-5", isSubmitting && "hidden")} />
                <Loader2
                  className={cn(
                    "animate-spin w-5 h-5 hidden",
                    isSubmitting && "flex"
                  )}
                />
                Update Sheet
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default CreateObbSheetForm;
