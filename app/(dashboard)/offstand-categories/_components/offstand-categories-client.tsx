'use client'

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react"
import { Loader2 } from "lucide-react";
import axios from "axios";

const AVAILABLE_CATEGORIES = [
    { id: "1", label: "Waiting Work" },
    { id: "2", label: "Personal" },
    { id: "3", label: "Sick / Medical" },
    { id: "4", label: "Prayer" },
    { id: "5", label: "Helping / Assisting" },
    { id: "6", label: "Bobbing Works" },
]

const SLOT_NAMES = ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];

interface SlotConfig {
    optionName: string;
    optionValue: string;
}

export default function OffstandCategoriesClient({ categories }: { categories: SlotConfig[] }) {

    const [configurations, setConfigurations] = useState<SlotConfig[]>(
        categories.map((category) => ({
            optionName: category.optionName,      
            optionValue: category.optionValue
        }))
    );

    const [loading, setLoading] = useState(false);

    const handleSelectChange = (slotName: string, selectedTextValue: string) => {
        setConfigurations((prev) =>
            prev.map((item) =>
                item.optionName === slotName
                    ? { ...item, optionValue: selectedTextValue } // Text එක කෙලින්ම state එකට දානවා
                    : item
            )
        );
    };

    const handleSave = async () => {
        setLoading(true);
        
        const dataToSave = configurations
            .filter(c => c.optionValue !== "") 
            .map(c => ({
                optionName: c.optionName,
                optionValue: c.optionValue
            }));

        try {
            await axios.put(`/api/offstand-categories/save`, {
                configurations: dataToSave,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setConfigurations(SLOT_NAMES.map((name) => ({
            optionName: name,
            optionValue: "",
        })))
    };

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                <div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                        Machine View Preview
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {configurations.map((config) => (
                                <div key={config.optionName} className="flex flex-col items-center justify-center h-32 p-4 bg-gray-950 border border-gray-700 rounded-lg text-center shadow-sm">
                                    <span className="text-xs text-gray-400 font-mono mb-1 uppercase">
                                        {config.optionName}
                                    </span>
                                    <span className={`font-bold text-lg leading-tight ${config.optionValue ? 'text-yellow-400' : 'text-gray-600'}`}>
                                        {config.optionValue || "Not Selected"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                        Configuration Form
                    </h3>

                    <div className="bg-white dark:bg-gray-950 p-1 rounded-lg flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                            {configurations.map((config) => (
                                <div key={config.optionName} className="flex flex-col gap-2">

                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {config.optionName}
                                    </Label>

                                    <Select
                                        value={config.optionValue}
                                        onValueChange={(val) => handleSelectChange(config.optionName, val)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.label}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t">
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-32">
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white w-32"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}