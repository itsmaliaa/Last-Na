import React, { useState } from 'react';
import {
  Search,
  Eye,
  FileText,
  School,
  X,
  CheckCircle,
  MoreVertical,
} from 'lucide-react';
import { StudentUser } from '../../types';

interface AdminUsersStudentsViewProps {
  students: StudentUser[];
  filterStatus?: 'All' | 'Pending' | 'Verified';
  onApproveStudent: (id: string) => void;
  onRejectStudent: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminUsersStudentsView: React.FC<AdminUsersStudentsViewProps> = ({
  students,
  filterStatus = 'All',
  onApproveStudent,
  onRejectStudent,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  const filtered = students.filter((s) => {
    if (filterStatus === 'Pending' && s.status !== 'Pending') return false;
    if (filterStatus === 'Verified' && s.status !== 'Verified') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (student: StudentUser) => {
    onApproveStudent(student.id);
    setSelectedStudent(null);
    onShowToast('Student Approved', `${student.name} is now a verified CAFA student artist.`, 'success');
  };

  const handleReject = (student: StudentUser) => {
    onRejectStudent(student.id);
    setSelectedStudent(null);
    onShowToast('Student Rejected', `Verification for ${student.name} was rejected.`, 'error');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Input Bar (Exact match to Student.png) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student name, school number, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-neutral-50/80 border border-neutral-200 rounded-full focus:bg-white focus:outline-none focus:border-red-400"
          />
        </div>
      </div>

      {/* Student Cards Grid (Exact match to Student.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stu) => (
          <div
            key={stu.id}
            className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            {/* Top row with info icon */}
            <div className="flex items-start justify-between">
              <div className="w-18 h-18 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden border border-neutral-200/60">
                <svg
                  className="w-14 h-14 text-neutral-300 translate-y-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <button
                onClick={() => setSelectedStudent(stu)}
                className="p-1 text-neutral-400 hover:text-slate-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">{stu.name}</h4>
              <p className="text-xs text-neutral-500 font-mono">{stu.studentNumber}</p>
              <div className="pt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                    stu.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {stu.status}
                </span>
              </div>
            </div>

            {/* Review ID button */}
            <div className="pt-6">
              <button
                onClick={() => setSelectedStudent(stu)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-200/80 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-red-600" />
                <span>Review ID</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Student Credential Verification Modal (Exact match to Students 2.png) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <School className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Student Credential Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs">
              <div className="space-y-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Applicant:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Student Number:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStudent.studentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Course & Major:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedStudent.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Year Level:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.yearLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Official Email:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.email}</span>
                </div>
              </div>

              {/* Proof of Enrollment Document Preview Box (from Students 2.png) */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                  Proof of Enrollment Document Preview
                </div>
                <div className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{selectedStudent.documentName}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Registrar Stamp Detected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Reject, Approve Student, Close */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => handleReject(selectedStudent)}
                className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedStudent)}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Approve Student
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
