import { ServerError } from "@/types/config";
import { showToastWithStatus } from "./alert";

// server side
export const handleError = (
  message?: string,
  statusCode?: number,
  error?: boolean
): ServerError => {
  return {
    error: error ? error : true,
    status: statusCode ? statusCode : 500,
    message: message ? message : "Internal server error!",
  };
};

// client side
export const handleErorrUI = (res: ServerError) => {
  if (res.status === 500) {
    showToastWithStatus("Internal server error!", 500);
  } else {
    showToastWithStatus(res.message, res.status);
  }
};
