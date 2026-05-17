import { ReactNode } from "react";
import { Animated, KeyboardTypeOptions, TextInputProps } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { ImagePickerAsset } from "expo-image-picker";

export interface ProductPropsType {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  thumbnail: string;
  averageRating: number;
  stock: number;
  coverImage: string;
}

export type CartProduct = ProductPropsType & {
  quantity: number;
};
export interface ApiConfig {
  headers: {
    Authorization: string;
    "Content-Type"?: string;
  };
}
export interface Category {
  title?: string;
  image?: string;
  name?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  _id?: string;
}
export interface TitleProps {
  text: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  color?: string;
  style?: React.CSSProperties;
}
export interface SelectedItem {
  product: string; // or number
  count: number;
  price: number;
}
export interface SignUpProps {
  email: string;
  password: string;
}
export type GeneralInputFieldProps = {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  className?: string;
  control?: any;
  errorMessage?: string;
  labelStyling: string;
  options?: any;
};
interface Option {
  id: string;
  name: string | number; // Adjust value type if needed (could be string, number, or any type you want)
}
export interface DropdownProps {
  className: string;
  placeholder: string;
  label: string;
  options: Option[];
  name: string;
  control?: any;
  errorMessage?: string;
  labelStyling: string;
}
export interface ImageUploadFieldProps {
  control: any;
  name: string;
  action?: string;
  maxCount?: number;
  errorMessage?: string;
  label?: string;
}
export interface LoginProps {
  email: string;
  password: string;
}
export interface ProductOrderResponse {
  data: {
    checkoutLink: string;
  };
  message: string;
  status: number;
}
export interface GeneralCheckboxFieldProps {
  label?: string;
  name: string;
  control: any;
  errorMessage?: string;
  labelStyling?: string;
  linkText?: string;
  linkHref?: string;
}
export type ItemProps = { title: string; image: any };
export type ProductProps = {
  coverImage?: string;
  id?: string;
  title: string;
  image: any;
  description: string;
  averageRating?: number;
  price: number;
};

export type RatingProps = {
  rating: number; // 0–5, can be 3.5, 4.2 etc
  size?: number;
  color?: string;
};
export interface TabButtonsProps {
  tabs: string[];
  activeTab: number;
  onChangeTab: (index: number) => void;
}
export type Props = {
  images: string[];
  height?: number;
  borderRadius?: number;
  thumbnailSize?: number;
  thumbnailSpacing?: number;
};
export type StatCardProps = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  className?: string;
};
export type QuickActionsProps = {
  icon: React.ReactNode;
  value: string;
  route?: string;

  className?: string;
};
export type StatItem = {
  label: string;
  value: string | number;
};

export type PerformanceCardProps = {
  stats: StatItem[]; // Array of 3 stats
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryBtnLabel?: string;
  secondaryBtnLabel?: string;
};
export interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}
export interface InfoRowProps {
  title: string;
  subtitle: string;
  rightText: number;
}
export interface CustomTextInputProps extends TextInputProps {
  value: any;
  onChangeText: (value: any) => void;
  placeholder: string;
  className?: string;
  fadeAnim?: Animated.Value;
  errorMessage?: string;
  label: string;
  placeholderTextColor: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  icon?: ReactNode;
}
interface DropdownOption {
  label: string;
  value: string;
}

export interface CustomDropdownProps {
  label?: string;
  value?: string;
  options: DropdownOption[];
  placeholder?: string;
  icon?: ReactNode;
  errorMessage?: string;
  fadeAnim?: any;
  onSelect: (value: string) => void;
}
export interface CustomTextAreaProps {
  label?: string;
  value: string;
  placeholder?: string;
  placeholderTextColor?: string;
  icon?: ReactNode;
  errorMessage?: string;
  fadeAnim?: any;
  onChangeText: (text: string) => void;
  numberOfLines?: number;
  className?: string;
}

export interface MultiPhotoUploaderProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  errorMessage?: string;
  tipText?: string;
}
export type MessageType = "system" | "client" | "provider";

export type Message = {
  id: string;
  type: MessageType;
  text: string;
  time?: string;
};
export interface BookingStatsData {
  cancelledBookings: number;
  completedBookings: number;
  pendingBookings: number;
  rating: number;
  totalBookings: number;
  totalRatings: number;
  totalRevenue: number;
  pendingRevenue?: number;
  totalServices: number;
}
export interface BookingStatsResponse {
  data: BookingStatsData;
  message: string;
  success: boolean;
}
export type ProductInterface = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  category: string;
};
export type SectionType = {
  name: string;
  data: ProductInterface[][];
};
export type CartItemProps = {
  id?: string;
  title: string;
  description: string;
  price: number;
  qty: number;
  image: any;
  selectedItems: string[];
};
export enum PRODUCT_ORDER_STATUS {
  PENDING = "pending",
  PACKAGED = "packaged",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}
export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timeText?: string;
  tone?: "normal" | "success";
};
