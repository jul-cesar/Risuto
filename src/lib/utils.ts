import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatCustomDate(date:  Date | string ) {
  let result = formatDistanceToNow(new Date(date));

  result = result.replace(/minutes?/, "m")
  .replace(/hours?/, "h")
  .replace(/days?/, "d")
  .replace(/months?/, "mo")
  .replace(/years?/, "y");

   
  result = result.replace(/less than a minute/, "just now");

  return result;
}