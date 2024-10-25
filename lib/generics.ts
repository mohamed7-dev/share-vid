import { AllowedMedia } from "@/types/config";
import { DocumentPickerAsset } from "expo-document-picker";
import { storage } from "./appwrite";
import { APPWRITE_CONFIG } from "@/constants/app";
import { ID, ImageGravity, Models } from "react-native-appwrite";
import { handleError } from "@/utils/error";

export const uploadFile = async (
  file: DocumentPickerAsset,
  mediaType: AllowedMedia
) => {
  try {
    if (file.mimeType && file.size && file.uri) {
      const res = await storage.createFile(
        APPWRITE_CONFIG.storageId,
        ID.unique(),
        {
          type: file.mimeType,
          size: file.size,
          name: file.name,
          uri: file.uri,
        }
      );
      // return fileUrl to be saved in db
      const fileUrl = await getFileURL(res.$id, mediaType);
      return { url: fileUrl, fileId: res.$id };
    } else {
      return handleError("please, make sure file info is correct!", 400);
    }
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    return await storage
      .deleteFile(APPWRITE_CONFIG.storageId, fileId)
      .then(() => {
        return { deleted: true };
      });
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
};

export const getFileURL = async (
  fileId: Models.File["$id"],
  mediaType: AllowedMedia
) => {
  let fileURL;
  try {
    switch (mediaType) {
      case "Video":
        fileURL = storage.getFileView(APPWRITE_CONFIG.storageId, fileId);
        break;
      case "Image":
        fileURL = storage.getFilePreview(
          APPWRITE_CONFIG.storageId,
          fileId,
          2000,
          2000,
          ImageGravity.Top,
          100
        );
        break;
      default:
        throw new Error("media type is not supported!");
    }
    return fileURL;
  } catch (error) {
    return handleError((error as Error).message, 500);
  }
};
