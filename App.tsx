
import React, { useState } from 'react';
import { DLLInput, GeneratedDLL } from './types';
import { generateDLLContent } from './services/geminiService';
import { DLLForm } from './components/DLLForm';
import { DLLPreview } from './components/DLLPreview';
import { Wand2, Loader2, Printer, ArrowLeft, FileText, ChevronDown, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<DLLInput>({
    school: 'Villa Kananga Integrated School',
    gradeLevel: 'Grade 7',
    teacher: 'Henry Joshua E. Sagmon',
    learningArea: 'Science',
    teachingDates: 'June 23-27, 2025',
    teachingTime: '1:00-1:45 PM / 2:30-3:15 PM',
    quarter: 'First',
    week: 'Week 1',
    checkerName: '',
    checkerDesignation: 'Master Teacher I / Department Head',
    competency: 'The learners should be able to describe the components of a scientific investigation (S7MT-Ia-1)',
    sources: 'Chemistry III Textbook, Science Links Worktext',
    customInstructions: '',
    lessonExemplar: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDLL, setGeneratedDLL] = useState<GeneratedDLL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateDLLContent(formData);
      setGeneratedDLL(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate DLL. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const getDocStyles = () => `
    <style>
      @page Section1 { 
        size: 11in 8.5in; 
        mso-page-orientation: landscape; 
        margin: 0.5in 0.5in 0.5in 0.5in; 
      }
      div.Section1 { page: Section1; }
      body { font-family: 'Century Gothic', CenturyGothic, AppleGothic, sans-serif !important; }
      table { border-collapse: collapse; width: 100%; border: 1pt solid black; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      td, th { border: 1pt solid black; padding: 4pt; font-family: 'Century Gothic', CenturyGothic, AppleGothic, sans-serif !important; font-size: 8pt; vertical-align: top; }
      thead { display: table-header-group; background-color: #5a6b7e; }
      thead th { color: white !important; font-weight: bold; text-align: center; text-transform: uppercase; }
      .bg-slate-600 { background-color: #5a6b7e; color: white; }
      .text-red-600 { color: #dc2626; font-weight: bold; }
      .font-bold { font-weight: bold; }
      .uppercase { text-transform: uppercase; }
      .italic { font-style: italic; }
      .text-slate-600 { color: #475569; }
      ul, ol { margin-top: 2pt; margin-bottom: 2pt; padding-left: 12pt; }
      p { margin: 0; padding: 0; }
      img.dll-logo-img { 
        width: 45pt !important; 
        height: 45pt !important; 
        display: block; 
        margin: auto;
      }
      .flex { display: table; width: 100%; }
      .flex > div { display: table-cell; vertical-align: middle; }
    </style>
  `;

  const handleExportWord = () => {
    const content = document.getElementById('dll-content-area')?.innerHTML;
    if (!content) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Daily Lesson Log</title>
      ${getDocStyles()}
      </head><body><div class="Section1">
    `;
    const footer = "</div></body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DLL_${formData.learningArea}_${formData.week}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleCopyToClipboard = async () => {
    const contentArea = document.getElementById('dll-content-area');
    if (!contentArea) return;

    const styles = getDocStyles();
    const htmlContent = `<html><head>${styles}</head><body>${contentArea.innerHTML}</body></html>`;

    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      await navigator.clipboard.write(data);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Failed to copy: ', err);
      const range = document.createRange();
      range.selectNode(contentArea);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-indigo-700 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Wand2 className="text-indigo-700 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gemini DLL Architect</h1>
              <p className="text-indigo-100 text-sm opacity-90">Professional K-12 Lesson Planning AI</p>
            </div>
          </div>
          
          {generatedDLL && (
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setGeneratedDLL(null)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all shadow-sm font-medium"
              >
                <ArrowLeft size={18} /> New Draft
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all shadow-sm font-bold border border-emerald-500/50"
                >
                  Export Options <ChevronDown size={18} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden py-1 ring-4 ring-black ring-opacity-5">
                    <button 
                      onClick={handlePrintPDF}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 transition-colors"
                    >
                      <Printer size={18} className="text-emerald-600" /> Export as PDF (Print)
                    </button>
                    <button 
                      onClick={handleExportWord}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 transition-colors"
                    >
                      <FileText size={18} className="text-blue-600" /> Export as Word (.doc)
                    </button>
                    <button 
                      onClick={handleCopyToClipboard}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      {copySuccess ? (
                        <>
                          <Check size={18} className="text-green-500" /> 
                          <span className="text-green-600 font-medium">Copied Table!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} className="text-indigo-600" /> Copy Table (High Fidelity)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {!generatedDLL ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                  <FileText className="text-slate-400 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-slate-800">Lesson Metadata</h2>
                </div>
                <div className="p-6">
                  <DLLForm formData={formData} setFormData={setFormData} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 sticky top-8 shadow-sm">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <Wand2 size={18} /> How it works
                </h3>
                <ul className="text-sm text-indigo-800 space-y-3 list-disc pl-4 opacity-90">
                  <li>Fill out your basic school details.</li>
                  <li>Provide <strong>Lesson Exemplars</strong> to guide the AI's content logic.</li>
                  <li>AI generates a full 5-day cycle based on your competency.</li>
                  <li>Actual <strong>quizzes, activities, and questions</strong> are generated.</li>
                  <li>Formatted precisely for the <strong>DepEd DLL Template</strong>.</li>
                </ul>

                <button
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className={`mt-8 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                    isGenerating 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 ring-2 ring-indigo-300 ring-offset-2'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" /> Generating DLL...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} /> Generate Weekly Log
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DLLPreview dll={generatedDLL} input={formData} />
          </div>
        )}
      </main>

      <footer className="mt-12 py-8 text-center text-slate-500 text-sm no-print border-t border-slate-200">
        <p className="font-medium">© {new Date().getFullYear()} Gemini DLL Architect • Tailored for DepEd Excellence</p>
      </footer>
    </div>
  );
};

export default App;
