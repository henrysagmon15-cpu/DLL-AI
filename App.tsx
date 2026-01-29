import React, { useState } from 'react';
import { DLLInput, GeneratedDLL } from './types';
import { generateDLLContent } from './services/geminiService';
import { DLLForm } from './components/DLLForm';
import { DLLPreview } from './components/DLLPreview';
import { Wand2, Loader2, Printer, ArrowLeft, FileText, ChevronDown, Copy, Check, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<DLLInput>({
    school: 'Villa Kananga Integrated School',
    gradeLevel: 'Grade 7',
    teacher: 'Henry Joshua E. Sagmon',
    teacherPosition: 'Teacher I',
    learningArea: 'Science',
    teachingDates: 'June 23-27, 2025',
    teachingTime: '1:00-1:45 PM',
    quarter: 'First',
    week: 'Week 1',
    checkerName: '',
    checkerDesignation: 'Master Teacher I / Department Head',
    competency: '', 
    contentStandard: '',
    performanceStandard: '',
    sources: 'Science 7 Learner\'s Material',
    customInstructions: '',
    lessonExemplar: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDLL, setGeneratedDLL] = useState<GeneratedDLL | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    const hasExemplar = formData.lessonExemplar.trim().length > 0 || !!formData.exemplarFile;
    const hasCompetency = formData.competency.trim().length > 0;

    if (!hasExemplar && !hasCompetency) {
      setError("Please provide either a Learning Competency or a Lesson Exemplar (Text or File).");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateDLLContent(formData);
      setGeneratedDLL(result);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError(
          <div className="space-y-2">
            <p className="font-bold">Missing Gemini API Key!</p>
            <p className="text-xs font-normal opacity-90">To fix this in Vercel:</p>
            <ol className="text-xs font-normal list-decimal list-inside opacity-90">
              <li>Go to your Vercel Project Settings</li>
              <li>Add an Environment Variable named <code className="bg-red-100 px-1 rounded">API_KEY</code></li>
              <li>Paste your Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold">AI Studio</a></li>
              <li><strong>Important:</strong> Trigger a new deployment (Redeploy) for the changes to take effect.</li>
            </ol>
          </div>
        );
      } else {
        setError(err.message || 'Failed to generate DLL. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const handleExportWord = () => {
    const contentArea = document.getElementById('dll-content-area');
    if (!contentArea) return;

    const styles = `
      <style>
        @page Section1 { 
          size: 11in 8.5in; 
          mso-page-orientation: landscape; 
          margin: 0.5in; 
        }
        div.Section1 { page: Section1; }
        table { border-collapse: collapse; width: 100%; border: 1pt solid black; mso-table-lspace:0pt; mso-table-rspace:0pt; }
        td, th { 
          border: 1pt solid black; 
          padding: 6pt; 
          font-family: 'Century Gothic', CenturyGothic, AppleGothic, sans-serif; 
          font-size: 8.5pt; 
          vertical-align: top; 
        }
        .header-bg { background-color: #5a6b7e !important; color: white !important; font-weight: bold; }
        .remarks-bg { background-color: #f59e0b !important; color: black !important; font-weight: bold; }
        .red-text { color: #dc2626 !important; font-weight: bold; }
        .bold-text { font-weight: bold; }
        ul, ol { margin-top: 0; margin-bottom: 0; padding-left: 15pt; }
        li { margin-bottom: 2pt; }
      </style>
    `;

    const clone = contentArea.cloneNode(true) as HTMLElement;
    
    clone.querySelectorAll('.bg-\\[\\#5a6b7e\\]').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '#5a6b7e';
      (el as HTMLElement).style.color = '#ffffff';
      (el as HTMLElement).style.fontWeight = 'bold';
    });
    clone.querySelectorAll('.bg-\\[\\#f59e0b\\]').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '#f59e0b';
      (el as HTMLElement).style.color = '#000000';
      (el as HTMLElement).style.fontWeight = 'bold';
    });
    clone.querySelectorAll('.text-red-600').forEach(el => {
      (el as HTMLElement).style.color = '#dc2626';
      (el as HTMLElement).style.fontWeight = 'bold';
    });

    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Daily Lesson Log</title>
        ${styles}
      </head>
      <body>
        <div class="Section1">
          ${clone.innerHTML}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DLL_${formData.learningArea}_${formData.week}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleCopyToClipboard = async () => {
    const contentArea = document.getElementById('dll-content-area');
    if (!contentArea) return;
    try {
      const blob = new Blob([contentArea.innerHTML], { type: 'text/html' });
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowExportMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50" style={{ fontFamily: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' }}>
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white text-center px-4">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-bold uppercase tracking-wider">VKIS DLL AI is Architecting your Lesson Log...</p>
          <p className="text-sm opacity-80 mt-2 text-center max-w-md">Villa Kananga Integrated School Daily Lesson Log AI is generating your pedagogical content.</p>
        </div>
      )}

      <header className="bg-indigo-700 text-white shadow no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold uppercase tracking-tight">Villa Kananga Integrated School DLL AI</h1>
          {generatedDLL && (
            <div className="flex gap-2">
              <button onClick={() => setGeneratedDLL(null)} className="px-4 py-2 bg-indigo-600 rounded text-sm font-bold flex items-center gap-2">
                <ArrowLeft size={16} /> Edit Data
              </button>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-4 py-2 bg-emerald-600 rounded text-sm font-bold flex items-center gap-2">
                  Export Log <ChevronDown size={16} />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-slate-700 rounded shadow-xl border border-slate-200 py-1 z-50">
                    <button onClick={handlePrintPDF} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2 font-medium">
                      <Printer size={16} /> Print / PDF
                    </button>
                    <button onClick={handleExportWord} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2 font-medium">
                      <FileText size={16} /> MS Word (.doc)
                    </button>
                    <button onClick={handleCopyToClipboard} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2 font-medium">
                      {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!generatedDLL ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <DLLForm formData={formData} setFormData={setFormData} />
            <button
              onClick={handleGenerate}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Wand2 size={20} /> Generate Daily Lesson Log
            </button>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex gap-3">
                <AlertCircle size={20} className="shrink-0 mt-1" />
                <div className="text-sm font-bold">{error}</div>
              </div>
            )}
          </div>
        ) : (
          <DLLPreview dll={generatedDLL} input={formData} />
        )}
      </main>
    </div>
  );
};

export default App;