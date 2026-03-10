import { Toast } from 'toastify-react-native';

export const successToast = (title = 'Success', message = '') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'bottom',
    useModal: false,
  });
};

export const errorToast = (title = 'Error', message = '') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'bottom',
    useModal: false,
  });
};
