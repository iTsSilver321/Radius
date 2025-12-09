import { supabase } from "@/src/lib/supabase";
import { decode } from "base64-arraybuffer";
// @ts-ignore - legacy import might not have types or is temporary
import * as FileSystem from "expo-file-system/legacy";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { Item } from "../feed/types";

export const uploadImage = async (uri: string): Promise<string | null> => {
  try {
    // Compress image
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: "base64",
    });

    const fileName = `${Date.now()}.jpg`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("items")
      .upload(filePath, decode(base64), {
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("items")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("FileSystem error:", error);
    return null;
  }
};

export const createItem = async (
  item: Omit<Item, "id" | "created_at">
): Promise<{ error: any; data: Item | null }> => {
  // Convert location to WKT (Well-Known Text) for PostGIS
  const { location, ...rest } = item;
  let wktLocation = null;
  
  if (location) {
      wktLocation = `POINT(${location.longitude} ${location.latitude})`;
  }

  const { data, error } = await supabase
    .from("items")
    .insert([{ ...rest, location: wktLocation }])
    .select()
    .single();

  return { error, data };
};

export const updateItem = async (
  id: string,
  updates: Partial<Omit<Item, "id" | "created_at" | "owner_id">>
): Promise<{ error: any; data: Item | null }> => {
  const { location, ...rest } = updates;
  let wktLocation = undefined;

  if (location) {
    wktLocation = `POINT(${location.longitude} ${location.latitude})`;
  }

  const updateData: any = { ...rest };
  if (wktLocation) {
    updateData.location = wktLocation;
  }

  const { data, error } = await supabase
    .from("items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return { error, data };
};

export const deleteItem = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase.from("items").delete().eq("id", id);
  return { error };
};
