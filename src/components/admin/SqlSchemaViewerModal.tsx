import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Check, Database, Terminal, FileCode } from 'lucide-react';
import { api } from '../../services/api';

interface SqlSchemaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaViewerModal: React.FC<SqlSchemaViewerModalProps> = ({ isOpen, onClose }) => {
  const [schemaText, setSchemaText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getSqlSchema()
        .then(res => setSchemaText(res.schema))
        .catch(err => console.warn(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([schemaText], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecommerce.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-black/5 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-xl text-neutral-900">
                  MySQL Relational Database Schema
                </h3>
                <span className="text-[11px] font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                  ecommerce.sql
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ready for XAMPP, phpMyAdmin, MySQL Workbench, and Node.js
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sql</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* XAMPP / MySQL Quick Setup Guide */}
        <div className="px-6 py-3 bg-[#F9F9F8] border-b border-black/5 text-xs text-neutral-600 shrink-0 flex flex-wrap items-center gap-4">
          <span className="font-semibold text-neutral-800">XAMPP Setup:</span>
          <span>1. Start Apache & MySQL in XAMPP</span>
          <span>·</span>
          <span>2. Open http://localhost/phpmyadmin</span>
          <span>·</span>
          <span>3. Click 'Import' & select this file</span>
        </div>

        {/* SQL Code Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 font-mono text-xs text-neutral-200 leading-relaxed selection:bg-neutral-700">
          {loading ? (
            <div className="text-neutral-500 py-10 text-center">Loading SQL Schema file...</div>
          ) : (
            <pre className="whitespace-pre-wrap">{schemaText}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
