"use client";

import { useSocket } from "@/hooks/useSocket";
import { useEffect, useRef, useState } from "react";
import { UserIcon, SendHorizonal } from "lucide-react";
import jwt from "jsonwebtoken";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

type ChatMessage = {
  id: number;
  roomId: number;
  message: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

export function ChatClient({
  messages,
  id,
}: {
  messages: ChatMessage[];
  id: string;
}) {
  const [chats, setChats] = useState<ChatMessage[]>(messages);
  const [newMessage, setNewMessage] = useState("");
  const { socket, loading } = useSocket();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token) as { userId: string };
        if (decoded?.userId) {
          setCurrentUserId(decoded.userId);
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (socket && !loading) {
      const handleOpen = () => {
        socket.send(JSON.stringify({ type: "join_room", roomId: id }));
      };

      if (socket.readyState === WebSocket.OPEN) {
        handleOpen();
      } else {
        socket.addEventListener("open", handleOpen);
      }

      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        console.log("Socket message received:", parsedData);

        const receivedMessage: ChatMessage = {
          id: Date.now(),
          roomId: parseInt(id),
          message: parsedData.message,
          userId: parsedData.userId ?? "",
          user: {
            id: parsedData.userId ?? "",
            name: parsedData.userName,
            email: "",
            avatar: null,
          },
        };
        setChats((prev) => [...prev, receivedMessage]);
      };

      return () => {
        socket.removeEventListener("open", handleOpen);
        socket.close();
      };
    }
  }, [socket, loading, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !socket || socket.readyState !== WebSocket.OPEN) return;

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      roomId: parseInt(id),
      message: trimmed,
      userId: currentUserId ?? "",
      user: {
        id: currentUserId ?? "",
        name: "You",
        email: "",
        avatar: null,
      },
    };

    setChats((prev) => [...prev, optimisticMessage]);

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: id,
        message: trimmed,
        userId: currentUserId,
      })
    );

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
  };

  return (
    <div className="bg-[#f4f2ee] dark:bg-black flex flex-col w-full max-w-2xl mx-auto p-4 border shadow-md rounded-md h-[calc(100vh-100px)]">
      <h2 className="text-lg font-bold mb-3 text-center">Chat Room: {id}</h2>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-4 pr-1">
        {chats.map((chat) => {
          const isCurrentUser = chat.userId === currentUserId;

          return (
            <div key={chat.id} className="w-full flex">
              <div
                className={`flex items-end space-x-2 max-w-[80%] ${
                  isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {chat.user?.avatar ? (
                  <img
                    src={chat.user.avatar}
                    alt={chat.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-lg text-sm break-words ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-black rounded-bl-none"
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                    {isCurrentUser ? "You" : chat.user?.name ?? "Unknown"}
                  </div>
                  {chat.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-50">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 border-t pt-3 relative">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          😊
        </button>

        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border rounded-md text-sm focus:outline-none"
        />

        <button
          onClick={handleSendMessage}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
