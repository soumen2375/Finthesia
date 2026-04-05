import React from 'react';
import { ShieldAlert, BookOpen, Key, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">fin</span>
            <span className="text-2xl font-black text-[#27C4E1]">thesia</span>
            <span className="ml-4 text-sm font-semibold text-slate-500 uppercase tracking-widest border-l-2 border-slate-200 pl-4">API Documentation</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/settings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Developer Settings</Link>
            <Link to="/dashboard" className="text-sm font-semibold text-white bg-[#27C4E1] hover:bg-[#1EB0CC] px-4 py-2 rounded-lg transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">Finthesia API Reference</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Integrate Finthesia directly into your own applications. Use our API to sync transactions, generate budgets, read your unified ledger, and orchestrate automated financial workflows securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <Key className="w-8 h-8 text-[#27C4E1] mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Authentication</h3>
            <p className="text-sm text-slate-600">Generate personal access tokens in Settings &gt; Developer. Provide them in the Authorization header as Bearer tokens.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <Terminal className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">REST API endpoints</h3>
            <p className="text-sm text-slate-600">Access RESTful resources for Transactions, Budgets, Ledger entries, and more over secure HTTPS channels.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <ShieldAlert className="w-8 h-8 text-indigo-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Rate Limits & Security</h3>
            <p className="text-sm text-slate-600">Requests are limited to 100 per minute per token. All payloads use standard JSON representation.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen size={20} /> Endpoints</h2>
          </div>
          <div className="p-0">
            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="w-32 shrink-0">
                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-md text-sm font-mono">GET</span>
              </div>
              <div className="flex-1">
                <p className="font-mono text-slate-800 font-bold mb-1">/v1/transactions</p>
                <p className="text-sm text-slate-600">List all your transactions. Supports pagination (limit, offset) and date constraints.</p>
              </div>
            </div>
            
            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="w-32 shrink-0">
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-md text-sm font-mono">POST</span>
              </div>
              <div className="flex-1">
                <p className="font-mono text-slate-800 font-bold mb-1">/v1/transactions</p>
                <p className="text-sm text-slate-600">Create a new transaction with automatic ledger synchronization and category classification.</p>
              </div>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-4 md:items-center bg-slate-50/50">
              <div className="w-32 shrink-0">
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-md text-sm font-mono">DELETE</span>
              </div>
              <div className="flex-1">
                <p className="font-mono text-slate-800 font-bold mb-1">/v1/account</p>
                <p className="text-sm text-slate-600">Permanently delete your account and all associated data. Immediate cascade revocation.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
