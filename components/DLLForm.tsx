
import React, { useRef } from 'react';
import { DLLInput } from '../types';
import { Upload, X, File as FileIcon, Image as ImageIcon, BookOpen, Sparkles, Info } from 'lucide-react';

interface Props {
  formData: DLLInput;
  setFormData: React.Dispatch<React.SetStateAction<DLLInput>>;
}

export const DLLForm: React.FC<Props> = ({ formData, setFormData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'exemplarFile' | 'logoFile') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFormData(prev => ({
          ...prev,
          [field]: {
            data: base64String,
            mimeType: file.type,
            name: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (field: 'exemplarFile' | 'logoFile') => {
    setFormData(prev => ({ ...prev, [field]: undefined }));
    if (field === 'exemplarFile' && fileInputRef.current) fileInputRef.current.value = '';
    if (field === 'logoFile' && logoInputRef.current) logoInputRef.current.value = '';
  };

  const inputClasses = "w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white text-sm";
  const labelClasses = "block text-xs font-bold text-slate-600 uppercase mb-1.5";

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm" style={{ fontFamily: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' }}>
      
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>School Name</label>
          <input name="school" value={formData.school} onChange={handleChange} className={inputClasses} placeholder="Enter school name" />
        </div>
        <div>
          <label className={labelClasses}>Teacher Name</label>
          <input name="teacher" value={formData.teacher} onChange={handleChange} className={inputClasses} placeholder="Enter teacher name" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClasses}>Grade Level</label>
          <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className={inputClasses}>
            {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="Kindergarten">Kindergarten</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}>Learning Area</label>
          <input name="learningArea" value={formData.learningArea} onChange={handleChange} className={inputClasses} placeholder="e.g. Science" />
        </div>
        <div>
          <label className={labelClasses}>Quarter & Week</label>
          <div className="flex gap-2">
            <input name="quarter" value={formData.quarter} onChange={handleChange} className={inputClasses} placeholder="Quarter" />
            <input name="week" value={formData.week} onChange={handleChange} className={inputClasses} placeholder="Week" />
          </div>
        </div>
      </div>

      {/* Exemplar Section (Highest Priority) */}
      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <BookOpen size={18} />
          <h3 className="text-sm font-bold uppercase tracking-tight">Lesson Exemplar / Reference Material</h3>
          <span className="ml-auto flex items-center gap-1 text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-700 font-bold">
            <Sparkles size={10} /> AUTO-EXTRACTION
          </span>
        </div>
        
        <p className="text-[11px] text-emerald-700/80 leading-relaxed italic">
          If provided, Gemini will extract the competencies, codes, and activities directly from your exemplar.
        </p>

        <textarea 
          name="lessonExemplar" 
          value={formData.lessonExemplar} 
          onChange={handleChange} 
          rows={4}
          className={`${inputClasses} border-emerald-200 placeholder:text-emerald-300 focus:ring-emerald-500`} 
          placeholder="Paste exemplar text here..."
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-200 rounded-lg p-3 hover:border-emerald-400 cursor-pointer flex items-center gap-3 bg-white transition-colors"
        >
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'exemplarFile')} className="hidden" accept=".pdf,.txt,image/*" />
          {formData.exemplarFile ? (
            <>
              <FileIcon size={20} className="text-emerald-500" />
              <span className="text-xs truncate flex-1 font-medium text-emerald-700">{formData.exemplarFile.name}</span>
              <button onClick={(e) => { e.stopPropagation(); removeFile('exemplarFile'); }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
            </>
          ) : (
            <>
              <Upload size={18} className="text-emerald-400" />
              <span className="text-xs text-emerald-600 font-medium">Attach Lesson Exemplar File</span>
            </>
          )}
        </div>
      </div>

      {/* Competency Input (Mandatory if no Exemplar) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-1.5">
          <label className={`${labelClasses} mb-0`}>Learning Competency</label>
          <div className="group relative">
            <Info size={12} className="text-slate-400 cursor-help" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50">
              Mandatory if no Exemplar is provided above. Gemini will build daily objectives (1-2) based on this.
            </div>
          </div>
        </div>
        <textarea 
          name="competency" 
          value={formData.competency} 
          onChange={handleChange} 
          rows={2}
          className={`${inputClasses} ${!formData.lessonExemplar && !formData.exemplarFile ? 'border-indigo-300 ring-1 ring-indigo-50' : 'border-slate-200'} font-medium`} 
          placeholder="e.g. Describe the components of a scientific investigation (S7MT-Ia-1)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <label className={labelClasses}>Designated Checker</label>
          <input name="checkerName" value={formData.checkerName} onChange={handleChange} className={inputClasses} placeholder="e.g. Maria Clara" />
        </div>
        <div>
          <label className={labelClasses}>Checker Designation</label>
          <input name="checkerDesignation" value={formData.checkerDesignation} onChange={handleChange} className={inputClasses} placeholder="e.g. Principal / Dept. Head" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>School Logo</label>
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-indigo-300 cursor-pointer flex items-center gap-3 bg-slate-50/50 transition-colors"
            >
              <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logoFile')} className="hidden" accept="image/*" />
              {formData.logoFile ? (
                <>
                  <ImageIcon size={20} className="text-indigo-500" />
                  <span className="text-xs truncate flex-1">{formData.logoFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFile('logoFile'); }}><X size={14} /></button>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">Upload Logo (Optional)</span>
                </>
              )}
            </div>
          </div>
          <div>
            <label className={labelClasses}>Resources / Sources</label>
            <textarea name="sources" value={formData.sources} onChange={handleChange} rows={2} className={inputClasses} placeholder="Textbooks, references..." />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Custom Instructions (AI Feedback)</label>
          <textarea name="customInstructions" value={formData.customInstructions} onChange={handleChange} rows={5} className={inputClasses} placeholder="e.g. Focus on group work, use localized examples..." />
        </div>
      </div>
    </div>
  );
};
