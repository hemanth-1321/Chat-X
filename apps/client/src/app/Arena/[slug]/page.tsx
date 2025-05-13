import { BACKENDURL } from "@/lib/config";
import axios from "axios";
import { ChatClient } from "@/components/ChatClient";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKENDURL}/chat/${slug}`);
  return response.data.room.id as string;
}

async function getChats(roomId: string) {
  const response = await axios.get(`${BACKENDURL}/chat/room/${roomId}`);
  return response.data.messages;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  let roomId: string | null = null;
  let messages: any[] = [];

  try {
    roomId = await getRoomId(slug);
    messages = await getChats(roomId);
  } catch (error) {
    console.error("Error loading chat room:", error);
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
