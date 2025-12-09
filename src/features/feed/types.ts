export interface Item {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  description: string | null;
  image_url: string;
  category: string;
  status: "active" | "reserved" | "sold";
  is_boosted?: boolean;
  boost_expiry?: string;
  created_at: string;
  // PostGIS returns GeoJSON or parsed object
  location: {
    latitude: number;
    longitude: number;
  } | null;
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string;
    reputation: number;
  };
}
