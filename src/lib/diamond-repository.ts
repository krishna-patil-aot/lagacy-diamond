import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { INITIAL_DIAMONDS } from "@/lib/mock-data";
import { DiamondModel, IDiamondDocument } from "@/models/Diamond";
import { IDiamond, DiamondShape, DiamondColor, DiamondClarity, DiamondCut } from "@/types/diamond.types";
import { IDiamondFilterState, IFilterMeta } from "@/types/filter.types";
import { calculateDiscountedPrice } from "@/lib/utils";
import {
  getOrSetCache,
  getCatalogVersion,
  generateFilterHash,
  invalidateCatalogCache,
  invalidateDiamondCache,
} from "@/lib/cache-service";
import { isSafeObjectId } from "@/lib/sanitizer";

// In-memory fallback dataset for seamless offline or local execution
let memoryDiamonds: IDiamond[] = [...INITIAL_DIAMONDS];

export async function getDiamonds(filters: Partial<IDiamondFilterState>): Promise<{
  diamonds: IDiamond[];
  meta: IFilterMeta;
}> {
  const version = await getCatalogVersion();
  const filterFingerprint = generateFilterHash({
    shapes: filters.shapes ? [...filters.shapes].sort() : undefined,
    colors: filters.colors ? [...filters.colors].sort() : undefined,
    cuts: filters.cuts ? [...filters.cuts].sort() : undefined,
    clarities: filters.clarities ? [...filters.clarities].sort() : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minCarat: filters.minCarat,
    maxCarat: filters.maxCarat,
    minDiscount: filters.minDiscount,
    inStockOnly: filters.inStockOnly,
    searchQuery: filters.searchQuery?.trim().toLowerCase(),
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  });

  const cacheKey = `diamond:cat:v${version}:${filterFingerprint}`;

  return getOrSetCache(
    cacheKey,
    async () => {
      const mongoose = await connectToDatabase();

      const minPrice = filters.minPrice !== undefined ? filters.minPrice : 0;
      const maxPrice = filters.maxPrice !== undefined ? filters.maxPrice : 100000;
      const minCarat = filters.minCarat !== undefined ? filters.minCarat : 0.3;
      const maxCarat = filters.maxCarat !== undefined ? filters.maxCarat : 10.0;
      const minDiscount = filters.minDiscount !== undefined ? filters.minDiscount : 0;
      const page = Math.max(1, filters.page || 1);
      const limit = Math.max(1, filters.limit || 12);
      const searchQuery = filters.searchQuery?.trim().toLowerCase() || "";

      if (mongoose) {
        const query: QueryFilter<IDiamondDocument> = {
          finalPrice: { $gte: minPrice, $lte: maxPrice },
          carat: { $gte: minCarat, $lte: maxCarat },
          discountPercentage: { $gte: minDiscount },
        };

        if (filters.shapes && filters.shapes.length > 0) {
          query.shape = { $in: filters.shapes };
        }
        if (filters.colors && filters.colors.length > 0) {
          query.color = { $in: filters.colors };
        }
        if (filters.cuts && filters.cuts.length > 0) {
          query.cut = { $in: filters.cuts };
        }
        if (filters.clarities && filters.clarities.length > 0) {
          query.clarity = { $in: filters.clarities };
        }
        if (filters.inStockOnly) {
          query.stockQuantity = { $gt: 0 };
        }
        if (searchQuery) {
          const safeRegex = searchQuery.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
          query.$or = [
            { name: { $regex: safeRegex, $options: "i" } },
            { sku: { $regex: safeRegex, $options: "i" } },
            { certificateNumber: { $regex: safeRegex, $options: "i" } },
          ];
        }

        const sortOptions: Record<string, 1 | -1> = {};
        switch (filters.sortBy) {
          case "price_asc":
            sortOptions.finalPrice = 1;
            break;
          case "price_desc":
            sortOptions.finalPrice = -1;
            break;
          case "carat_asc":
            sortOptions.carat = 1;
            break;
          case "carat_desc":
            sortOptions.carat = -1;
            break;
          case "discount_desc":
            sortOptions.discountPercentage = -1;
            break;
          case "newest":
            sortOptions.createdAt = -1;
            break;
          default:
            sortOptions.featured = -1;
            sortOptions.createdAt = -1;
        }

        let totalCount = await DiamondModel.countDocuments(query);
        if (totalCount === 0) {
          const overallCount = await DiamondModel.countDocuments();
          if (overallCount === 0) {
            const sanitizedLots = INITIAL_DIAMONDS.map((item) => {
              const lot = { ...item };
              delete (lot as { _id?: string })._id;
              return lot;
            });
            await DiamondModel.insertMany(sanitizedLots);
            totalCount = await DiamondModel.countDocuments(query);
          }
        }
        const totalPages = Math.ceil(totalCount / limit) || 1;
        const docs = await DiamondModel.find(query)
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const diamonds: IDiamond[] = docs.map((doc) => ({
          _id: String(doc._id),
          name: doc.name,
          sku: doc.sku,
          shape: doc.shape as DiamondShape,
          carat: doc.carat,
          color: doc.color as DiamondColor,
          clarity: doc.clarity as DiamondClarity,
          cut: doc.cut as DiamondCut,
          price: doc.price,
          discountPercentage: doc.discountPercentage,
          finalPrice: doc.finalPrice,
          lab: doc.lab,
          certificateNumber: doc.certificateNumber,
          dimensions: doc.dimensions,
          tablePercentage: doc.tablePercentage,
          depthPercentage: doc.depthPercentage,
          polish: doc.polish,
          symmetry: doc.symmetry,
          fluorescence: doc.fluorescence,
          images: doc.images,
          description: doc.description,
          stockQuantity: doc.stockQuantity,
          featured: doc.featured,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        }));

        return {
          diamonds,
          meta: {
            totalCount,
            totalPages,
            currentPage: page,
            priceRange: { min: 500, max: 100000 },
            caratRange: { min: 0.3, max: 10.0 },
          },
        };
      }

      // Memory fallback filtering
      let filtered = [...memoryDiamonds];

      if (searchQuery) {
        filtered = filtered.filter(
          (d) =>
            d.name.toLowerCase().includes(searchQuery) ||
            d.sku.toLowerCase().includes(searchQuery) ||
            d.certificateNumber.toLowerCase().includes(searchQuery)
        );
      }

      if (filters.shapes && filters.shapes.length > 0) {
        filtered = filtered.filter((d) => filters.shapes?.includes(d.shape));
      }

      if (filters.colors && filters.colors.length > 0) {
        filtered = filtered.filter((d) => filters.colors?.includes(d.color));
      }

      if (filters.cuts && filters.cuts.length > 0) {
        filtered = filtered.filter((d) => filters.cuts?.includes(d.cut));
      }

      if (filters.clarities && filters.clarities.length > 0) {
        filtered = filtered.filter((d) => filters.clarities?.includes(d.clarity));
      }

      filtered = filtered.filter(
        (d) =>
          d.finalPrice >= minPrice &&
          d.finalPrice <= maxPrice &&
          d.carat >= minCarat &&
          d.carat <= maxCarat &&
          d.discountPercentage >= minDiscount
      );

      if (filters.inStockOnly) {
        filtered = filtered.filter((d) => d.stockQuantity > 0);
      }

      // Sort
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "price_asc":
            return a.finalPrice - b.finalPrice;
          case "price_desc":
            return b.finalPrice - a.finalPrice;
          case "carat_asc":
            return a.carat - b.carat;
          case "carat_desc":
            return b.carat - a.carat;
          case "discount_desc":
            return b.discountPercentage - a.discountPercentage;
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });

      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return {
        diamonds: paginated,
        meta: {
          totalCount,
          totalPages,
          currentPage: page,
          priceRange: { min: 500, max: 100000 },
          caratRange: { min: 0.3, max: 10.0 },
        },
      };
    },
    {
      ttlSeconds: 120,
      staleWhileRevalidateSeconds: 60,
      tags: ["catalog"],
    }
  );
}

