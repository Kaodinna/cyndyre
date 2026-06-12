import axios, { AxiosResponse } from "axios";
import { ApiConfig } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
// export const SERVER_URL = "https://cynderallabackend.onrender.com";
export const SERVER_URL = "http://192.168.1.236:5000";
const baseUrl = `${SERVER_URL}/api/v1`;

export const getToken = async (): Promise<string> => {
  try {
    const storedCustomerData = await AsyncStorage.getItem("customerData");
    if (!storedCustomerData) return "";

    const customerData = JSON.parse(storedCustomerData);
    return customerData?.accessToken || "";
  } catch (error) {
    console.log("getToken error:", error);
    return "";
  }
};
export const apiGetRequest = async <T = any>(
  path: string,
): Promise<AxiosResponse<T>> => {
  // const token =
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTYxODIyNjQzYWM5ZWE1ZDZjOTM0MjUiLCJpYXQiOjE3Njc5OTg5NjcsImV4cCI6MTc2ODAwMjU2N30.2mfkmwMA5EQa8bS9McAp16yjWsmL0qFSm6qWrwr7Sko";
  const token = await getToken();

  const result = await axios.get<T>(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Custom-Header": "value",
    },
  });

  return result;
};

export const apiPost = async <T = any>(
  path: string,
  body: any = {},
): Promise<AxiosResponse<T>> => {
  const token = await getToken();
  const config: ApiConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // Include common headers here if applicable
    },
  };
  return await axios.post<T>(`${baseUrl}${path}`, body, config);
};
export const apiPatch = async <T = any>(
  path: string,
  body: any = {},
): Promise<AxiosResponse<T>> => {
  const token = await getToken();
  const config: ApiConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  return await axios.patch<T>(`${baseUrl}${path}`, body, config);
};
export const apiDelete = async <T = any>(
  path: string,
): Promise<AxiosResponse<T>> => {
  const token = await getToken();
  return await axios.delete<T>(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
