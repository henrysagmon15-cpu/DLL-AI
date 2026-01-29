
import React, { useRef } from 'react';
import { DLLInput } from '../types';
import { Upload, X, FileCheck, File as FileIcon, ShieldCheck, Image as ImageIcon } from 'lucide-react';

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

  const inputClasses = "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-slate-50";
  const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 mb-4">
        <label className={`${labelClasses} text-indigo-700 flex justify-between items-center`}>
          School / Department Logo
          <span className="text-[10px] lowercase font-normal italic">Optional (Defaults to DepEd Logo)</span>
        </label>
        <div 
          onClick={() => logoInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer flex items-center gap-4 ${
            formData.logoFile 
              ? 'border-indigo-200 bg-white shadow-sm' 
              : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-indigo-400'
          }`}
        >
          <input 
            type="file" 
            ref={logoInputRef} 
            onChange={(e) => handleFileChange(e, 'logoFile')} 
            className="hidden" 
            accept="image/*"
          />
          {formData.logoFile ? (
            <>
              <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                <img src={`data:${formData.logoFile.mimeType};base64,${formData.logoFile.data}`} alt="Logo Preview" className="h-full w-full object-contain" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{formData.logoFile.name}</p>
                <p className="text-[10px] text-indigo-600">Custom logo applied to DLL header</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile('logoFile'); }}
                className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="bg-slate-100 p-3 rounded-lg text-slate-400">
                <ImageIcon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">Upload School Logo</p>
                <p className="text-[10px] text-slate-400">Click to browse (PNG or JPG)</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>School Name</label>
          <input name="school" value={formData.school} onChange={handleChange} className={inputClasses} placeholder="Enter school name" />
        </div>
        <div>
          <label className={labelClasses}>Teacher Name</label>
          <input name="teacher" value={formData.teacher} onChange={handleChange} className={inputClasses} placeholder="Enter teacher name" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <input name="learningArea" value={formData.learningArea} onChange={handleChange} className={inputClasses} placeholder="e.g. Science, Math, English" />
        </div>
        <div>
          <label className={labelClasses}>Quarter / Week</label>
          <div className="flex gap-2">
            <input name="quarter" value={formData.quarter} onChange={handleChange} className={inputClasses} placeholder="Quarter" />
            <input name="week" value={formData.week} onChange={handleChange} className={inputClasses} placeholder="Week" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Teaching Dates</label>
          <input name="teachingDates" value={formData.teachingDates} onChange={handleChange} className={inputClasses} placeholder="e.g. October 12-16, 2024" />
        </div>
        <div>
          <label className={labelClasses}>Teaching Time / Schedule</label>
          <input name="teachingTime" value={formData.teachingTime} onChange={handleChange} className={inputClasses} placeholder="e.g. 7:30 - 8:30 AM" />
        </div>
      </div>

      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <ShieldCheck size={18} className="text-indigo-600" /> Approvals & Checking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Designated Checker Name</label>
            <input name="checkerName" value={formData.checkerName} onChange={handleChange} className={inputClasses} placeholder="e.g. Master Teacher Name" />
          </div>
          <div>
            <label className={labelClasses}>Checker Designation</label>
            <input name="checkerDesignation" value={formData.checkerDesignation} onChange={handleChange} className={inputClasses} placeholder="e.g. Master Teacher I / Dept Head" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Learning Competency / Description</label>
          <textarea 
            name="competency" 
            value={formData.competency} 
            onChange={handleChange} 
            rows={4}
            className={inputClasses} 
            placeholder="Paste the official K-12 competency here..."
          />
        </div>
        <div>
          <label className={`${labelClasses} text-indigo-700 flex justify-between items-center`}>
            Lesson Exemplar (Upload or Paste)
            {formData.exemplarFile && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FileCheck size={10} /> File Attached
              </span>
            )}
          </label>
          
          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                formData.exemplarFile 
                  ? 'border-emerald-200 bg-emerald-50/30' 
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileChange(e, 'exemplarFile')} 
                className="hidden" 
                accept=".pdf,.txt,image/*"
              />
              
              {formData.exemplarFile ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <FileIcon size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-emerald-800 truncate">{formData.exemplarFile.name}</p>
                    <p className="text-[10px] text-emerald-600">Exemplar reference loaded</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile('exemplarFile'); }}
                    className="p-1.5 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="text-slate-400 group-hover:text-indigo-500" size={24} />
                  <p className="text-xs font-medium text-slate-500">Upload Exemplar (PDF, Image, or Text)</p>
                  <p className="text-[10px] text-slate-400">Drag and drop or click to browse</p>
                </>
              )}
            </div>

            {!formData.exemplarFile && (
              <textarea 
                name="lessonExemplar" 
                value={formData.lessonExemplar} 
                onChange={handleChange} 
                rows={3}
                className={`${inputClasses} border-indigo-100 bg-indigo-50/50 text-xs`} 
                placeholder="...or paste exemplar text directly here"
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Learning Resources / Sources</label>
        <textarea 
          name="sources" 
          value={formData.sources} 
          onChange={handleChange} 
          rows={2}
          className={inputClasses} 
          placeholder="Textbooks, modules, websites..."
        />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <label className={`${labelClasses} text-indigo-600`}>Custom Instructions / Specific prompts</label>
        <textarea 
          name="customInstructions" 
          value={formData.customInstructions} 
          onChange={handleChange} 
          rows={3}
          className={`${inputClasses} border-indigo-100 bg-indigo-50/30 focus:bg-white`} 
          placeholder="e.g. 'Make it more hands-on', 'Include local scenarios from my community', 'Focus on 21st-century skills'..."
        />
      </div>
    </div>
  );
};