export async function getDiamondById(id: string): Promise<IDiamond | null> {
  const cleanId = id.trim();
  const cacheKey = `diamond:item:${cleanId}`;

  return getOrSetCache(
    cacheKey,
    async () => {
      const mongoose = await connectToDatabase();
      if (mongoose && isSafeObjectId(cleanId)) {
        try {
          const doc = await DiamondModel.findById(cleanId).lean();
          if (!doc) return null;
          return {
            _id: String(doc._id),
            name: doc.name,
            sku: doc.sku,
            shape: doc.shape as DiamondShape,
            carat: doc.carat,
            color: doc.color as DiamondColor,
            clarity: doc.clarity as DiamondClarity,
            cut: doc.cut as DiamondCut,
            price: doc.price,
            discountPercentage: doc.discountPercentage,
            finalPrice: doc.finalPrice,
            lab: doc.lab,
            certificateNumber: doc.certificateNumber,
            dimensions: doc.dimensions,
            tablePercentage: doc.tablePercentage,
            depthPercentage: doc.depthPercentage,
            polish: doc.polish,
            symmetry: doc.symmetry,
            fluorescence: doc.fluorescence,
            images: doc.images,
            description: doc.description,
            stockQuantity: doc.stockQuantity,
            featured: doc.featured,
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
          };
        } catch {
          // If not a valid ObjectId, search memory
        }
      }

      const found = memoryDiamonds.find((d) => d._id === id);
      return found || null;
    },
    {
      ttlSeconds: 600,
      staleWhileRevalidateSeconds: 120,
      tags: ["item", `item_${id}`],
    }
  );
}

