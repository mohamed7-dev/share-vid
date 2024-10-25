import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tw-merge";

export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
