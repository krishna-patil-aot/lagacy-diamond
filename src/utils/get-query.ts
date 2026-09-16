export type FilterOperator =
  | "$eq"
  | "$ne"
  | "$cont"
  | "$excl"
  | "$in"
  | "$notin"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$between"
  | "$isnull"
  | "$notnull";

export interface IFilterCondition {
  field: string;
  operator: FilterOperator;
  value?: string | number | boolean | (string | number)[];
}

export type QueryValuePrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryValuePrimitive | QueryValuePrimitive[];

export interface IQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  sortBy?: string;
  search?: string;
  filters?: IFilterCondition[];
  [key: string]: QueryValue | IFilterCondition[] | undefined;
}

export function formatFilterString(filter: IFilterCondition): string {
  const { field, operator, value } = filter;
  if (value === undefined || value === null) {
    return `${field}||${operator}`;
  }
  if (Array.isArray(value)) {
    return `${field}||${operator}||${value.join(",")}`;
  }
  return `${field}||${operator}||${String(value)}`;
}

export function getQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined || val === null || val === "") {
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.set(key, String(val));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function buildCrudQuery(params: IQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.filters && Array.isArray(params.filters)) {
    params.filters.forEach((filter) => {
      searchParams.append("filter", formatFilterString(filter));
    });
  }

  // Append other arbitrary query parameters
  Object.entries(params).forEach(([key, val]) => {
    if (
      key === "page" ||
      key === "limit" ||
      key === "sort" ||
      key === "sortBy" ||
      key === "search" ||
      key === "filters"
    ) {
      return;
    }

    if (val === undefined || val === null || val === "") {
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.set(key, String(val));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
