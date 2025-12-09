export interface Room {
    id: string;
    item_id: string;
    buyer_id: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
    item?: {
        title: string;
        image_url: string;
        price: number;
    };
    other_user?: {
        full_name: string;
        avatar_url: string;
    };
    last_message?: {
        content: string;
        created_at: string;
        read_at: string | null;
    };
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
}
