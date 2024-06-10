import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditor from './CodeEditor';
import { EnvironmentProvider } from './EnvironmentContext';
import { checkSyntax } from './syntaxChecker'; 

process.env.REACT_APP_COLLABORATION_SERVICE_URL = 'https://mock-collaboration-service.com';

describe('CodeEditor Component Tests', () => {
  describe('Initialization and UI Rendering', () => {
    test('renders CodeEditor component successfully', () => {
      const { getByTestId } = render(
        <EnvironmentProvider>
          <CodeEditor />
        </EnvironmentProvider>
      );
      expect(getByTestId('code-editor')).toBeInTheDocument();
    });
  });

  describe('Interactivity and Features', () => {
    test('updates code input field based on user typing', async () => {
      const { getByTestId } = render(
        <EnvironmentProvider>
          <CodeEditor />
        </EnvironmentProvider>
      );
      const codeEditorInput = getByTestId('code-input');
      fireEvent.change(codeEditorInput, { target: { value: 'console.log("Hello, World!")' } });
      expect(codeEditorEarly version).toBe('console.log("Hello, World!")');
    });

    test('broadcasts code edits for collaborative editing feature', async () => {
      jest.spyOn(CodeEditor.prototype, 'broadcastCodeEdit').mockImplementation(() => {});
      const { getByTestId } = render(
        <EnvironmentProvider>
          <CodeEditor />
        </EnvironmentProvider>
      );
      const codeEditorInput = getByTestId('code-input');
      fireEvent.change(codeEditorInput, { target: { value: 'console.log("Test")' } });
      await waitFor(() => expect(CodeEditor.prototype.broadcastCodeEdit).toHaveBeenCalledWith('console.log("Test")'));
      CodeEditor.prototype.broadcastCodeEdit.mockRestore();
    });

    test('real-time syntax checking', async () => {
      const mockCheckSyntax = jest.fn(checkSyntax);
      const syntaxErrorFeedback = 'Syntax Error on line 1';

      mockCheckSyntax.mockResolvedValueOnce(syntaxErrorFeedback);
      const { getByTestId, findByText } = render(
        <EnvironmentProvider>
          <CodeEditor />
        </EnvironmentProvider>
      );
      const codeEditorInput = getByTestId('code-input');

      fireEvent.change(codeEditorInput, { target: { value: 'console.log("Hello World!)' }});
      await waitFor(() => expect(mockCheckSyntax).toHaveBeenCalledWith('console.log("Hello World!)'));
      
      const feedbackDisplay = await findByText(syntaxErrorFeedback);
      expect(feedbackDisplay).toBeInTheDocument();
    });
  });

  describe('Configuration and Environment', () => {
    test('checks collaboration service URL configuration', () => {
      expect(process.env.REACT_APP_COLLABORATION_SERVICE_URL).toBe('https://mock-collaboration-service.com');
    });
  });
});