import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { io } from 'socket.io-client';
const SOCKET_IO_SERVER = process.env.REACT_APP_SOCKET_IO_SERVER || 'http://localhost:4000';
const CodeEditor: React.FC = () => {
  const [code, setCode] = useState('// Start coding...');
  const editorRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(event => {
      const newCode = editor.getValue();
      setCode(newCode);
      socketRef.current.emit('codeChange', { newCode });
    });
  };
  useEffect(() => {
    socketRef.current = io(SOCKET_IO_SERVER);
    socketRef.current.on('codeChange', (data: { newCode: string }) => {
      editorRef.current.setValue(data.newCode);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
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