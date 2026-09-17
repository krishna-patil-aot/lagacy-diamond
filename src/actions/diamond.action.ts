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

import { DiamondSortOption } from "@/types/filter.types";

function normalizeSortOption(sort?: string): DiamondSortOption {
  switch (sort) {
    case "price-asc":
    case "price_asc":
      return "price_asc";
    case "price-desc":
    case "price_desc":
      return "price_desc";
    case "carat-asc":
    case "carat_asc":
      return "carat_asc";
    case "carat-desc":
    case "carat_desc":
      return "carat_desc";
    case "discount_desc":
      return "discount_desc";
    case "newest":
      return "newest";
    default:
      return "featured";
  }
}

export async function fetchDiamondsAction(
  query: IDiamondFilterQuery = {}
): Promise<IDiamondApiResponse> {
  try {
    const { getDiamonds } = await import("@/lib/diamond-repository");
    const result = await getDiamonds({
      page: query.page || 1,
      limit: query.limit || 10,
      searchQuery: query.search || "",
      sortBy: normalizeSortOption(query.sortBy),
      shapes: query.shapes,
      colors: query.colors,
      cuts: query.cuts,
      clarities: query.clarities,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minCarat: query.minCarat,
      maxCarat: query.maxCarat,
      inStockOnly: query.inStockOnly,
    });

    return {
      items: result.diamonds,
      total: result.meta.totalCount,
      pageCount: result.meta.totalPages,
      page: result.meta.currentPage,
      limit: query.limit || 10,
    };
  } catch (repoErr) {
    console.error("[fetchDiamondsAction Repository Error, falling back to apiCall]:", repoErr);
  }

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
  const payload: Omit<IDiamond, "_id" | "createdAt" | "updatedAt" | "finalPrice"> = {
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
    const created = await createDiamond(payload);
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
  const payload: Partial<IDiamond> = {};

  if (values.name !== undefined) payload.name = values.name;
  if (values.sku !== undefined) payload.sku = values.sku;
  if (values.shape !== undefined) payload.shape = values.shape;
  if (values.carat !== undefined) payload.carat = Number(values.carat);
  if (values.color !== undefined) payload.color = values.color;
  if (values.clarity !== undefined) payload.clarity = values.clarity;
  if (values.cut !== undefined) payload.cut = values.cut;
  if (values.price !== undefined) payload.price = Number(values.price);
  if (values.discountPercentage !== undefined)
    payload.discountPercentage = Number(values.discountPercentage);
  if (values.lab !== undefined) payload.lab = values.lab;
  if (values.certificateNumber !== undefined)
    payload.certificateNumber = values.certificateNumber;
  if (values.tablePercentage !== undefined)
    payload.tablePercentage = Number(values.tablePercentage);
  if (values.depthPercentage !== undefined)
    payload.depthPercentage = Number(values.depthPercentage);
  if (values.polish !== undefined) payload.polish = values.polish;
  if (values.symmetry !== undefined) payload.symmetry = values.symmetry;
  if (values.fluorescence !== undefined) payload.fluorescence = values.fluorescence;
  if (values.images !== undefined) payload.images = values.images;
  if (values.description !== undefined) payload.description = values.description;
  if (values.stockQuantity !== undefined)
    payload.stockQuantity = Number(values.stockQuantity);
  if (values.featured !== undefined) payload.featured = Boolean(values.featured);

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
    const updated = await updateDiamond(id, payload);
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
