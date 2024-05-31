import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { io } from 'socket.io-client';

const SOCKET_IO_SERVER = process.env.REACT_APP_SOCKET_IO_SERVER || 'http://localhost:4000';

function debounce(func: (...args: any[]) => void, timeout = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState('// Start coding...');
  const editorRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  const handleCodeUpdate = debounce((newCode: string) => {
    setCode(newCode);
    socketRef.current.emit('codeChange', { newCode });
  }, 500);

  const configureEditor = (editor: any) => {
    editor.onDidChangeModelContent(() => {
      const newCode = editor.getValue();
      handleCodeUpdate(newCode);
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    configureEditor(editor);
  };

  const initializeSocketConnection = () => {
    socketRef.current = io(SOCKET_IO_SERVER);
    socketRef.current.on('codeChange', (data: { newCode: string }) => {
      const { newCode } = data;
      if (newCode !== code) {
        editorRef.current?.setValue(newCode);
      }
    });
  };

  useEffect(() => {
    initializeSocketConnection();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue={code}
        onMount={handleEditorDidMount}
        value={code}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;