export async function createDiamond(data: Omit<IDiamond, "_id" | "createdAt" | "updatedAt" | "finalPrice">): Promise<IDiamond> {
  const finalPrice = calculateDiscountedPrice(data.price, data.discountPercentage);
  const now = new Date().toISOString();

  let createdDiamond: IDiamond;

  const mongoose = await connectToDatabase();
  if (mongoose) {
    const created = await DiamondModel.create({
      ...data,
      finalPrice,
    });
    createdDiamond = {
      _id: String(created._id),
      name: created.name,
      sku: created.sku,
      shape: created.shape as DiamondShape,
      carat: created.carat,
      color: created.color as DiamondColor,
      clarity: created.clarity as DiamondClarity,
      cut: created.cut as DiamondCut,
      price: created.price,
      discountPercentage: created.discountPercentage,
      finalPrice: created.finalPrice,
      lab: created.lab,
      certificateNumber: created.certificateNumber,
      dimensions: created.dimensions,
      tablePercentage: created.tablePercentage,
      depthPercentage: created.depthPercentage,
      polish: created.polish,
      symmetry: created.symmetry,
      fluorescence: created.fluorescence,
      images: created.images,
      description: created.description,
      stockQuantity: created.stockQuantity,
      featured: created.featured,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : now,
      updatedAt: created.updatedAt ? new Date(created.updatedAt).toISOString() : now,
    };
  } else {
    createdDiamond = {
      ...data,
      _id: `dia-${Date.now()}`,
      finalPrice,
      createdAt: now,
      updatedAt: now,
    };
    memoryDiamonds = [createdDiamond, ...memoryDiamonds];
  }

  // Enterprise Invalidation: Invalidate all catalog query caches immediately
  await invalidateCatalogCache();

  return createdDiamond;
}

export async function updateDiamond(id: string, data: Partial<IDiamond>): Promise<IDiamond | null> {
  const mongoose = await connectToDatabase();

  const finalPrice =
    data.price !== undefined || data.discountPercentage !== undefined
      ? calculateDiscountedPrice(
          data.price !== undefined ? data.price : 0,
          data.discountPercentage !== undefined ? data.discountPercentage : 0
        )
      : undefined;

  const updatePayload = {
    ...data,
    ...(finalPrice !== undefined ? { finalPrice } : {}),
    updatedAt: new Date().toISOString(),
  };

  let updatedResult: IDiamond | null = null;

  if (mongoose) {
    try {
      const updated = await DiamondModel.findByIdAndUpdate(id, updatePayload, { new: true }).lean();
      if (updated) {
        updatedResult = {
          _id: String(updated._id),
          name: updated.name,
          sku: updated.sku,
          shape: updated.shape as DiamondShape,
          carat: updated.carat,
          color: updated.color as DiamondColor,
          clarity: updated.clarity as DiamondClarity,
          cut: updated.cut as DiamondCut,
          price: updated.price,
          discountPercentage: updated.discountPercentage,
          finalPrice: updated.finalPrice,
          lab: updated.lab,
          certificateNumber: updated.certificateNumber,
          dimensions: updated.dimensions,
          tablePercentage: updated.tablePercentage,
          depthPercentage: updated.depthPercentage,
          polish: updated.polish,
          symmetry: updated.symmetry,
          fluorescence: updated.fluorescence,
          images: updated.images,
          description: updated.description,
          stockQuantity: updated.stockQuantity,
          featured: updated.featured,
          createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
        };

        // If specimen now has available stock (>0), trigger alerts for waiting subscribers
        if (updated.stockQuantity > 0) {
          try {
            const { dispatchStockAlertsForDiamond } = await import(
              "@/lib/stock-notification-repository"
            );
            await dispatchStockAlertsForDiamond(String(updated._id), updatedResult);
          } catch (dispatchErr) {
            console.error("[Diamond Update Stock Alert Dispatch Error]:", dispatchErr);
          }
        }
      }
    } catch {
      // Fallback to memory
    }
  }

  if (!updatedResult) {
    const index = memoryDiamonds.findIndex((d) => d._id === id);
    if (index !== -1) {
      const existing = memoryDiamonds[index];
      const priceToUse = data.price !== undefined ? data.price : existing.price;
      const discountToUse =
        data.discountPercentage !== undefined ? data.discountPercentage : existing.discountPercentage;
      const recalculatedFinalPrice = calculateDiscountedPrice(priceToUse, discountToUse);

      updatedResult = {
        ...existing,
        ...data,
        finalPrice: recalculatedFinalPrice,
        updatedAt: new Date().toISOString(),
      };
      memoryDiamonds[index] = updatedResult;
    }
  }

  if (updatedResult) {
    // Enterprise Invalidation: Purge single item cache and advance catalog version
    await invalidateDiamondCache(id);
  }

  return updatedResult;
}

export async function deleteDiamond(id: string): Promise<boolean> {
  let isDeleted = false;
  const mongoose = await connectToDatabase();
  if (mongoose) {
    try {
      const result = await DiamondModel.findByIdAndDelete(id);
      if (result) isDeleted = true;
    } catch {
      // Fallback to memory
    }
  }

  if (!isDeleted) {
    const prevLen = memoryDiamonds.length;
    memoryDiamonds = memoryDiamonds.filter((d) => d._id !== id);
    isDeleted = memoryDiamonds.length < prevLen;
  }

  if (isDeleted) {
    // Enterprise Invalidation: Purge item cache and advance catalog version
    await invalidateDiamondCache(id);
  }

  return isDeleted;
}
