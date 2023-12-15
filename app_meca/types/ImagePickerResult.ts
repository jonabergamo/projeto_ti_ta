import { ImagePickerResult as ExpoImagePickerResult } from "expo-image-picker";

export type ImagePickerResult = ExpoImagePickerResult & { cancelled?: boolean };
