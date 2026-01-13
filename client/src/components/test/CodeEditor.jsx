import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    IoPlay,
    IoSend,
    IoCode,
} from 'react-icons/io5';
import toast from 'react-hot-toast';

// Syntax highlighting colors (VS Code Dark+ theme)
const syntaxColors = {
    keyword: '#569cd6',      // blue
    string: '#ce9178',       // orange
    number: '#b5cea8',       // light green
    comment: '#6a9955',      // green
    function: '#dcdcaa',     // yellow
    variable: '#9cdcfe',     // light blue
    operator: '#d4d4d4',     // white
    bracket: '#ffd700',      // gold
    type: '#4ec9b0',         // cyan
};

// Language keywords for highlighting
const languageKeywords = {
    python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'print', 'input', 'range', 'len', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple', 'break', 'continue', 'pass', 'global', 'nonlocal', 'assert', 'yield', 'raise', 'del'],
    javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'from', 'class', 'extends', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'console', 'log', 'break', 'continue', 'switch', 'case', 'default', 'delete', 'in', 'of', 'void', 'yield'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'short', 'byte', 'char', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'null', 'true', 'false', 'instanceof', 'abstract', 'synchronized', 'volatile'],
    cpp: ['int', 'float', 'double', 'char', 'bool', 'void', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'struct', 'class', 'public', 'private', 'protected', 'virtual', 'override', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'new', 'delete', 'nullptr', 'true', 'false', 'try', 'catch', 'throw', 'template', 'typename', 'namespace', 'using', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'cout', 'cin', 'endl', 'vector', 'string', 'auto'],
};

// Apply syntax highlighting to code
const highlightCode = (code, language) => {
    if (!code) return '';

    const keywords = languageKeywords[language] || languageKeywords.python;
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Comments (single line)
    if (language === 'python') {
        highlighted = highlighted.replace(/(#.*)$/gm, `<span style="color:${syntaxColors.comment}">$1</span>`);
    } else {
        highlighted = highlighted.replace(/(\/\/.*)$/gm, `<span style="color:${syntaxColors.comment}">$1</span>`);
    }

    // Strings (double and single quotes)
    highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*")/g, `<span style="color:${syntaxColors.string}">$1</span>`);
    highlighted = highlighted.replace(/('(?:[^'\\]|\\.)*')/g, `<span style="color:${syntaxColors.string}">$1</span>`);

    // Template literals for JS
    if (language === 'javascript') {
        highlighted = highlighted.replace(/(`(?:[^`\\]|\\.)*`)/g, `<span style="color:${syntaxColors.string}">$1</span>`);
    }

    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, `<span style="color:${syntaxColors.number}">$1</span>`);

    // Keywords
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span style="color:${syntaxColors.keyword}">$1</span>`);
    });

    // Brackets
    highlighted = highlighted.replace(/([{}[\]()])/g, `<span style="color:${syntaxColors.bracket}">$1</span>`);

    return highlighted;
};

const CodeEditor = ({
    code,
    onChange,
    language = 'python',
    onRun,
    onSubmit,
    running = false,
    submitting = false,
    output = '',
    testResults = null,
    disabled = false,
}) => {
    const [lineNumbers, setLineNumbers] = useState([1]);
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);

    useEffect(() => {
        const lines = (code || '').split('\n').length;
        setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
    }, [code]);

    // Sync scroll between textarea and highlight
    const handleScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Block copy/paste
    const handleCopy = (e) => {
        e.preventDefault();
        toast.error('Copy is disabled during the test');
    };

    const handlePaste = (e) => {
        e.preventDefault();
        toast.error('Paste is disabled during the test');
    };

    const handleCut = (e) => {
        e.preventDefault();
        toast.error('Cut is disabled during the test');
    };

    // Handle tab key for indentation
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            onChange(newCode);
            // Set cursor position after the tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-primary-700">
                    <IoCode className="inline mr-2" />
                    Your Code
                </label>
            </div>

            {/* Editor Container */}
            <div className="relative rounded-lg overflow-hidden border border-gray-700 h-80">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 overflow-hidden select-none z-10">
                    <div className="text-right pr-2 pt-3 font-mono text-sm text-gray-500">
                        {lineNumbers.map(num => (
                            <div key={num} className="leading-6 h-6">{num}</div>
                        ))}
                    </div>
                </div>

                {/* Syntax Highlighted Display (behind textarea) */}
                <div
                    ref={highlightRef}
                    className="absolute left-12 top-0 right-0 bottom-0 p-3 font-mono text-sm overflow-hidden pointer-events-none whitespace-pre"
                    style={{
                        color: syntaxColors.variable,
                        backgroundColor: '#1e1e1e',
                        lineHeight: '1.5rem',
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightCode(code, language) || '<span style="color:#6a6a6a">// Write your code here...</span>' }}
                />

                {/* Actual Textarea (transparent, on top for input) */}
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                    onCut={handleCut}
                    className="absolute left-12 top-0 right-0 bottom-0 p-3 font-mono text-sm resize-none outline-none caret-white"
                    style={{
                        color: 'transparent',
                        backgroundColor: 'transparent',
                        lineHeight: '1.5rem',
                        caretColor: 'white',
                    }}
                    placeholder=""
                    spellCheck={false}
                    disabled={disabled}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={onRun}
                    disabled={running || !code.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                >
                    <IoPlay />
                    {running ? 'Running...' : 'Run Code'}
                </button>
                <button
                    onClick={onSubmit}
                    disabled={submitting || !code.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                >
                    <IoSend />
                    {submitting ? 'Submitting...' : 'Submit Code'}
                </button>
            </div>

            {/* Output Panel */}
            {(output || testResults) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                >
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                        Output
                    </label>

                    {testResults ? (
                        <div className="space-y-2">
                            {testResults.map((result, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg ${result.passed ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                            Test Case {i + 1}: {result.passed ? '✓ Passed' : '✗ Failed'}
                                        </span>
                                        {result.executionTime && (
                                            <span className="text-xs text-gray-400">
                                                {result.executionTime}ms
                                            </span>
                                        )}
                                    </div>
                                    {!result.passed && result.expectedOutput !== undefined && (
                                        <div className="text-sm text-gray-300 mt-2">
                                            <div>Expected: <code className="text-green-400">{result.expectedOutput}</code></div>
                                            <div>Got: <code className="text-red-400">{result.actualOutput || '(empty)'}</code></div>
                                        </div>
                                    )}
                                    {result.error && (
                                        <div className="text-sm text-red-400 mt-1">
                                            Error: {result.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-48">
                            {output || 'No output yet'}
                        </pre>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default CodeEditor;
