import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 2500,
  pauseOnHover: true,
  closeOnClick: true,
};

export const notifySuccess = (message) => toast.success(message, baseOptions);
export const notifyError = (message) => toast.error(message, baseOptions);
export const notifyInfo = (message) => toast.info(message, baseOptions);
