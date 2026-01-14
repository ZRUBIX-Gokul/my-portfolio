"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Input, Label, Select, Button } from "@/components/ui/form-elements";
import { PICKLIST_OPTIONS } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";

export default function HouseKeepingPurchasePage() {
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      materials: [{ name: "", qty: 1, amount: 0 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials"
  });

  const materials = watch("materials");
  const totalAmount = materials.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const onSubmit = (data) => {
    console.log(data);
    alert("Purchase Intent Submitted!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <h1 className="text-2xl font-bold">House Keeping Purchase Intent</h1>
       
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 rounded-xl border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Center Location</Label>
                  <Select {...register("centerLocation")} options={PICKLIST_OPTIONS.centerLocations} placeholder="Select Location" />
              </div>
              <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Select {...register("shopName")} options={PICKLIST_OPTIONS.shopNames} placeholder="Select Shop" />
              </div>
              <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...register("date")} />
              </div>
              <div className="space-y-2">
                  <Label>Authorized By</Label>
                  <Select {...register("authorizedBy")} options={PICKLIST_OPTIONS.users.map(u => ({ label: u.name, value: u.id }))} />
              </div>
          </div>

          {/* Materials Grid */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">Materials</h3>
                <Button type="button" size="sm" onClick={() => append({ name: "", qty: 1, amount: 0 })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
             </div>
             
             <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <div className="col-span-1">No.</div>
                    <div className="col-span-5">Material Name</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-3">Amount</div>
                    <div className="col-span-1">Action</div>
                </div>
                
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                         <div className="col-span-1 text-center">{index + 1}</div>
                         <div className="col-span-5">
                            <Input {...register(`materials.${index}.name`)} placeholder="Item name" />
                         </div>
                         <div className="col-span-2">
                            <Input type="number" {...register(`materials.${index}.qty`)} />
                         </div>
                         <div className="col-span-3">
                            <Input type="number" step="0.01" {...register(`materials.${index}.amount`)} />
                         </div>
                         <div className="col-span-1 text-center">
                            <button type="button" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                    </div>
                ))}
             </div>
             
             <div className="flex justify-end pt-4 border-t">
                 <div className="flex items-center gap-4">
                     <span className="font-semibold text-lg">Total Amount:</span>
                     <span className="text-xl font-bold font-mono">{totalAmount.toFixed(2)}</span>
                 </div>
             </div>
          </div>

          <div className="flex justify-end gap-3">
              <Button type="submit">Submit Purchase</Button>
          </div>
       </form>
    </div>
  );
}
