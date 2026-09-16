"use server";

import { ENDPOINTS } from "@/actions/endpoints";
import { apiCall } from "@/utils/instance";
import { getQuery, QueryValue } from "@/utils/get-query";
import {
  IDiamond,
  IDiamondApiResponse,
  IDiamondFilterQuery,
} from "@/types/diamond.types";
import { DiamondFormValues } from "@/lib/validations/diamond.schema";

interface ApiDiamondsResponse {
  success: boolean;
  data: IDiamond[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiDiamondSingleResponse {
  success: boolean;
  data: IDiamond;
}

interface ApiDeleteResponse {
  success: boolean;
  message?: string;
}

export async function fetchDiamondsAction(
  query: IDiamondFilterQuery = {}
): Promise<IDiamondApiResponse> {
  const queryParams: Record<string, QueryValue> = {
    page: query.page || 1,
    limit: query.limit || 10,
    search: query.search || "",
    sortBy: query.sortBy || "newest",
  };

  if (query.shapes && query.shapes.length > 0) {
    queryParams.shape = query.shapes;
  }
  if (query.colors && query.colors.length > 0) {
    queryParams.color = query.colors;
  }
  if (query.cuts && query.cuts.length > 0) {
    queryParams.cut = query.cuts;
  }
  if (query.clarities && query.clarities.length > 0) {
    queryParams.clarity = query.clarities;
  }
  if (query.minPrice !== undefined) {
    queryParams.minPrice = query.minPrice;
  }
  if (query.maxPrice !== undefined) {
    queryParams.maxPrice = query.maxPrice;
  }
  if (query.minCarat !== undefined) {
    queryParams.minCarat = query.minCarat;
  }
  if (query.maxCarat !== undefined) {
    queryParams.maxCarat = query.maxCarat;
  }
  if (query.inStockOnly !== undefined) {
    queryParams.inStockOnly = query.inStockOnly;
  }

  const queryString = getQuery(queryParams);
  const response = await apiCall<ApiDiamondsResponse>({
    url: `${ENDPOINTS.DIAMONDS.BASE}${queryString}`,
    method: "GET",
  });

  return {
    items: response.data,
    total: response.meta.total,
    pageCount: response.meta.totalPages,
    page: response.meta.page,
    limit: response.meta.limit,
  };
}

export async function createDiamondAction(
  values: DiamondFormValues
): Promise<IDiamond> {
  const payload = {
    name: values.name,
    sku: values.sku,
    shape: values.shape,
    carat: Number(values.carat),
    color: values.color,
    clarity: values.clarity,
    cut: values.cut,
    price: Number(values.price),
    discountPercentage: Number(values.discountPercentage || 0),
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
    featured: Boolean(values.featured),
  };

  try {
    const { createDiamond } = await import("@/lib/diamond-repository");
    const created = await createDiamond(payload as unknown as Omit<IDiamond, "_id">);
    if (created) {
      return created;
    }
  } catch (err) {
    console.error("[createDiamondAction Repository Error, falling back to apiCall]:", err);
  }

  const response = await apiCall<ApiDiamondSingleResponse>({
    url: ENDPOINTS.DIAMONDS.BASE,
    method: "POST",
    data: payload,
  });

  return response.data;
}

export async function updateDiamondAction(
  id: string,
  values: Partial<DiamondFormValues>
): Promise<IDiamond> {
  const payload: Record<string, string | number | boolean | string[] | object> = {
    ...values,
  };

  if (
    values.length !== undefined &&
    values.width !== undefined &&
    values.depth !== undefined
  ) {
    payload.dimensions = {
      length: Number(values.length),
      width: Number(values.width),
      depth: Number(values.depth),
    };
  }

  try {
    const { updateDiamond } = await import("@/lib/diamond-repository");
    const updated = await updateDiamond(id, payload as Partial<IDiamond>);
    if (updated) {
      return updated;
    }
  } catch (err) {
    console.error("[updateDiamondAction Repository Error, falling back to apiCall]:", err);
  }

  const response = await apiCall<ApiDiamondSingleResponse>({
    url: ENDPOINTS.DIAMONDS.BY_ID(id),
    method: "PUT",
    data: payload,
  });

  return response.data;
}

export async function deleteDiamondAction(id: string): Promise<boolean> {
  try {
    const { deleteDiamond } = await import("@/lib/diamond-repository");
    const deleted = await deleteDiamond(id);
    if (deleted) return true;
  } catch (err) {
    console.error("[deleteDiamondAction Repository Error, falling back to apiCall]:", err);
  }

  const response = await apiCall<ApiDeleteResponse>({
    url: ENDPOINTS.DIAMONDS.BY_ID(id),
    method: "DELETE",
  });

  return response.success;
}

export async function updateDiamondFeaturedAction(
  id: string,
  featured: boolean
): Promise<boolean> {
  try {
    const { updateDiamond } = await import("@/lib/diamond-repository");
    const updated = await updateDiamond(id, { featured });
    if (updated) return true;
  } catch (err) {
    console.error("[updateDiamondFeaturedAction Repository Error, falling back to apiCall]:", err);
  }

  const response = await apiCall<ApiDiamondSingleResponse>({
    url: ENDPOINTS.DIAMONDS.BY_ID(id),
    method: "PUT",
    data: { featured },
  });

  return response.success;
}
