"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Import useRouter hook
import { BACKENDURL } from "@/lib/config";
import axios from "axios";
import { ChatClient } from "@/components/ChatClient";

type ChatUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type ChatMessage = {
  id: number;
  message: string;
  roomId: number;
  userId: string;
  user: ChatUser;
};

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKENDURL}/chat/${slug}`);
  return response.data.room.id as string;
}

async function getChats(roomId: string): Promise<ChatMessage[]> {
  const response = await axios.get(`${BACKENDURL}/chat/room/${roomId}`);
  return response.data.messages as ChatMessage[];
}

export default function Page() {
  const router = useRouter(); // Get the router object
  const { slug } = router.query; // Extract 'slug' from query parameters

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return; // Wait until the slug is available (initially it might be undefined)

    const fetchChatData = async () => {
      try {
        const room = await getRoomId(slug as string); // Ensure slug is a string
        const roomMessages = await getChats(room);
        setRoomId(room);
        setMessages(roomMessages);
      } catch (err) {
        console.error("Error loading chat room:", err);
        setError("Failed to load chat room.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [slug]); // Effect runs when `slug` changes

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        Loading chat room...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-20 text-red-600 text-xl">
        {error}
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex justify-center items-center mt-20 text-red-600 text-xl">
        Chat room not found. Please check the link.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-20">
      <ChatClient id={roomId} messages={messages} />
    </div>
  );
}
