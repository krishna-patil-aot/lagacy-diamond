import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full legal name is required"),
  email: z.string().email("Valid email address required for insured tracking"),
  phone: z.string().min(6, "Contact phone is required for armored delivery"),
  street: z.string().min(4, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(3, "Postal/ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;
