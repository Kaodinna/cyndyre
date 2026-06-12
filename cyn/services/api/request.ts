import {
  apiDelete,
  apiGetRequest,
  apiPatch,
  apiPost,
  SERVER_URL,
} from "@/utils/axios/axios";
import {
  ProductOrderResponse,
  LoginProps,
  SignUpProps,
  Category,
  BookingStatsResponse,
} from "./../../types/type";
import { AxiosResponse } from "axios";
const baseUrl = `${SERVER_URL}/api/v1`;

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
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return response;
};
export const Login = async (formData: LoginProps) => {
  const response = await fetch(`${baseUrl}/auth/login`, {
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
export const addShippingAddress = async (formData: any) => {
  const response = await apiPost<any>(`/shipping-address`, formData);
  return response.data;
};
export const deleteShippingAddress = async (id: string) => {
  const response = await apiDelete<any>(`/shipping-address/${id}`);
  return response.data;
};
export const getPeriodTrackerData = async () => {
  const response = await apiGetRequest<{ data: any }>(`/period-tracker/me`);
  return response.data.data;
};
export const savePeriodTrackerData = async (formData: {
  lastPeriodDate: string;
  periodLength?: number;
  cycleLength?: number;
}) => {
  const response = await apiPost<{ data: any }>(`/period-tracker`, formData);
  return response.data.data;
};
export const forgotPassword = async (email: string) => {
  return await apiPost<{ message: string }>(
    `/auth/forgot-password/${email}`,
    {},
  );
};
export const getChatMessages = async (bookingId: string) => {
  const response = await apiGetRequest<{ data: any[] }>(
    `/bookings/${bookingId}/chat`,
  );
  return response.data.data ?? response.data;
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

export const signUpRider = async (formData: any) => {
  const response = await apiPost<any>(`/auth/register-rider`, formData);
  return response.data;
};

export const getRiderOrders = async (riderId: string, status?: string) => {
  let url = `/product-order?rider=${riderId}&pagination_size=100`;
  if (status) url += `&status=${status}`;
  const response = await apiGetRequest<{ data: [] }>(url);
  return response.data;
};

export const updateRiderOrderStatus = async (
  orderId: string,
  status: string,
) => {
  const response = await apiPatch<{ data: any }>(
    `/product-order/${orderId}/status`,
    { status },
  );
  return response.data;
};

export const getAvailableOrders = async () => {
  const response = await apiGetRequest<{ data: any[] }>(`/product-order/available`);
  return response.data;
};

export const claimOrder = async (orderId: string) => {
  const response = await apiPatch<{ data: any }>(`/product-order/${orderId}/claim`, {});
  return response.data;
};

export const getVendorOrders = async () => {
  const response = await apiGetRequest<{ data: any[] }>(`/product-order/vendor`);
  return (response.data as any).data ?? response.data;
};

export const markOrderAsPackaged = async (orderId: string) => {
  const response = await apiPatch<{ data: any }>(`/product-order/${orderId}/package`, {});
  return response.data;
};

export const getProviderAvailableDates = async (
  providerId: string,
  startDate: string,
  endDate: string,
): Promise<{ date: string; availableTimes: string[]; isAvailable: boolean }[]> => {
  const response = await apiGetRequest<{ data: { availableDates: any[] } }>(
    `/provider-availability/provider/${providerId}/available-dates?startDate=${startDate}&endDate=${endDate}`,
  );
  return (response.data as any).data?.availableDates ?? [];
};

export const getProviderAvailableTimes = async (
  providerId: string,
  date: string,
): Promise<{ availableTimes: string[]; isAvailable: boolean }> => {
  const response = await apiGetRequest<{ data: any }>(
    `/provider-availability/provider/${providerId}/available-times?date=${date}`,
  );
  return (response.data as any).data ?? { availableTimes: [], isAvailable: false };
};

export const getNotifications = async () => {
  const response = await apiGetRequest<{ data: any[] }>(`/notifications`);
  return (response.data as any).data ?? [];
};

export const getUnreadNotificationCount = async () => {
  const response = await apiGetRequest<{ data: { count: number } }>(`/notifications/unread-count`);
  return (response.data as any).data?.count ?? 0;
};

export const markNotificationRead = async (id: string) => {
  const response = await apiPatch<{ data: any }>(`/notifications/${id}/read`, {});
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiPatch<{ message: string }>(`/notifications/read-all`, {});
  return response.data;
};

export const getProviderAvailability = async (providerId: string) => {
  const response = await apiGetRequest<{ data: any[] }>(
    `/provider-availability/provider/${providerId}`,
  );
  return (response.data as any).data ?? [];
};

export const createProviderAvailability = async (data: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  specificDate?: string;
  notes?: string;
}) => {
  const response = await apiPost<{ data: any }>(`/provider-availability`, data);
  return response.data;
};

export const updateProviderAvailability = async (
  id: string,
  data: { startTime?: string; endTime?: string; isAvailable?: boolean; notes?: string },
) => {
  const response = await apiPatch<{ data: any }>(`/provider-availability/${id}`, data);
  return response.data;
};

export const deleteProviderAvailability = async (id: string) => {
  const response = await apiDelete<{ data: any }>(`/provider-availability/${id}`);
  return response.data;
};

export const createWithdrawalRequest = async (amount: number) => {
  const response = await apiPost<{ data: any }>(`/withdrawal-requests`, { amount });
  return response.data;
};

export const updateRiderLocation = async (
  latitude: number,
  longitude: number,
) => {
  const response = await apiPatch<{ data: any }>(`/rider/location`, {
    latitude,
    longitude,
  });
  return response.data;
};
