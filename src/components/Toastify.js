import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const props = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
}

const toastError = (msg) => {
    toast.error(msg, props);
}

const toastSuccess = (msg) => {
    toast.success(msg, props)
}

const toastLoading = (msg) => {
    return toast.loading(msg, props)
}

const toastUpdate = (id, otherProps) => {
    toast.update(id, {...otherProps, ...props})
}

const ToastifyContainer = (props) => {
    return <ToastContainer {...props}/>
}

export { 
    ToastifyContainer, 
    toastError,
    toastSuccess,
    toastLoading,
    toastUpdate,
} 