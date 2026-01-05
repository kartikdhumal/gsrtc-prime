import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const gujaratCities = {
  "Gujarat": [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kachchh",
    "Kutch",
    "Kheda",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panch Mahals",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
    "Vav-Tharad"
  ]
};

export const generateEmployeeId = () => {
  return "EMP-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
});

export const CLOUDINARY_CLOUD_NAME = 'ddhjzsml9';
export const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

export const convertTimeToMinutes = (timeString?: string): number | null => {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }

  const [hours, minutes] = timeString.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return (hours * 60) + minutes;
};

export const convertMinutesToTime = (totalMinutes?: number | null): string => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
    return "00:00";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}`;
};