import React, { useState } from 'react';
import { validateCode } from '../services/apiService';

interface CodeEntryModalProps {
  onClose: () => void;
  onSuccess: (code: string) => void;
}

export const CodeEntryModal: React.FC<CodeEntryModalProps> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const codeToValidate = code.trim();
    const isValid = await validateCode(codeToValidate);

    if (isValid) {
      onSuccess(codeToValidate);
    } else {
      setError('Invalid code. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Enter Access Code</h2>
          <p className="text-center text-gray-600 mt-2">Please enter your unique code to proceed.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="access-code" className="sr-only">Access Code</label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., RAONIX-2024"
                className="w-full text-center bg-gray-100 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 font-mono text-base"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full flex items-center justify-center gap-2 text-black bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-base px-5 py-3 text-center transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};