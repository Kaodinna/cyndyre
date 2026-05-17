import { apiGetRequest, apiPatch, apiPost } from "@/utils/axios/axios";
import {
  ProductOrderResponse,
  LoginProps,
  SignUpProps,
  Category,
  BookingStatsResponse,
} from "./../../types/type";
import Constants from "expo-constants";
import { AxiosResponse } from "axios";
// const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const hostIp =
  Constants.expoConfig && Constants.expoConfig.hostUri
    ? Constants.expoConfig.hostUri.split(":")[0]
    : "";
// const baseUrl = `http://${hostIp}:5000/api/v1`;
const baseUrl: string = "https://cynderallabackend.onrender.com/api/v1";

type CategoryResponse = {
  data: Category[];
};

export const getVendors = async (): Promise<Category[]> => {
  const response = await apiGetRequest<CategoryResponse>(
    `/user/business-owners`,
  );
  return response.data.data;
};
export const getListings = async (): Promise<Category[]> => {
  const response = await apiGetRequest<CategoryResponse>(`/services`);
  return response.data.data;
};
export const getServiceProviders = async (): Promise<Category[]> => {
  const response = await apiGetRequest<CategoryResponse>(
    `/service-providers?limit=1000`,
  );
  return response.data.data;
};
type SearchParams = {
  query?: string;
  lat: number;
  lng: number;
  radius?: number;
};

export const searchServiceProviders = async (
  params: SearchParams,
): Promise<Category[]> => {
  const { query, lat, lng, radius } = params;

  const searchParams = new URLSearchParams();

  if (query) searchParams.append("query", query);
  if (lat !== undefined) searchParams.append("lat", lat.toString());
  if (lng !== undefined) searchParams.append("lng", lng.toString());
  if (radius !== undefined) searchParams.append("radius", radius.toString());

  const response = await apiGetRequest<CategoryResponse>(
    `/service-providers/search?${searchParams.toString()}`,
  );

  return response.data.data;
};

export const getServiceCategories = async (): Promise<Category[]> => {
  const response = await apiGetRequest<CategoryResponse>(`/service-categories`);

  return response.data.data;
};
export const getProducts = async (
  limit: number,
  cat?: string,
  title?: string,
  user?: string,
): Promise<any> => {
  const params = new URLSearchParams();

  if (cat) {
    params.append("category", cat);
  }

  if (title) {
    params.append("title", title);
  }
  if (user) {
    params.append("user", user);
  }

  // add pagination_size last
  params.append("pagination_size", limit.toString());

  const response = await apiGetRequest<{ data: any }>(
    `/product?${params.toString()}`,
  );
  return response.data;
};
export const getProduct = async (id: string) => {
  const response = await apiGetRequest<{ data: object }>(`/product/${id}`);
  return response.data;
};
export const getUser = async () => {
  const response = await apiGetRequest<{ data: object }>(`/user/profile`);
  return response.data;
};
export const getServiceProvider = async () => {
  const response = await apiGetRequest<{ data: any }>(`/service-providers/me`);
  return response.data.data;
};
export const getBookingsForCustomer = async (statuses?: string[]) => {
  const url = statuses?.length
    ? `/bookings/my-bookings?status=${statuses.join(",")}`
    : `/bookings/my-bookings`;

  const response = await apiGetRequest<{ data: any }>(url);
  return response.data.data;
};
export const getServiceProviderById = async (id: string) => {
  const response = await apiGetRequest<{ data: object }>(
    `/service-providers/${id}`,
  );
  return response.data;
};
export const getProductOrderById = async (id: string) => {
  const response = await apiGetRequest<{ data: object }>(
    `/product-order/${id}`,
  );
  return response.data;
};
export const getServicesByServiceProviderId = async (id: string) => {
  const response = await apiGetRequest<{ data: [] }>(
    `/services/provider/${id}`,
  );

  return response.data;
};
export const getBanks = async () => {
  const response = await apiGetRequest<{ data: [] }>(`/user/bank`);

  return response.data;
};
export const getServiceProviderStats = async (id: string) => {
  const response = await apiGetRequest<BookingStatsResponse>(
    `/service-providers/${id}/stats`,
  );
  return response.data.data;
};
export const getServiceProviderDetailedStats = async (id: string) => {
  const response = await apiGetRequest<BookingStatsResponse>(
    `/service-providers/${id}/detailed-stats`,
  );
  return response.data.data;
};
export const getServiceProviderBookingStats = async (id: string) => {
  const response = await apiGetRequest<BookingStatsResponse>(
    `/bookings/analytics/provider/${id}`,
  );
  return response.data.data;
};

export const getOrders = async (id: string | null, status?: string) => {
  let url = `/product-order?customer=${id}&pagination_size=100`;

  if (status) {
    url += `&status=${status}`;
  }

  const response: AxiosResponse<{ data: [] }> = await apiGetRequest<{
    data: [];
  }>(url);

  return response.data;
};
export const getCategories = async (): Promise<any[]> => {
  const response = await apiGetRequest<CategoryResponse>(`/product-category`);

  return response.data.data;
};
export const getUpcomingBookings = async (id: string | null) => {
  const response = await apiGetRequest<CategoryResponse>(
    `/bookings/${id}/upcoming?daysAhead=${365}`,
  );
  return response.data.data;
};
export const getBookingsPayment = async () => {
  const response = await apiGetRequest<any>(
    `/booking-payments/provider/my-payments`,
  );
  return response.data.data;
};
export const addProductOrder = async (formData: any) => {
  const response = await apiPost<ProductOrderResponse>(
    `/product-order`,
    formData,
  );
  return response;
};
export const addUserBannk = async (formData: any) => {
  const response = await apiPost<any>(`/user/bank`, formData);
  return response.data;
};
export const cancelBooking = async (formData: any, id: string) => {
  const response = await apiPost<any>(`/bookings/${id}/cancel`, formData);
  return response.data;
};
export const rescheduleBooking = async (formData: any, id: string) => {
  const response = await apiPost<any>(`/bookings/${id}/reschedule`, formData);
  return response.data;
};
export const addServiceListing = async (formData: any) => {
  const response = await apiPost<any>(`/services`, formData);
  return response.data;
};
export const servicePayment = async (formData: any) => {
  const response = await apiPost<any>(`/payment/initialize`, formData);
  return response.data;
};
export const createBooking = async (formData: any) => {
  const response = await apiPost<any>(`/bookings`, formData);
  return response.data;
};
export const signUpServiceProvider = async (formData: any) => {
  const response = await apiPost<any>(`/auth/register-provider`, formData);
  return response.data;
};
export const SignUp = async (formData: SignUpProps) => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return response;
};
export const Login = async (formData: LoginProps) => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return response;
};
export const getProductReviews = async (productId: string) => {
  const response = await apiGetRequest<{ data: [] }>(
    `/product-review?product=${productId}`,
  );
  return response.data;
};
export const getShippingAddress = async (userId: string) => {
  const response = await apiGetRequest<{ data: [] }>(
    `/shipping-address?user=${userId}`,
  );
  return response.data;
};
export const forgotPassword = async (email: string) => {
  return await apiPost<{ message: string }>(
    `/auth/forgot-password/${email}`,
    {},
  );
};
export const addNewReview = async (formData: any) => {
  const response = await apiPost<{ message: string }>(
    `/product-review`,
    formData,
  );
  return response;
};
export const updateUser = async (formData: any) => {
  const response = await apiPatch<{ message: string }>(`/user`, formData);
  return response;
};
