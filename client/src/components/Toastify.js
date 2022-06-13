import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";

const props = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

const toastError = (msg) => {
  toast.error(msg, props);
};

const toastSuccess = (msg) => {
  toast.success(msg, props);
};

const toastLoading = (msg) => {
  return toast.loading(msg, { ...props, closeOnClick: false });
};

const toastUpdate = (id, otherProps) => {
  toast.update(id, { ...props, ...otherProps });
};

const ToastifyContainer = (props) => {
  return <ToastContainer key={() => uuidv4()} {...props} limit={1} />;
};

export {
  ToastifyContainer,
  toastError,
  toastSuccess,
  toastLoading,
  toastUpdate,
};
