import { StyleSheet, TouchableOpacity, Image } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useSession } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import { toastSettings } from "../../components/ToastSettings";
import { ImagePickerResult as ExpoImagePickerResult } from "expo-image-picker";
import { updateUserImage } from "../../graphql/mutations/updateUserImage";
import { theme } from "../../core/theme";
type ImagePickerResult = ExpoImagePickerResult & { cancelled?: boolean };

export const processImage = (image: ImagePickerResult) => {
  delete image.cancelled;
  return image;
};

export default function AccountScreen() {
  const sessionInfo = useSession();
  const [image, setImage] = useState<string | null>(null);

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }

  const { session, isLoading, signOut, fetchUser } = sessionInfo;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const { user } = session;

  // Função para converter base64 em URI para a Image do React Native
  const base64ImageURI = `data:image/jpeg;base64,${user?.base64Image || ""}`;

  const handleEditImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    const image = processImage(result);
    if (image.assets) {
      if (image.assets[0].base64) {
        const response = await updateUserImage(image.assets[0].base64, session);
        if (response) {
          fetchUser();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conta</Text>

      <TouchableOpacity onPress={handleEditImage}>
        {user.base64Image ? (
          <Image source={{ uri: base64ImageURI }} style={styles.profileImage} />
        ) : (
          <View style={styles.noProfileImage}></View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.userInfo}>
          Nome: {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userInfo}>E-mail: {user.email}</Text>
        <Text style={styles.userInfo}>Usuário: {user.username}</Text>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>SAIR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  noProfileImage: {
    height: 80,
    width: 80,
    backgroundColor: "gray",
    borderRadius: 360,
    margin: 15,
  },
  infoContainer: {},
});
