import { ALERT_TYPE, Toast } from "react-native-alert-notification";

const showToast = (message: string, level: ALERT_TYPE) => {
  return Toast.show({
    type: level,
    textBody: message,
    title: level,
  });
};

export const showToastWithStatus = (message: string, statusCode: number) => {
  switch (statusCode) {
    case 500:
      return showToast(message, ALERT_TYPE.DANGER);
    case 400:
      return showToast(message, ALERT_TYPE.WARNING);
    case 200:
      return showToast(message, ALERT_TYPE.SUCCESS);
    case 201:
      return showToast(message, ALERT_TYPE.SUCCESS);
    default:
      return showToast(message, ALERT_TYPE.DANGER);
  }
};
