import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Button } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import CommunityPost from "@/components/CommunityPost";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { fetchPhotos } from "../../utils/api";

type RootStackParamList = {
  UploadPost: undefined;
};

export default function CommunityScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    const setup = async () => {
      await AsyncStorage.setItem("userId", "1");
      await loadPosts();
    };
    setup();
  }, []);

  const loadPosts = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) return;
      const res = await fetchPhotos();
      setPosts(res.data.userphotos);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const filetype = filename?.split(".").pop() || "jpg";

      formData.append("photo", {
        uri: imageUri,
        name: `upload.${filetype}`,
        type: `image/${filetype}`,
      } as any);

      formData.append("userId", (await AsyncStorage.getItem("userId")) || "1");
      formData.append("caption", caption || "");
      formData.append("latitude", "0");
      formData.append("longitude", "0");
      formData.append("mushroomId", "1");

      const response = await fetch(
        "https://capcheck.onrender.com/api/userphotos",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      Alert.alert("Success", "Photo uploaded!");
      setImageUri(null);
      setCaption("");
      loadPosts();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/1000_F_370951245_vWF0oLH6WRDT5kb9Anvl4HbLCJBBX3XI.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.container}>
     <View style={styles.introContainer}>   
      <ThemedText style={styles.intro}>
          Welcome to the community!
        </ThemedText>
        <ThemedText style={styles.intro}>Like, comment, and explore mushrooms found
          by others.
        </ThemedText>
      </View>

        <View style={styles.uploadSection}>
           <Button
            color="black"
            onPress={() => navigation.navigate("UploadPost")}
          >
            Take Photo
          </Button>
          <View style={styles.greybutton}>
            <Button color="black" onPress={pickImage}>
              Choose Image from Library
            </Button>
          </View>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}
          <View style={styles.greybutton}>
        </View>
          <TextInput
            placeholder="Enter caption..."
            placeholderTextColor="#666"
            value={caption}
            onChangeText={setCaption}
            style={styles.input}
          />
          <View style={styles.greybutton}>
            <Button
              color="black"
              onPress={handleUpload}
              disabled={!imageUri || !caption}
            >
              Upload
            </Button>
          </View>
        </View>
        

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.shadow}>
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <CommunityPost post={item} />}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginTop: 0,
    borderRadius: 10,
    shadowColor: "#4e5249",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 5.4,
    shadowRadius: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#e8e8e8",
    borderRadius: 16,
    justifyContent: "center",
  },
  introContainer: {
    padding: 20,

  },
  intro: {
    fontSize: 20,
    color: "#555",

  },
  uploadSection: {
    marginTop: 5,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    color: "#222222",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "#ccc",
  },
  buttonTitle: {
    color: "#f5f5f5",
  },
  greybutton: {
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 2.5,
    shadowRadius: 20,
    borderColor: "#000",
    borderWidth: 0.4,
    borderRadius: 120,
  },
});
