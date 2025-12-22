import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
