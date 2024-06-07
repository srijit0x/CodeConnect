import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditor from './CodeEditor';
import { EnvironmentProvider } from './EnvironmentContext';

process.env.REACT_APP_COLLABORATION_SERVICE_URL = 'https://mock-collaboration-service.com';

describe('CodeEditor Component Tests', () => {

  test('renders CodeEditor component successfully', () => {
    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    expect(getByTestId('code-editor')).toBeInTheDocument();
  });

  test('updates code input field based on user typing', async () => {
    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    const codeEditorInput = getByTestId('code-input');
    fireEvent.change(codeEditorInput, { target: { value: 'console.log("Hello, World!")' } });
    expect(codeEditorInput.value).toBe('console.log("Hello, World!")');
  });

  test('broadcasts code edits for collaborative editing feature', async () => {
    const mockBroadcastCodeEdit = jest.fn();
    CodeEditor.prototype.broadcastCodeEdit = mockBroadcastCodeEdit;

    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    const codeEditorInput = getByTestId('code-input');
    fireEvent.change(codeEditorFilter, { target: { value: 'console.log("Test")' } });
    await waitFor(() => expect(mockBroadcastCodeEdit).toHaveBeenCalledWith('console.log("Test")'));
  });

  test('checks collaboration service URL configuration', () => {
    expect(process.env.REACT_APP_COLLABORATION_SERVICE_URL).toBe('https://mock-collaboration-service.com');
  });

});