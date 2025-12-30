'use client';

"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAlert } from "@/lib/actions/alert.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import { ALERT_CONDITION_OPTIONS } from "@/lib/constants";

export default function AlertModal({ open, setOpen, alertData }: AlertModalProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AlertData>({
    defaultValues: {
      symbol: alertData?.symbol ?? "",
      company: alertData?.company ?? "",
      alertName: `${alertData?.symbol ?? ""} Price Alert`,
      alertType: "upper",
      threshold: undefined as any,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: AlertData) => {
    const result = await createAlert(data);

    if (!result.success) {
      toast.error("Failed to create alert", { description: result.error });
      return;
    }

    toast.success("Alert created", {
      description: `You'll be notified when ${data.symbol} ${data.alertType === "upper" ? "exceeds" : "drops below"} $${data.threshold}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="alert-dialog">
        <DialogHeader>
          <DialogTitle className="alert-title">Price Alert</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            name="alertName"
            label="Alert Name"
            placeholder="e.g. Apple at Discount"
            register={register}
            error={errors.alertName}
            validation={{ required: "Alert name is required" }}
          />

          <InputField
            name="company"
            label="Stock"
            placeholder=""
            register={register}
            error={errors.company}
            disabled
            value={`${alertData?.company} (${alertData?.symbol})`}
          />

          <SelectField
            name="alertType"
            label="Condition"
            placeholder="Select condition"
            options={ALERT_CONDITION_OPTIONS}
            control={control}
            error={errors.alertType}
            required
          />

          <InputField
            name="threshold"
            label="Target Price ($)"
            placeholder="e.g. 150"
            type="number"
            register={register}
            error={errors.threshold}
            validation={{
              required: "Target price is required",
              min: { value: 0.00001, message: "Must be greater than 0" },
            }}
          />

          <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full">
            {isSubmitting ? "Creating..." : "Create Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}