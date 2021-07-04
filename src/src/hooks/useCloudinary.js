import { useCallback, useState } from "react";
import useScript from "./useScript";
import uploadWidgetSettings from "../config/uploadWidgetSettings.json";

function useCloudinary(cb) {
  const [uploadFile, setUploadFile] = useState();

  const onLoad = useCallback(() => {
    const widget = window.cloudinary.createUploadWidget(
      uploadWidgetSettings,
      (err, result) => {
        if (err) console.error(err);
        if (result?.event === "success") {
          cb(result);
        }
      }
    );
    setUploadFile((st) => widget.open);
  }, [cb])

  useScript("https://widget.cloudinary.com/v2.0/global/all.js", onLoad);

  return uploadFile;
}

export default useCloudinary;