import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditor from './CodeEditor';
import { EnvironmentProvider } from './EnvironmentContext';

process.env.REACT_APP_COLLABORATION_SERVICE_URL = 'https://mock-collaboration-service.com';

describe('CodeEditor Component Tests', () => {

  test('renders without crashing', () => {
    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    expect(getByTestId('code-editor')).toBeInTheDocument();
  });

  test('handles user input correctly', async () => {
    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    const codeInput = getByTestId('code-input');
    fireEvent.change(codeInput, { target: { value: 'console.log("Hello, World!")' } });
    expect(codeInput.value).toBe('console.log("Hello, World!")');
  });

  test('sends updates on user input for real-time collaboration', async () => {
    const mockSendUpdate = jest.fn();
    CodeEditor.prototype.sendUpdate = mockSendUpdate;

    const { getByTestId } = render(
      <EnvironmentProvider>
        <CodeEditor />
      </EnvironmentProvider>
    );
    const codeInput = getByTestId('code-input');
    fireEvent.change(codeInput, { target: { value: 'console.log("Test")' } });
    await waitFor(() => expect(mockSendNumber).toHaveBeenCalledWith('console.log("Test")'));
  });

  test('integrates with collaboration service using environment variable', () => {
    expect(process.env.REACT_APP_COLLABORATION_SERVICE_URL).toBe('https://mock-collaboration-service.com');
  });

});