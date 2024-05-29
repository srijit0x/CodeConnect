import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { io } from 'socket.io-client';
const SOCKET_IO_SERVER = process.env.REACT_APP_SOCKET_IO_SERVER || 'http://localhost:4000';

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState('// Start coding...');
  const editorRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  // Debounce code update function
  const handleCodeUpdate = debounce((newCode: string) => {
    setCode(newCode);
    socketRef.current.emit('codeChange', { newCode });
  }, 500);

  // Editor configuration and event handling
  const configureEditor = (editor: any) => {
    editor.onDidChangeModelContent(() => {
      const newCode = editor.getValue();
      handleCodeUpdate(newCode);
    });
  };

  // Handler to perform actions when the editor is mounted
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    configureEditor(editor);
  };

  // Initialize socket connection and handle incoming code changes
  const initializeSocketConnection = () => {
    socketRef.current = io(SOCKET_IO_SERVER);
    socketRef.current.on('codeChange', (data: { newCode: string }) => {
      const { newCode } = data;
      if (newCode !== code) {
        editorRef.current.setValue(newCode);
      }
    });
  };

  useEffect(() => {
    initializeSocketConnection();
    return () => {
      socketRef.current.disconnect();
    };
  }, [code]);

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onMount={handleEditorDidMount}
        value={code}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;