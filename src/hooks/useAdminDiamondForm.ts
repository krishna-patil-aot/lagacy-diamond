import { useState, useEffect } from "react";
import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diamondFormSchema, DiamondFormValues } from "@/lib/validations/diamond.schema";
import { IDiamond } from "@/types/diamond.types";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateDiscountedPrice } from "@/lib/utils";
import { toast } from "sonner";

export interface IUseAdminDiamondFormReturn {
  form: UseFormReturn<DiamondFormValues>;
  imageUrlInput: string;
  setImageUrlInput: (url: string) => void;
  handleAddImage: () => void;
  handleRemoveImage: (index: number) => void;
  calculatedFinalPrice: number;
  calculatedSavings: number;
  isSubmitting: boolean;
  formError: string | null;
  submitDiamond: (data: DiamondFormValues) => Promise<boolean>;
}

const DEFAULT_FORM_VALUES: DiamondFormValues = {
  name: "",
  sku: "",
  shape: "Round",
  carat: 1.0,
  color: "F",
  clarity: "VS1",
  cut: "Ideal",
  price: 5000,
  discountPercentage: 0,
  lab: "GIA",
  certificateNumber: "",
  length: 6.5,
  width: 6.5,
  depth: 4.0,
  tablePercentage: 57,
  depthPercentage: 61.5,
  polish: "Excellent",
  symmetry: "Excellent",
  fluorescence: "None",
  images: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
  ],
  description: "",
  stockQuantity: 1,
  featured: false,
};

export function useAdminDiamondForm(
  initialDiamond?: IDiamond | null,
  onSuccess?: () => void
): IUseAdminDiamondFormReturn {
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { token } = useAuthStore();

  const form = useForm<DiamondFormValues>({
    resolver: zodResolver(diamondFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { reset, setValue, control } = form;

  const currentPrice = useWatch({ control, name: "price" }) || 0;
  const currentDiscount = useWatch({ control, name: "discountPercentage" }) || 0;
  const currentImages = useWatch({ control, name: "images" }) || [];

  const calculatedFinalPrice = calculateDiscountedPrice(Number(currentPrice), Number(currentDiscount));
  const calculatedSavings = Number(currentPrice) - calculatedFinalPrice;

  useEffect(() => {
    if (initialDiamond) {
      reset({
        name: initialDiamond.name,
        sku: initialDiamond.sku,
        shape: initialDiamond.shape,
        carat: initialDiamond.carat,
        color: initialDiamond.color,
        clarity: initialDiamond.clarity,
        cut: initialDiamond.cut,
        price: initialDiamond.price,
        discountPercentage: initialDiamond.discountPercentage,
        lab: initialDiamond.lab,
        certificateNumber: initialDiamond.certificateNumber,
        length: initialDiamond.dimensions.length,
        width: initialDiamond.dimensions.width,
        depth: initialDiamond.dimensions.depth,
        tablePercentage: initialDiamond.tablePercentage,
        depthPercentage: initialDiamond.depthPercentage,
        polish: initialDiamond.polish,
        symmetry: initialDiamond.symmetry,
        fluorescence: initialDiamond.fluorescence,
        images: initialDiamond.images.length > 0 ? initialDiamond.images : DEFAULT_FORM_VALUES.images,
        description: initialDiamond.description,
        stockQuantity: initialDiamond.stockQuantity,
        featured: initialDiamond.featured,
      });
    } else {
      reset(DEFAULT_FORM_VALUES);
    }
  }, [initialDiamond, reset]);

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setValue("images", [...currentImages, imageUrlInput.trim()], { shouldValidate: true });
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = currentImages.filter((_, idx) => idx !== index);
    setValue("images", updated, { shouldValidate: true });
  };

  const submitDiamond = async (values: DiamondFormValues): Promise<boolean> => {
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: values.name,
      sku: values.sku,
      shape: values.shape,
      carat: Number(values.carat),
      color: values.color,
      clarity: values.clarity,
      cut: values.cut,
      price: Number(values.price),
      discountPercentage: Number(values.discountPercentage),
      lab: values.lab,
      certificateNumber: values.certificateNumber,
      dimensions: {
        length: Number(values.length),
        width: Number(values.width),
        depth: Number(values.depth),
      },
      tablePercentage: Number(values.tablePercentage),
      depthPercentage: Number(values.depthPercentage),
      polish: values.polish,
      symmetry: values.symmetry,
      fluorescence: values.fluorescence,
      images: values.images,
      description: values.description,
      stockQuantity: Number(values.stockQuantity),
      featured: values.featured,
    };

    try {
      const url = initialDiamond ? `/api/diamonds/${initialDiamond._id}` : "/api/diamonds";
      const method = initialDiamond ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save diamond");
      }

      onSuccess?.();
      toast.success(
        initialDiamond
          ? "Diamond Updated in Vault!"
          : "New Diamond Registered to Vault!",
        {
          description: `${values.name} (${values.carat} ct ${values.shape}, ${values.sku})`,
        }
      );
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setFormError(msg);
      toast.error("Form Submission Error", { description: msg });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    imageUrlInput,
    setImageUrlInput,
    handleAddImage,
    handleRemoveImage,
    calculatedFinalPrice,
    calculatedSavings,
    isSubmitting,
    formError,
    submitDiamond,
  };
}
