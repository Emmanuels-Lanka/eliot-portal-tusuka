"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { MACHINE_BRANDS } from "@/constants";
import { AddMachineTypeDialog } from "@/app/(dashboard)/sewing-machines/_components/add-machine-type-dialog";
import { Separator } from "@/components/ui/separator";
import { AddMachineBrandDialog } from "@/app/(dashboard)/sewing-machines/_components/add-brand-name-dialog";

interface AddSewingMachineFormProps {
  devices: {
    id: string;
    serialNumber: string;
    modelNumber: string;
  }[];
  units: {
    id: string;
    name: string;
  }[];
  machineTypes: {
    name: string;
    code: string;
  }[];
  initialData?: any | null;
  machineId?: string;
  mode?: string;
  machineBrands:{
    brandName:string
  }[]
}

const formSchema = z.object({
  unitId: z.string().min(1, {
    message: "Production Unit is required",
  }),
  machineType: z.string().min(1, {
    message: "Machine Type is required",
  }),
  brandName: z.string().min(1, {
    message: "Brand Name is required",
  }),
  serialNumber: z.string().min(1, {
    message: "Sewing Machine Serial Number is required",
  }),
  modelNumber: z.string().nullable(),
  machineId: z.string().min(1, {
    message: "Sewing Machine ID is required",
  }),
  eliotDeviceId: z.string(),
  ownership: z.string().min(1, {
    message: "Machine Type is required",
  }),
});

const AddSewingMachineForm = ({
  devices,
  units,
  machineTypes,
  initialData,
  machineId,
  mode,
  machineBrands
}: AddSewingMachineFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitId: initialData?.unitId || "",
      machineType: initialData?.machineType || "",
      brandName: initialData?.brandName || "",
      serialNumber: initialData?.serialNumber || "",
      modelNumber: initialData?.modelNumber || "",
      machineId: initialData?.machineId || "",
      eliotDeviceId: initialData?.eliotDeviceId || "",
      ownership: initialData?.ownership || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (mode && mode === "create") {
      try {
        const res = await axios.post("/api/sewing-machine", data);
        toast({
          title: "Successfully created new machine",
          variant: "success",
          description: (
            <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
              <code className="text-slate-800">
                Serial No: {res.data.data.serialNumber}
              </code>
            </div>
          ),
        });
        router.refresh();
        form.reset();
      } catch (error: any) {
        console.error("ERROR", error);
        toast({
          title: error.response.data || "Something went wrong! Try again",
          variant: "error",
        });
      }
    } else {
      try {
        const res = await axios.put(`/api/sewing-machine/${machineId}`, data);
        toast({
          title: "Updated successfully",
          variant: "success",
        });
        
        // Refresh router data first
        router.refresh();
        
        // Navigate back after a brief delay to ensure refresh completes
        setTimeout(() => {
          router.push("/sewing-machines");
        }, 500);
      } catch (error: any) {
        console.error("ERROR", error);
        toast({
          title: error.response.data || "Something went wrong! Try again",
          variant: "error",
        });
      }
    }
  };

  const updateMachineIdDefaultValue = (type: string) => {
    form.setValue("machineId", type);
  };

  const handleUnassign = async (deviveId: string) => {
    try {
      const res = await axios.post(
        `/api/sewing-machine/${machineId}/unassign?deviceId=${deviveId}`
      );
      toast({
        title: "Unassigned the device",
        variant: "success",
      });
      form.setValue("eliotDeviceId", "");
      router.refresh();
      
      // Force re-render by updating the form state
      setTimeout(() => {
        form.trigger("eliotDeviceId");
      }, 100);
    } catch (error: any) {
      toast({
        title: "Something went wrong! Try again",
        variant: "error",
        description: (
          <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
            <code className="text-slate-800">ERROR: {error.message}</code>
          </div>
        ),
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl mt-16 border px-12 pt-6 pb-10 rounded-lg shadow-xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 mt-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem className="my-4 ">
                  <FormLabel className="text-base -mt-4">Production Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select production unit" />
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
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between"><FormLabel className="text-base">Brand Name</FormLabel>
                   <div className="relative flex cursor-default select-none items-center rounded-sm px-0.5 py-0.5 text-sm ">
                        <AddMachineBrandDialog />
                      </div></div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select machine brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {machineBrands.map((brand) => (
                        <SelectItem key={brand.brandName} value={brand.brandName}>
                          {brand.brandName}
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
              name="machineType"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base">Machine Type</FormLabel>
                      <div className="relative flex cursor-default select-none items-center rounded-sm px-0.5 py-0.5 text-sm ">
                        <AddMachineTypeDialog />
                      </div>
                  </div>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateMachineIdDefaultValue(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select machine type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {machineTypes.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name} - {type.code}
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
              name="machineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Sewing Machine ID</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'xxxxx'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Serial Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'xxxxxxx'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Model Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'xxxxx'"
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
              name="ownership"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Ownership</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the ownership" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex flex-row gap-3 justify-between items-end">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="eliotDeviceId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base">
                        ELIoT Device{" "}
                        {!initialData?.eliotDeviceId && "(Unassigned)"}
                      </FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between font-normal"
                          >
                            {devices ? (
                              <>
                                {field.value
                                  ? (() => {
                                      const foundDevice = devices.find((device) => device.id === field.value);
                                      if (foundDevice) {
                                        return `${foundDevice.serialNumber} ~ ${foundDevice.modelNumber}`;
                                      }
                                      if (initialData?.eliotDeviceId === field.value && initialData?.eliotDevice) {
                                        return `${initialData.eliotDevice.serialNumber} ~ ${initialData.eliotDevice.modelNumber}`;
                                      }
                                      return "Select ELIoT device...";
                                    })()
                                  : "Select ELIoT device..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </>
                            ) : (
                              "No devices available!"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search devices..." />
                            <CommandList>
                              <CommandEmpty>
                                {devices.length === 0 ? (
                                  "No devices available. Please create new"
                                ) : (
                                  "No devices found!"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {initialData?.eliotDeviceId && (
                                  <CommandItem
                                    key={initialData.eliotDeviceId}
                                    value={`${initialData.eliotDevice.serialNumber} ${initialData.eliotDevice.modelNumber}`}
                                    onSelect={() => {
                                      form.setValue("eliotDeviceId", initialData.eliotDeviceId);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === initialData.eliotDeviceId
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {initialData.eliotDevice.serialNumber} ~ {initialData.eliotDevice.modelNumber}
                                  </CommandItem>
                                )}
                                {devices &&
                                  devices.map((device) => (
                                    <CommandItem
                                      key={device.id}
                                      value={`${device.serialNumber} ${device.modelNumber}`}
                                      onSelect={() => {
                                        form.setValue("eliotDeviceId", device.id);
                                        setOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === device.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {device.serialNumber} ~ {device.modelNumber}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {initialData?.eliotDeviceId && (
                <div
                  onClick={() => handleUnassign(initialData.eliotDeviceId)}
                  className="cursor-pointer py-2.5 px-4 bg-[#0070c0] rounded-md  text-white text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Unassign
                </div>
              )}
            </div>
          </div>
          {mode && mode === "create" ? (
            <div className="mt-4 flex justify-between gap-2">
              <Button
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
                Add Device
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex justify-between gap-2">
              <Link href="/sewing-machines">
                <Button
                  variant="outline"
                  className="flex gap-2 pr-5 text-red-600"
                >
                  Cancel
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
                Update
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AddSewingMachineForm;