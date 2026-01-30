import React from 'react';
import { GeneratedDLL, DLLInput } from '../types';

interface Props {
  dll: GeneratedDLL;
  input: DLLInput;
}

export const DLLPreview: React.FC<Props> = ({ dll, input }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  
  const renderContent = (content: string | string[], isObjectives = false, isAnswerKey = false) => {
    if (!content) return null;
    let rawString = Array.isArray(content) ? content.join('\n') : content;
    
    if (!rawString.includes('\n') && /\d+[\.\)]/.test(rawString)) {
       rawString = rawString.replace(/(\s)(\d+[\.\)])/g, '\n$2');
    }

    const lines = rawString.split(/\r?\n/).map(l => l.trim()).filter(line => line.length > 0);
    const baseTextClass = isAnswerKey ? "text-[9px] italic text-slate-600" : "text-[10px]";

    if (lines.length <= 1) {
      return <p className={`whitespace-pre-wrap ${baseTextClass}`}>{rawString}</p>;
    }

    const isNumbered = lines.some(l => /^\d+[\.\)]/.test(l)) || lines.some(l => /^[a-z][\.\)]/i.test(l));

    if (isNumbered) {
      return (
        <ol className={`list-decimal list-outside pl-5 space-y-1 ${baseTextClass}`}>
          {lines.map((line, idx) => {
            const cleanLine = line
              .replace(/^\d+[\.\)]\s*/, '')
              .replace(/^[a-z][\.\)]\s*/i, '')
              .replace(/^[\-\*\•\+]\s*/, '')
              .trim();
            return <li key={idx} className="leading-tight pl-1">{cleanLine}</li>;
          })}
        </ol>
      );
    }

    return (
      <ul className={`${isObjectives ? 'list-disc' : 'list-none'} list-outside pl-5 space-y-1 ${baseTextClass}`}>
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[\-\*\•\+]\s*/, '').trim();
          return <li key={idx} className="leading-tight pl-1">{cleanLine}</li>;
        })}
      </ul>
    );
  };

  const ProcedureRow = ({ label, dayKey }: { label: React.ReactNode, dayKey: keyof typeof dll.dailyPlans.monday }) => (
    <tr>
      <td className="w-[180px] font-medium bg-white text-[10px] border border-black p-2">{label}</td>
      {days.map(day => (
        <td key={day} className="border border-black p-2 align-top">
          {renderContent(dll.dailyPlans[day][dayKey] as string)}
          {dayKey === 'evaluation' && dll.dailyPlans[day].answerKey && (
            <div className="mt-2 pt-2 border-t border-dotted border-black">
              <span className="text-[9px] font-bold uppercase block mb-1">Answer Key:</span>
              {renderContent(dll.dailyPlans[day].answerKey, false, true)}
            </div>
          )}
        </td>
      ))}
    </tr>
  );

  const logoSrc = input.logoFile 
    ? `data:${input.logoFile.mimeType};base64,${input.logoFile.data}`
    : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Department_of_Education_of_the_Philippines.svg/600px-Department_of_Education_of_the_Philippines.svg.png";

  const fontStack = '"Century Gothic", CenturyGothic, AppleGothic, sans-serif';

  return (
    <div className="bg-white p-4 sm:p-8 shadow-2xl mx-auto max-w-[1400px]" id="dll-content-area" style={{ fontFamily: fontStack }}>
      {/* Header Table */}
      <table className="w-full dll-table mb-0 border-collapse">
        <tbody>
          <tr>
            <td rowSpan={3} className="w-[320px] border border-black p-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={logoSrc} 
                    alt="Logo" 
                    width="60"
                    height="60"
                    className="dll-logo-img object-contain"
                    style={{ width: '60px', height: '60px' }}
                  />
                </div>
                <div className="text-left font-bold leading-tight">
                  <div className="text-[12px]">GRADES 1 to 12</div>
                  <div className="text-[12px]">DAILY LESSON LOG</div>
                </div>
              </div>
            </td>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] w-40 border border-black p-1.5">School:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">{input.school}</td>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] w-40 border border-black p-1.5">Grade Level:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">{input.gradeLevel}</td>
          </tr>
          <tr>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] border border-black p-1.5">Teacher:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">{input.teacher}</td>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] border border-black p-1.5">Learning Area:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">{input.learningArea}</td>
          </tr>
          <tr>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] border border-black p-1.5 leading-tight">Teaching Dates and<br />Time:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">
              {input.teachingDates} | {input.week} | {input.teachingTime}
            </td>
            <td className="bg-[#5a6b7e] text-white font-bold text-[11px] border border-black p-1.5">Quarter:</td>
            <td className="text-[11px] border border-black p-1.5 font-bold">{input.quarter}</td>
          </tr>
        </tbody>
      </table>

      {/* Main Content Table */}
      <table className="w-full dll-table border-collapse mt-[-1px]">
        <thead className="bg-[#5a6b7e] text-white">
          <tr>
            <th className="w-[180px] border border-black p-1.5"></th>
            {days.map(d => <th key={d} className="text-[11px] uppercase font-bold py-1.5 border border-black text-center">{d.toUpperCase()}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="text-[11px] font-bold py-1.5 uppercase border border-black pl-2">I. OBJECTIVES</td>
            <td colSpan={5} className="border border-black bg-slate-50"></td>
          </tr>
          <tr>
            <td className="w-[180px] font-medium text-[10px] border border-black p-2">A. Content Standard</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{dll.contentStandards}</td>
          </tr>
          <tr>
            <td className="w-[180px] font-medium text-[10px] border border-black p-2">B. Performance Standard</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{dll.performanceStandards}</td>
          </tr>
          <tr>
            <td className="w-[180px] font-medium text-[10px] border border-black p-2 leading-tight">
              C. Learning Competencies /<br />
              Objectives <span className="text-red-600 font-bold">(Indicate the<br />code)</span>
            </td>
            {days.map(day => (
              <td key={day} className="text-[10px] border border-black p-2">
                <div className="font-bold mb-1">{dll.dailyPlans[day].competencyDesc}</div>
                <div className="text-red-600 font-bold mb-1">{dll.dailyPlans[day].competencyCode}</div>
                <div className="mt-1 border-t border-slate-100 pt-1">
                  {renderContent(dll.dailyPlans[day].objectives, true)}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td className="text-[11px] font-bold py-1.5 uppercase border border-black pl-2">II. CONTENT</td>
            {days.map(day => (
              <td key={day} className="text-[10px] font-bold border border-black p-2">{dll.dailyPlans[day].topic}</td>
            ))}
          </tr>

          <tr className="bg-white">
            <td className="text-[11px] font-bold py-1.5 uppercase border border-black pl-2">III. LEARNING RESOURCES</td>
            <td colSpan={5} className="border border-black bg-slate-50"></td>
          </tr>
          <tr>
            <td className="text-[10px] font-medium border border-black p-2">A. References</td>
            {days.map(d => <td key={d} className="border border-black"></td>)}
          </tr>
          <tr>
            <td className="pl-6 text-[10px] border border-black p-2">1. Teacher's Guide pages</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{dll.references.teacherGuide}</td>
          </tr>
          <tr>
            <td className="pl-6 text-[10px] border border-black p-2">2. Learner's Materials pages</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{dll.references.learnerMaterial}</td>
          </tr>
          <tr>
            <td className="pl-6 text-[10px] border border-black p-2">3. Textbook pages</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{renderContent(dll.references.textbook)}</td>
          </tr>
          <tr>
            <td className="pl-6 text-[10px] border border-black p-2 leading-tight">
              4. Additional Materials from<br />Learning Resource (LR)<br />Portal
            </td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{renderContent(dll.references.additionalResources)}</td>
          </tr>
          <tr>
            <td className="text-[10px] font-medium border border-black p-2">B. Other Learning Resources</td>
            <td colSpan={5} className="text-[10px] border border-black p-2">{dll.references.otherResources}</td>
          </tr>

          <tr className="bg-white">
            <td className="text-[11px] font-bold py-1.5 uppercase border border-black pl-2">IV. PROCEDURES</td>
            <td colSpan={5} className="border border-black bg-slate-50"></td>
          </tr>
          <ProcedureRow label={<>A. Reviewing previous lesson<br />or presenting the new<br />lesson</>} dayKey="review" />
          <ProcedureRow label={<>B. Establishing a purpose for<br />the lesson</>} dayKey="purpose" />
          <ProcedureRow label={<>C. Presenting<br />Examples/Instances of<br />new lesson</>} dayKey="examples" />
          <ProcedureRow label={<>D. Discussing new concepts<br />and practicing new skills<br />#1</>} dayKey="discussion1" />
          <ProcedureRow label={<>E. Discussing new concepts<br />and practicing new skills<br />#2</>} dayKey="discussion2" />
          <ProcedureRow label={<>F. Developing mastery<br /><span className="text-red-600 font-bold">(Leads to Formative<br />Assessment)</span></>} dayKey="mastery" />
          <ProcedureRow label={<>G. Finding practical<br />applications of concepts<br />and skills in daily living</>} dayKey="application" />
          <ProcedureRow label={<>H. Making generalizations<br />and abstractions about<br />the lesson</>} dayKey="generalization" />
          <ProcedureRow label="I. Evaluating Learning" dayKey="evaluation" />
          <ProcedureRow label={<>J. Additional activities for<br />application and<br />remediation</>} dayKey="remediation" />

          <tr className="bg-[#f59e0b] text-black font-bold border border-black">
            <td className="text-[11px] py-1.5 uppercase border border-black pl-2">V. REMARKS</td>
            {days.map(day => (
              <td key={day} className="text-[10px] border border-black p-2 align-top bg-white font-normal">
                {renderContent(dll.dailyPlans[day].remarks)}
              </td>
            ))}
          </tr>

          <tr className="bg-white">
            <td className="text-[11px] font-bold py-1.5 uppercase border border-black pl-2">VI. REFLECTION</td>
            <td colSpan={5} className="border border-black bg-slate-50"></td>
          </tr>
          {[
            "A. No. of learners who earned 80% on the formative assessment", 
            "B. No. of learners who require additional activities for remediation who scored below 80%", 
            "C. Did the remedial lessons work? No. of learners who have caught up with the lesson", 
            "D. No. of learners who continue to require remediation", 
            "E. Which of my teaching strategies worked well? Why did this work?", 
            "F. What difficulties did I encounter which my principal or supervisor can help me solve?", 
            "G. What innovation or localized materials did I use/discover which I wish to share with other teachers?"
          ].map((refLabel) => (
            <tr key={refLabel}>
              <td className="text-[10px] border border-black p-2 leading-tight">{refLabel}</td>
              {days.map(d => <td key={d} className="border border-black p-2"></td>)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="mt-16 flex justify-between px-16 text-[12px]">
        <div className="w-[240px]">
          <p className="mb-12 font-normal">Prepared by:</p>
          <div className="border-b border-black w-full mb-1"></div>
          <p className="font-bold uppercase tracking-tight">{input.teacher}</p>
          <p className="text-[10px] font-normal">{input.teacherPosition}</p>
        </div>
        
        {input.checkerName && (
          <div className="w-[240px] text-right">
            <p className="mb-12 font-normal text-left ml-auto w-full">Checked by:</p>
            <div className="border-b border-black w-full mb-1 ml-auto"></div>
            <p className="font-bold uppercase tracking-tight text-right">{input.checkerName}</p>
            <p className="text-[10px] font-normal text-right">{input.checkerDesignation}</p>
          </div>
        )}
      </div>
    </div>
  );
};