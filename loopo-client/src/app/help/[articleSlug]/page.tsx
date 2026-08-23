'use client';

import React, { use } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ articleSlug: string }>;
}

export default function HelpArticlePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const articleSlug = resolvedParams.articleSlug;
  const dispatch = useAppDispatch();

  const title = articleSlug.replace(/-/g, ' ').toUpperCase();

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <Link
            href={ROUTES.HELP}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Help Center</span>
          </Link>

          <h1 className="text-2xl font-black text-slate-900 capitalize">{title}</h1>

          <div className="prose prose-slate text-xs leading-relaxed space-y-3 font-medium text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p>
              Welcome to the Loopo Help Center article for <strong>{title}</strong>. This guide explains best practices, step-by-step instructions, and safety precautions.
            </p>
            <h4 className="font-bold text-slate-800 text-sm">Key Instructions:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Always communicate with buyers and sellers through official Loopo chat messages.</li>
              <li>Inspect physical items in a safe public location before completing transactions.</li>
              <li>Never share OTP codes, banking credentials, or personal passwords.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Was this article helpful?</span>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(showToast('Thanks for your feedback!'))}
                className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-slate-600"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(showToast('Thanks for your feedback!'))}
                className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-600"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
