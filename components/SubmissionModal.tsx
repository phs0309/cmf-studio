import React, { useState } from 'react';

interface SubmissionModalProps {
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        await onSubmit(comment);
    } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">라오닉스에게 보내기</h2>
                <p className="text-gray-600">
                    생성된 디자인에 대한 설명이나 추가 요청사항을 작성해주세요. 담당자가 확인 후 연락드리겠습니다.
                </p>
                <div>
                    <label htmlFor="submission-comment" className="sr-only">코멘트</label>
                    <textarea
                        id="submission-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="예: 이 디자인에서 손잡이 부분만 유광으로 변경해주세요."
                        className="w-full h-32 bg-gray-100 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 text-base"
                        required
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                 <button
                    type="button"
                    onClick={onClose}
                    className="text-black bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
                    >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !comment}
                    className="text-blue-900 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-200 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200 flex items-center"
                >
                    {isLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isLoading ? '전송 중...' : '전송'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
