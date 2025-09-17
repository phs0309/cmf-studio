import React from 'react';

const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaUAAAA0CAYAAAC2PAxAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAfGSURBVHhe7Z1/aBxlGMf/Z2dlkSRLqIggISgIqYI2KCp2K1Wt2CoWERFBQRUFFcTKwVataIWCKhYVlaJiVCwVsbC0kFYxVLGwEFGLgqBCCgKiSMhKshgy+3u/zGSSZJLMfczsnff5/MJuZr755s373Tfz3szO7I4gCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIJgYlJSkgoJCSlZWVknKioqjU6n23LkyJF7cnJy/sSJE/fS0tLeCIIgCIIgCDYxGo19tbe3r62oqLh69er1/96+fftOQ0PDl2nTprOam5t/+tFHHzV+x9sCIIgCIIgCIJNmDFjxj9ramq+O3bs2H5xcfGLo0ePvm/ZsmV/0dHRv5w8efIfN27c+JkgCIIgCIIg2IQJCQnfHz58+KuirFmz5n/r16+/N3r06J+9e/ff9+3bd9LFixdPmTNnzt2tW7f2gCIIgiAIgiDYpAwfPvznJUuWfN+1a9d/njFjxj9/+eWXN48ePfroGzdu/OnUqVMfmzZt+mYQBEEQBEEQbFKSkpJOKioqPZMnT75rwYIFPzVv3vynixcv/v78+fNfPnny5C+jR49+q76+/jNBCIIgCIIgCDZpxowZt3R0dLw9ceLEe/v37//09OnT5507d/7+tGnT7goKCpYEQRAEQRAEQbCZysrKFzExMVd0dXW95ebm/tXQ0LC1trb2pXbt2m3KysrOBEEQBEEQBEGwWePHj3+9fv36L7y9vU/p6+u7Jigo6K6kpOTy6NGjHwRBEARBEARBkFkLFy78vX79+u9OnTq1N2vWrN/v37//x8mTJ9/q0qXL79euXfsnQRAEQRAEQRBk1sCBAx81adLkR/Pnz/+8cuXK744ePfqhOXPmfFy3bt3N27dv/yMIgiAIgiAIgswyY8aMT0ePHn38+PHjH+zdu/dvZWVl/zR+/Pg7kyZN+m8QBEARBEARBEGTWsGHD6rVr125JSUnJtW7d+vf79+//8w8//PCb0aNHf3vo0KHtQRAEQRAEQRBkVkBAwL927dp/3bt375sHDx58y8mTJ3985syZV+fPn/8nEARAEARBEARBZpljx47dP3To0D+8vLwfHjx48Lfnz5//x8qVK28PHTp0f+vWrb8E/uP3/U+s0t/h0gL+k0W1m4U/3/eCIIgCIIgCFLw7bffvjN37txf/fXXX3/y+PHjP8ybN+/y9OnTR0FBQWcD3w3/o8yD/4/X7b3/L9gV3mEQBEGwuV28ePGf8+fPP+nLL7/8sXnz5r08dOjQW3/99ddfA98N/6PMg/+P12k7L4YgCIIgCFLwzTffvDBu3Lj/ffz48TePHDmytu7du1+8cePG/wa+G/5HmQf/H6/Tdl4MQRAEQRBChg8ffnfNmjUvTp48ed/Zs2e/27Nnzw/Dhw+/I/D9c/w/+L8k/LzTgiAIghQcMGDAPwKBv9l37Ngx5P7+7z/0c/wv2Hn/IwiCIPNq1KhR90tLSy+kpKTckZGRsTMyMjKmgO/O/w9+j4h/Fp1kEARBEAThF1avXv3+3r17Xztw4MBbhYWFc+PHj98f+K58/3W6+6M/yV5/3iMIgiDYzBITE78MDQ19kZaWdn9iYuKbwN34/007D4MgCIIgCCFffvnldydOnHj1/Pnzz3bu3PnjtGnTvjly5MgPgmwD3/O/4X/98M8TzX7e+z1/EwRBEARBkGWrVq36m3nz5j1ctWrV382ePfvHzz///Dc//fTTX7y8vLwZBLZg37lzp31PT8/6sWPHWtu2bWvp6uqaV1BQMElJSUkvLCx0p6Wlva2jowOE+6GhoUlFRUUf7OzsLDt06FBBQUHB/jPz05f2g4KCXtjb29sP8b1u+r1//75z//79j0wm88l27Nhh58yZM+Nnn332d7W1tV/x5ptvDt6/f//h+eefP/WBBx54oX379v/27NlzjG+//fYvW7du/Z2WlpaWlpY2Pnz4cNp3jH6+P3z48L7W1tZT2trarp2dndXo6Oi6bNmySklJSYkgyJbJycmT6Ojoa/r7+/+oqKhYm5iYuA9k3fR7+/btd+Xl5Z0/++yzd0eOHLmpr6/fn5eXN+rdd9/d3dnZ+ZMgW+LNN9+8tHbt2i/XrFmzW1ZWVmJ5efl777zzzod79ux5t7Ky0hAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQbB/w3+rG3uY1hJ5AAAAAElFTkSuQmCC';

export const Header: React.FC = () => {
  return (
    <header className="py-4 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="CMF Vision Logo" className="h-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                CMF Vision
              </h1>
              <p className="text-xs text-slate-600">
                제품의 새로운 색상, 소재, 마감을 즉시 시각화해보세요.
              </p>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Create</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Tutorial</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Library</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Price</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-slate-800 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
