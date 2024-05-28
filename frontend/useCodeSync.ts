import { useEffect, useState, useRef } from 'react';

interface CodeUpdate {
  userId: string;
  content: string;
  type: 'codeUpdate' | 'broadcast';
}

function useCodeSync(url: string, roomId: string, userId: string) {
  const [code, setCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  useEffect(() => {
    connect();

    function connect() {
      ws.current = new WebSocket(`${url}?roomId=${roomId}&userId=${userId}`);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        startHeartbeat();
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'codeUpdate' && message.userId !== userId) {
          setCode(message.content);
        }
        
        if (message.type === 'broadcast') {
          console.log('Broadcast message received:', message.content);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        retryConnection();
      };
    }

    function startHeartbeat() {
      setInterval(() => {
        sendHeartbeat();
      }, 30000);
    }

    function sendHeartbeat() {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }

    function retryConnection() {
      const maxAttempts = 5;
      if (reconnectAttempts < maxAttempts) {
        setTimeout(() => {
          setReconnectAttempts(reconnectAttempts + 1);
          console.log(`Reconnection attempt #${reconnectAttempts + 1}`);
          connect();
        }, 5000);
      }
    }

    return () => {
      ws.current?.close();
    };
  }, [url, roomId, userId, reconnectAttempts]);

  const sendUpdate = (content: string, type: 'codeUpdate' | 'broadcast' = 'codeUpdate') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const update: CodeUpdate = {
        userId,
        content,
        type,
      };
      ws.current.send(JSON.stringify(update));
    }
  };

  const updateCode = (newCode: string) => {
    setCode(newCode);
    sendUpdate(newCode);
  };

  const broadcastMessage = (message: string) => {
    sendUpdate(message, 'broadcast');
  };

  return { code, updateCode, isConnected, broadcastMessage };
}

export default useCodeSync;