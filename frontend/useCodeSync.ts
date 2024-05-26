import { useEffect, useState, useRef } from 'react';

interface CodeUpdate {
  userId: string;
  content: string;
}

function useCodeSync(url: string, roomId: string, userId: string) {
  const [code, setCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`${url}?roomId=${roomId}`);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.userId !== userId) {
        setCode(message.content);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [url, roomId]);

  const sendUpdate = (content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const update: CodeUpdate = {
        userId,
        content,
      };
      ws.current.send(JSON.stringify(update));
    }
  };

  const updateCode = (newCode: string) => {
    setCode(newCode);
    sendUpdate(newCode);
  };

  return { code, updateCode, isConnected };
}

export default useCodeSync;