import { WS_URL } from "@/lib/config";
import { useEffect, useState } from "react";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
