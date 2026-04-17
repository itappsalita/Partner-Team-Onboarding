"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Modal from "./Modal";

interface TeamManagementProps {
  assignment: any; // dataTeamPartner object
  onClose: () => void;
}

export default function TeamManagement({ assignment, onClose }: TeamManagementProps) {
  const { data: session } = useSession() as any;
  const userRole = (session?.user as any)?.role;
  const isPartner = userRole === "PARTNER";
  const isSuperAdmin = userRole === "SUPERADMIN";
  
  // Structural changes (Edit Team/Add Member) are locked if Completed/Canceled
  const isStructuralReadOnly = (!isPartner && !isSuperAdmin) || 
                               assignment.status === 'COMPLETED' || 
                               assignment.status === 'CANCELED';
                     
  const isCanceled = assignment.status === 'CANCELED';

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [memberPage, setMemberPage] = useState(1);
  const membersPerPage = 10;
  
  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  
  // Form States
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [teamForm, setTeamForm] = useState({
    id: null as string | null,
    teamNumber: "",
    leaderName: "",
    leaderPhone: "",
    tkpk1Number: "",
    tkpk1File: null as File | null,
    firstAidNumber: "",
    firstAidFile: null as File | null,
    electricalNumber: "",
    electricalFile: null as File | null,
    position: "Team Leader",
    location: ""
  });

  const [memberForm, setMemberForm] = useState({
    nik: "",
    phone: "",
    ktpFile: null as File | null,
    selfieFile: null as File | null,
  });

  // OCR & Wizard States
  const [memberStep, setMemberStep] = useState(1); // 1: Scan, 2: Form
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data-team/teams?dataTeamPartnerId=${assignment.id}`);
      const data = await res.json();
      setTeams(data);
      if (data.length > 0 && !activeTeam) {
        setActiveTeam(data[0]);
      } else if (activeTeam) {
        const updatedActive = data.find((t: any) => t.id === activeTeam.id);
        if (updatedActive) setActiveTeam(updatedActive);
      }
    } catch (err) {
      console.error("Fetch teams error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [assignment.id]);

  // Reset member page when active team changes
  useEffect(() => {
    setMemberPage(1);
  }, [activeTeam?.id]);

  const openAddTeamModal = () => {
    setIsEditMode(false);
    setTeamForm({
      id: null,
      teamNumber: (teams.length + 1).toString(),
      leaderName: "",
      leaderPhone: "",
      tkpk1Number: "",
      tkpk1File: null,
      firstAidNumber: "",
      firstAidFile: null,
      electricalNumber: "",
      electricalFile: null,
      position: "Team Leader",
      location: assignment.request ? `${assignment.request.provinsi}, ${assignment.request.area}` : ""
    });
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (team: any) => {
    setIsEditMode(true);
    setTeamForm({
      id: team.id,
      teamNumber: team.teamNumber.toString(),
      leaderName: team.leaderName || "",
      leaderPhone: team.leaderPhone || "",
      tkpk1Number: team.tkpk1Number || "",
      tkpk1File: null,
      firstAidNumber: team.firstAidNumber || "",
      firstAidFile: null,
      electricalNumber: team.electricalNumber || "",
      electricalFile: null,
      position: team.position || "Team Leader",
      location: team.location || ""
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStructuralReadOnly) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (isEditMode && teamForm.id) {
        formData.append("id", teamForm.id.toString());
      }
      formData.append("dataTeamPartnerId", assignment.id.toString());
      formData.append("teamNumber", teamForm.teamNumber);
      formData.append("leaderName", teamForm.leaderName);
      formData.append("leaderPhone", teamForm.leaderPhone);
      formData.append("tkpk1Number", teamForm.tkpk1Number);
      formData.append("position", teamForm.position);
      formData.append("location", teamForm.location);
      formData.append("firstAidNumber", teamForm.firstAidNumber);
      formData.append("electricalNumber", teamForm.electricalNumber);
      
      if (teamForm.tkpk1File) formData.append("tkpk1File", teamForm.tkpk1File);
      if (teamForm.firstAidFile) formData.append("firstAidFile", teamForm.firstAidFile);
      if (teamForm.electricalFile) formData.append("electricalFile", teamForm.electricalFile);
      
      const url = "/api/data-team/teams";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
      });

      if (res.ok) {
        setIsTeamModalOpen(false);
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan tim");
      }
    } catch (err) {
      alert("Sistem error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOcrScan = async () => {
    if (!memberForm.ktpFile) return;
    setIsScanning(true);
    setOcrProgress(0);
    setOcrError(null);

    let scanSuccess = false;

    try {
      const formData = new FormData();
      formData.append("image", memberForm.ktpFile);

      const res = await fetch("/api/ocr/ktp-ai", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setOcrError("Batas penggunaan AI tercapai (Quota Exceeded). Silakan isi data secara manual.");
          setMemberStep(2); // Immediate fallback if quota hit
          return;
        }
        throw new Error(data.error || "Gagal menghubungi layanan AI");
      }

      setMemberForm(prev => ({
        ...prev,
        nik: data.nik || prev.nik,
        name: (data.name || prev.name).toUpperCase().trim()
      }));
      
      scanSuccess = true;
    } catch (err: any) {
      console.error("AI OCR Error:", err);
      if (!ocrError) {
        setOcrError("Gagal memproses KTP via AI. Silakan isi manual.");
      }
      setMemberStep(2); 
    } finally {
      if (scanSuccess) {
        // Animation 0 -> 100 in exactly 1 second
        const startTime = Date.now();
        const duration = 1000;
        
        const animate = async () => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
              setOcrProgress(progress);
              
              if (progress >= 100) {
                clearInterval(interval);
                resolve();
              }
            }, 16); // ~60fps
          });
        };
        
        await animate();
        await new Promise(r => setTimeout(r, 300)); // Small pause at 100% for feeling
        setMemberStep(2);
      }
      setIsScanning(false);
    }
  };

  const handleKtpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setMemberForm({ ...memberForm, ktpFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setKtpPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setMemberForm({ ...memberForm, selfieFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setSelfiePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || isStructuralReadOnly) return;
    
    // NIK Validation
    if (memberForm.nik.length !== 16) {
      alert("NIK KTP harus berjumlah tepat 16 digit.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("teamId", activeTeam.id.toString());
      formData.append("memberNumber", (activeTeam.members?.length + 1 || 1).toString());
      formData.append("name", memberForm.name);
      formData.append("position", memberForm.position);
      formData.append("nik", memberForm.nik);
      formData.append("phone", memberForm.phone);
      if (memberForm.ktpFile) formData.append("ktpFile", memberForm.ktpFile);
      if (memberForm.selfieFile) formData.append("selfieFile", memberForm.selfieFile);

      const res = await fetch("/api/data-team/members", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsMemberModalOpen(false);
        setMemberForm({ name: "", position: "", nik: "", phone: "", ktpFile: null, selfieFile: null });
        setSelfiePreview(null);
        setKtpPreview(null);
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah anggota");
      }
    } catch (err) {
      alert("Sistem error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, isCertified: boolean) => {
    const action = isCertified ? "menonaktifkan" : "menghapus";
    if (!confirm(`Apakah Anda yakin ingin ${action} anggota ini?`)) return;

    try {
      const res = await fetch(`/api/data-team/members/${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.error || `Gagal ${action} anggota`);
      }
    } catch (err) {
      alert("Sistem error.");
    }
  };

  const executeRequestTraining = async () => {
    if (!activeTeam || isStructuralReadOnly) return;
    
    // Validasi Ekstra
    if (!activeTeam.leaderName || !activeTeam.tkpk1Number || !activeTeam.members || activeTeam.members.length === 0) {
      alert("Syarat Minimal belum terpenuhi: Pastikan Leader terisi, Nomor TKPK1 terisi, dan minimal ada 1 anggota.");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengajukan QA Training untuk Tim #${activeTeam.teamNumber}? Sertifikat TKPK1 dan data identitas akan diuji.`)) return;

    setRequesting(activeTeam.id);
    try {
      const res = await fetch("/api/qa-training/request", {
        method: "POST",
        body: JSON.stringify({ teamId: activeTeam.id }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        alert("Berhasil! Jadwal training diajukan untuk Tim #" + activeTeam.teamNumber);
        fetchTeams();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengajukan training");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setRequesting(null);
    }
  };

  const isTeamValidToRequest = activeTeam && 
                               activeTeam.leaderName && 
                               activeTeam.tkpk1Number && 
                               activeTeam.members && 
                               activeTeam.members.filter((m: any) => m.isActive === 1).length > 0;

  return (
    <div className="flex flex-col h-[90vh] lg:h-[85vh] bg-alita-white rounded-xl shadow-2xl border border-alita-gray-100 overflow-hidden">
      {/* Container Header */}
      <header className="px-6 py-5 bg-alita-black text-alita-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-[1.25rem] font-bold text-alita-orange leading-tight">Kelola Tim Lapangan</h2>
          <p className="text-[0.8rem] text-alita-gray-400 mt-1 flex items-center gap-3">
            <span>Penugasan: <strong className="text-alita-white font-semibold">{assignment.request?.sowPekerjaan || "N/A"}</strong></span>
            {isStructuralReadOnly && <span className="px-2 py-0.5 bg-alita-orange text-alita-white rounded text-[10px] font-bold tracking-widest">READ ONLY</span>}
          </p>
        </div>
        <button onClick={onClose} className="text-3xl font-light text-alita-white hover:text-alita-orange transition-colors">&times;</button>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar Tim (Desktop: Samping, Mobile: Atas/Carousel) */}
        <aside className="w-full lg:w-[280px] border-b lg:border-r border-alita-gray-100 bg-alita-gray-50/50 flex flex-col pt-4 lg:pt-6 shrink-0">
          <div className="px-5 mb-2 lg:mb-4 border-b lg:border-b-0 border-alita-gray-100 pb-2 lg:pb-0">
            <h3 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] text-alita-gray-400">Daftar Tim Lapangan</h3>
          </div>
          <div className="flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto px-4 pb-4 lg:pb-6 custom-scrollbar flex gap-3 lg:gap-0 lg:space-y-3">
            {teams.map(t => (
              <div 
                key={t.id} 
                onClick={() => setActiveTeam(t)}
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 shrink-0 w-[180px] lg:w-full ${
                  activeTeam?.id === t.id 
                    ? 'bg-alita-orange text-alita-white border-alita-orange shadow-[0_8px_20px_rgba(255,122,0,0.2)] scale-[1.02]' 
                    : 'bg-alita-white text-alita-black border-alita-gray-100 hover:border-alita-gray-300 shadow-sm'
                } ${!t.leaderName ? 'border-dashed' : ''}`}
              >
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTeam?.id === t.id ? 'text-alita-white/80' : 'text-alita-gray-400'}`}>
                        {t.displayId || `Tim #${t.teamNumber}`}
                     </span>
                     <span className="text-sm font-black tracking-tight">#{t.teamNumber}</span>
                  </div>
                  <div className={`text-[0.85rem] font-bold truncate ${activeTeam?.id === t.id ? 'text-alita-white' : 'text-alita-black'}`}>
                    {t.leaderName || <span className={`${activeTeam?.id === t.id ? 'text-alita-white/60 italic' : 'text-alita-orange'}`}>⚠️ Lengkapi Data</span>}
                  </div>
                </div>
              ))}
              
            </div>
        </aside>

        {/* Detail Tim & Anggota */}
        <main className="flex-1 overflow-y-auto bg-alita-white flex flex-col">
          {activeTeam ? (
            <div className="flex flex-col h-full">
              {/* Banner for CANCELED or COMPLETED status */}
              {isCanceled && (
                <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-3 animate-pulse">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">PENUGASAN DIBATALKAN - SELURUH DATA TERKUNCI</span>
                </div>
              )}
              {assignment.status === 'COMPLETED' && (
                <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">PROSES SELESAI - DATA TERKUNCI</span>
                </div>
              )}

              <div className="p-4 lg:p-8">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-alita-gray-100 pb-8 mb-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-alita-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-alita-gray-100">👤</div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 lg:gap-3 mb-2">
                        <h2 className="text-xl lg:text-2xl font-black text-alita-black tracking-tight leading-none">{activeTeam.leaderName || "Data Belum Lengkap"}</h2>
                        <span className={`px-2 py-0.5 lg:px-2.5 lg:py-1 text-[8px] lg:text-[9px] font-black uppercase tracking-wider rounded border ${
                            activeTeam.status === 'SOURCING' ? 'bg-alita-gray-100 border-alita-gray-200 text-alita-gray-600' :
                            activeTeam.status === 'WAIT_SCHEDULE_TRAINING' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                            activeTeam.status === 'TRAINING_SCHEDULED' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                            activeTeam.status === 'TRAINING_EVALUATED' ? 'bg-green-50 border-green-200 text-green-600' :
                            'bg-alita-gray-100 border-alita-gray-200 text-alita-gray-600'
                          }`}>
                          {(activeTeam.status || "SOURCING").replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-alita-gray-500 font-medium">
                        <span className="px-2 py-0.5 bg-alita-gray-100 rounded text-[10px] font-bold uppercase text-alita-gray-600">Leader</span>
                        {activeTeam.leaderPhone && <span>• {activeTeam.leaderPhone}</span>}
                        {activeTeam.location && <span>• {activeTeam.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {!isStructuralReadOnly && (
                      <button 
                        onClick={() => openEditTeamModal(activeTeam)}
                        className="px-4 py-2 bg-alita-white border border-alita-gray-200 rounded-lg text-[11px] font-bold text-alita-gray-600 hover:bg-alita-gray-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        ✏️ EDIT DATA TIM
                      </button>
                    )}
                    {(isPartner || userRole === 'PMO_OPS' || userRole === 'SUPERADMIN') && (!activeTeam.status || activeTeam.status === 'SOURCING') && !isCanceled && (
                      <button 
                        onClick={executeRequestTraining}
                        disabled={!isTeamValidToRequest || requesting === activeTeam.id}
                        title={!isTeamValidToRequest ? "Nomor TKPK1, Nama Leader, dan minimal 1 Anggota wajib diisi sebelum mengajukan Training." : ""}
                        className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                          isTeamValidToRequest 
                            ? 'bg-alita-black text-alita-white hover:bg-alita-gray-800 cursor-pointer'
                            : 'bg-alita-gray-100 text-alita-gray-400 cursor-not-allowed opacity-70 border border-alita-gray-300'
                        }`}
                      >
                        {requesting === activeTeam.id ? (
                          <span className="animate-pulse italic">PROCESSING...</span>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            AJUKAN TRAINING
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-2 items-center lg:items-end w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                  {activeTeam.tkpk1Number ? (
                    <a 
                      href={activeTeam.tkpk1FilePath || "#"} 
                      target="_blank" 
                      className="inline-flex items-center gap-2 px-3 py-2 bg-alita-black text-alita-white rounded-lg text-[11px] font-bold shadow-sm hover:brightness-125 transition-all"
                    >
                      <span>📜 TKPK1: {activeTeam.tkpk1Number}</span>
                      <span className="text-[10px] opacity-60">↗️</span>
                    </a>
                  ) : (
                    <div className="px-3 py-2 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-[11px] font-bold flex items-center gap-2">
                       ⚠️ NO TKPK1
                    </div>
                  )}

                  {activeTeam.firstAidNumber && (
                    <a 
                      href={activeTeam.firstAidFilePath || "#"} 
                      target="_blank" 
                      className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-colors"
                    >
                      First Aid: {activeTeam.firstAidNumber} ↗️
                    </a>
                  )}

                  {activeTeam.electricalNumber && (
                    <a 
                      href={activeTeam.electricalFilePath || "#"} 
                      target="_blank" 
                      className="px-3 py-2 bg-green-50 text-green-700 border border-green-100 rounded-lg text-[11px] font-bold hover:bg-green-100 transition-colors inline-block text-center w-full"
                    >
                      Elec: {activeTeam.electricalNumber} ↗️
                    </a>
                  )}
                  {isPartner && activeTeam.status !== 'SOURCING' && activeTeam.status && (
                    <div className="mt-1 w-full text-center px-3 py-2 rounded-lg text-[9px] font-black text-alita-gray-400 bg-alita-gray-50 border border-alita-gray-200 border-dashed shrink-0 min-w-[150px] lg:min-w-0">
                      LOCKED (IN PROGRESS)
                    </div>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg lg:text-[1.1rem] font-black text-alita-black tracking-tight">Anggota Tim</h3>
                  <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-alita-gray-400">Total: {activeTeam.members?.filter((m: any) => m.isActive === 1).length || 0} Aktif</p>
                </div>
                 {!isStructuralReadOnly && (
                  <div className="flex items-center gap-2 lg:gap-3">
                    <span className="hidden md:block text-[10px] font-black text-alita-gray-400 uppercase tracking-widest bg-alita-gray-50 px-3 py-1.5 rounded-lg border border-alita-gray-100 italic">
                      Limit: {assignment.request?.membersPerTeam || 0}
                    </span>
                    <button 
                      onClick={() => setIsMemberModalOpen(true)}
                      disabled={!activeTeam.leaderName || ((activeTeam.members?.filter((m: any) => m.isActive === 1).length || 0) >= (assignment.request?.membersPerTeam || 0))}
                      className="px-4 lg:px-5 py-2 lg:py-2.5 bg-alita-black text-alita-white rounded-lg text-[10px] lg:text-xs font-bold hover:bg-alita-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    >
                      { ((activeTeam.members?.filter((m: any) => m.isActive === 1).length || 0) >= (assignment.request?.membersPerTeam || 0)) 
                        ? "Kuota Penuh" 
                        : "+ Tambah Anggota" 
                      }
                    </button>
                  </div>
                )}
              </div>
              
              {!activeTeam.leaderName && (
                 <div className="bg-alita-orange/5 border border-alita-orange/20 p-8 rounded-2xl text-center mb-8">
                    <p className="text-alita-orange font-bold text-sm">Silakan lengkapi informasi Team Leader terlebih dahulu sebelum menambah anggota.</p>
                 </div>
              )}

               {/* Members Table with Pagination & Scroll */}
               <div className="bg-alita-white border border-alita-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                 <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
                   <table className="w-full border-collapse min-w-[900px]">
                     <thead className="sticky top-0 z-10 bg-alita-gray-50 uppercase">
                       <tr>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">#</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Nomor</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Nama & NIK</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Selfie</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Posisi</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Training</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Akses Sistem</th>
                         <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">KTP</th>
                         {(!isCanceled && (isPartner || isSuperAdmin)) && (
                           <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-widest text-alita-gray-400 border-b border-alita-gray-100">Aksi</th>
                         )}
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-alita-gray-50">
                       {(() => {
                         const activeMembers = activeTeam.members?.filter((m: any) => m.isActive === 1) || [];
                         const indexOfLast = memberPage * membersPerPage;
                         const indexOfFirst = indexOfLast - membersPerPage;
                         const currentMembers = activeMembers.slice(indexOfFirst, indexOfLast);
                         
                         if (currentMembers.length === 0) {
                            return <tr><td colSpan={isStructuralReadOnly ? 7 : 8} className="px-5 py-16 text-center text-alita-gray-300 font-bold text-sm tracking-tight italic">Belum ada anggota tim terdaftar.</td></tr>;
                         }

                         return currentMembers.map((m: any, idx: number) => (
                           <tr key={m.id} className="hover:bg-alita-gray-50/50 transition-colors">
                             <td className="px-5 py-5 text-xs font-black text-alita-gray-400">{indexOfFirst + idx + 1}</td>
                             <td className="px-5 py-5 text-xs font-bold text-alita-gray-400">#{m.displayId}</td>
                             <td className="px-5 py-5">
                               <div className="font-bold text-alita-black text-sm mb-1">{m.name}</div>
                               <div className="text-[10px] font-black text-alita-gray-400 tracking-wider">NIK: {m.nik}</div>
                             </td>
                             <td className="px-5 py-5">
                               {m.selfieFilePath ? (
                                 <a href={m.selfieFilePath} target="_blank" className="text-[11px] font-bold text-alita-orange hover:underline">Lihat Foto</a>
                               ) : (
                                 <span className="text-[10px] italic font-bold text-alita-gray-300 uppercase tracking-widest">No Photo</span>
                               )}
                             </td>
                             <td className="px-5 py-5">
                                <span className="px-2 py-1 bg-alita-gray-100 rounded text-[9px] font-black uppercase text-alita-gray-600 border border-alita-gray-200">{m.position}</span>
                             </td>
                             <td className="px-5 py-5">
                               <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                 m.isAttendedTraining === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                               }`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${m.isAttendedTraining === 1 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                 {m.isAttendedTraining === 1 ? 'Trained' : 'Untrained'}
                               </div>
                             </td>
                             <td className="px-5 py-5 min-w-[200px]">
                               {(m.alitaExtEmail || m.certificateFilePath) ? (
                                 <div className="flex flex-col gap-3">
                                   <div className="space-y-1.5">
                                     {m.alitaExtEmail && (
                                       <div className="flex items-center gap-2 overflow-hidden" title="Email Eksternal / Pribadi">
                                         <svg className="w-3 h-3 text-alita-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                         <span className="text-[11px] font-bold text-alita-gray-500 truncate italic">{m.alitaExtEmail}</span>
                                       </div>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-2 pt-2.5 border-t border-alita-gray-50">
                                     <button 
                                       onClick={() => {
                                         if (m.alitaEmailPassword) {
                                           navigator.clipboard.writeText(m.alitaEmailPassword);
                                           alert("Password berhasil disalin ke clipboard!");
                                         } else {
                                           alert("Data password belum tersedia.");
                                         }
                                       }}
                                       title="Klik untuk Salin Password Akses Email"
                                       className="flex items-center gap-2 px-2.5 py-1.5 bg-alita-white border border-alita-gray-200 rounded-lg text-alita-gray-400 hover:text-alita-orange hover:border-alita-orange transition-all shadow-sm group"
                                     >
                                       <svg className="w-3 h-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                       <span className="text-[8px] font-black uppercase tracking-widest text-alita-gray-400">PWD</span>
                                     </button>
                                     {m.certificateFilePath && (
                                       <a 
                                         href={m.certificateFilePath} 
                                         target="_blank"
                                         title="Klik untuk Buka Sertifikat Kelulusan Anggota"
                                         className="flex items-center gap-2 px-2.5 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-alita-orange hover:bg-alita-orange hover:text-alita-white transition-all shadow-sm group"
                                       >
                                         <svg className="w-3 h-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                         <span className="text-[8px] font-black uppercase tracking-widest">CERT</span>
                                       </a>
                                     )}
                                   </div>
                                 </div>
                               ) : (
                                 <span className="inline-flex items-center px-2 py-1 rounded-md bg-alita-gray-50 text-[9px] font-black text-alita-gray-300 uppercase tracking-widest border border-alita-gray-100 italic">Pending P&C</span>
                               )}
                             </td>
                             <td className="px-5 py-5">
                               <a href={m.ktpFilePath} target="_blank" className="text-[11px] font-bold text-alita-orange hover:underline">Lihat File</a>
                             </td>
                           {(!isCanceled && (isPartner || isSuperAdmin)) && (
                             <td className="px-5 py-5 text-center">
                               {(!m.certificateFilePath && !isStructuralReadOnly) || (m.certificateFilePath) ? (
                                 <button 
                                   onClick={() => handleDeleteMember(m.id, !!m.certificateFilePath)}
                                   className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm active:scale-95 mx-auto ${
                                     m.certificateFilePath 
                                       ? 'bg-alita-gray-50 text-alita-gray-400 hover:bg-alita-gray-100' 
                                       : 'bg-red-50 text-red-500 border border-red-50 hover:bg-red-100'
                                   }`}
                                 >
                                   {m.certificateFilePath ? (
                                     <>
                                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                       <span>Deactivate</span>
                                     </>
                                   ) : (
                                     <>
                                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                       <span>Delete</span>
                                     </>
                                   )}
                                 </button>
                               ) : (
                                 <span className="text-[8px] font-black text-alita-gray-300 uppercase">Locked</span>
                               )}
                             </td>
                           )}
                           </tr>
                         ));
                       })()}
                     </tbody>
                   </table>
                 </div>

                 {/* Modal Member Pagination Footer */}
                 {activeTeam.members?.filter((m: any) => m.isActive === 1).length > membersPerPage && (
                   <div className="px-5 py-3 bg-alita-gray-50 border-t border-alita-gray-100 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-alita-gray-401 uppercase">Halaman {memberPage} dari {Math.ceil((activeTeam.members?.filter((m: any) => m.isActive === 1).length || 0) / membersPerPage)}</span>
                     <div className="flex gap-2">
                        <button 
                          disabled={memberPage === 1}
                          onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1 bg-alita-white border border-alita-gray-200 rounded-lg text-[10px] font-black text-alita-gray-400 hover:text-alita-black disabled:opacity-30 transition-all uppercase"
                        >Prev</button>
                        <button 
                          disabled={memberPage >= Math.ceil((activeTeam.members?.filter((m: any) => m.isActive === 1).length || 0) / membersPerPage)}
                          onClick={() => setMemberPage(p => p + 1)}
                          className="px-3 py-1 bg-alita-white border border-alita-gray-200 rounded-lg text-[10px] font-black text-alita-gray-400 hover:text-alita-black disabled:opacity-30 transition-all uppercase"
                        >Next</button>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-alita-gray-200">
              <div className="text-7xl mb-6 opacity-30 select-none">🏗️</div>
              <h3 className="text-lg font-black tracking-tight text-alita-gray-300">Tim Belum Dipilih</h3>
              <p className="text-sm font-bold text-alita-gray-300/60 max-w-[280px] text-center mt-2 leading-relaxed">Silakan pilih tim dari panel sebelah kiri atau buat tim baru.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tambah/Edit Tim */}
      <Modal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        title={isEditMode ? "Edit Data Tim Lapangan" : "Buat Tim Lapangan Baru"}
      >
        <form onSubmit={handleSaveTeam} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="md:col-span-1">
               <label className="block text-xs font-black text-alita-gray-400 uppercase tracking-[0.1em] mb-2">No Tim</label>
               <input type="number" className="w-full px-4 py-3 bg-alita-gray-50 border border-alita-gray-200 rounded-xl text-sm font-bold disabled:opacity-50" value={teamForm.teamNumber} onChange={e => setTeamForm({...teamForm, teamNumber: e.target.value})} required disabled={isEditMode} />
             </div>
             <div className="md:col-span-3">
               <label className="block text-xs font-black text-alita-gray-400 uppercase tracking-[0.1em] mb-2">Nama Team Leader</label>
               <input type="text" className="w-full px-4 py-3 bg-alita-gray-50 border border-alita-gray-200 rounded-xl text-sm font-bold" value={teamForm.leaderName} onChange={e => setTeamForm({...teamForm, leaderName: e.target.value})} required placeholder="Masukkan nama lengkap leader" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-alita-gray-400 uppercase tracking-[0.1em] mb-2">No Handphone Leader</label>
              <input type="text" className="w-full px-4 py-3 bg-alita-gray-50 border border-alita-gray-200 rounded-xl text-sm font-bold" value={teamForm.leaderPhone} onChange={e => setTeamForm({...teamForm, leaderPhone: e.target.value})} required placeholder="Contoh: 081234567890" />
            </div>
            <div>
              <label className="block text-xs font-black text-alita-gray-400 uppercase tracking-[0.1em] mb-2">Posisi</label>
              <input type="text" className="w-full px-4 py-3 bg-alita-gray-100 border border-alita-gray-200 rounded-xl text-sm font-bold text-alita-gray-500 cursor-not-allowed" value={teamForm.position} disabled />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-alita-gray-400 uppercase tracking-[0.1em] mb-2">Lokasi Penugasan</label>
            <input type="text" className="w-full px-4 py-3 bg-alita-gray-100 border border-alita-gray-200 rounded-xl text-sm font-bold text-alita-gray-500 cursor-not-allowed" value={teamForm.location} disabled />
          </div>

          <div className="border-2 border-alita-gray-50 rounded-2xl p-6 bg-alita-gray-50/30">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-alita-gray-400 mb-5 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-alita-gray-200"></span>
              Sertifikat Keahlian
            </h4>
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-alita-black mb-2 tracking-tight">Nomor Sertifikat TKPK 1</label>
                <input type="text" className="w-full px-4 py-3 bg-alita-white border border-alita-gray-200 rounded-xl text-sm font-bold shadow-sm focus:border-alita-orange transition-colors" value={teamForm.tkpk1Number} onChange={e => setTeamForm({...teamForm, tkpk1Number: e.target.value})} required placeholder="Input Nomor Sertifikat" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-alita-black mb-2 tracking-tight">File Sertifikat TKPK 1 (PDF/JPG)</label>
                <div className="flex flex-col gap-2">
                   {isEditMode && activeTeam?.tkpk1FilePath && <p className="text-[10px] font-bold text-alita-orange italic">Sudah ada file. Unggah baru untuk mengganti.</p>}
                   <input type="file" className="block w-full text-xs text-alita-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-alita-black file:text-alita-white hover:file:bg-alita-orange file:transition-colors" onChange={e => setTeamForm({...teamForm, tkpk1File: e.target.files?.[0] || null})} required={!isEditMode && !activeTeam?.tkpk1FilePath} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-alita-gray-100 mt-6">
                 <div>
                    <label className="block text-[11px] font-bold text-alita-black mb-2">No. First Aid (Opsional)</label>
                    <input type="text" className="w-full px-4 py-2 bg-alita-white border border-alita-gray-200 rounded-lg text-sm font-bold mb-2 shadow-sm" value={teamForm.firstAidNumber} onChange={e => setTeamForm({...teamForm, firstAidNumber: e.target.value})} />
                    <input type="file" className="block w-full text-[10px] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-alita-gray-100 italic" onChange={e => setTeamForm({...teamForm, firstAidFile: e.target.files?.[0] || null})} />
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold text-alita-black mb-2">No. Electrical (Opsional)</label>
                    <input type="text" className="w-full px-4 py-2 bg-alita-white border border-alita-gray-200 rounded-lg text-sm font-bold mb-2 shadow-sm" value={teamForm.electricalNumber} onChange={e => setTeamForm({...teamForm, electricalNumber: e.target.value})} />
                    <input type="file" className="block w-full text-[10px] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-alita-gray-100 italic" onChange={e => setTeamForm({...teamForm, electricalFile: e.target.files?.[0] || null})} />
                 </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-gradient-to-br from-alita-orange to-alita-orange-dark text-alita-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-orange hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50" disabled={submitting}>
            {submitting ? "Proses Menyimpan..." : isEditMode ? "Perbarui Data Tim" : "Simpan Tim Baru"}
          </button>
        </form>
      </Modal>

      {/* Modal Tambah Anggota (Wizard OCR) */}
      <Modal 
        isOpen={isMemberModalOpen} 
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberStep(1);
          setKtpPreview(null);
          setSelfiePreview(null);
          setMemberForm({ name: "", position: "", nik: "", phone: "", ktpFile: null, selfieFile: null });
        }} 
        title={memberStep === 1 ? "Pindai KTP Anggota Baru" : "Detail Data Anggota"}
      >
        {memberStep === 1 ? (
          <div className="flex flex-col items-center">
            <div className="w-full relative group">
              <div 
                className={`w-full aspect-[1.58/1] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  ktpPreview ? 'border-alita-orange bg-alita-gray-50' : 'border-alita-gray-200 bg-alita-gray-50 hover:bg-alita-gray-100'
                }`}
              >
                {ktpPreview ? (
                  <div className="w-full h-full p-2">
                    <img src={ktpPreview} alt="KTP Preview" className="w-full h-full object-contain rounded-xl" />
                    {isScanning && (
                      <div className="absolute inset-0 bg-alita-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-alita-white z-10">
                        <div className="w-12 h-12 border-4 border-alita-orange/20 border-l-alita-orange rounded-full animate-spin mb-4" />
                        <p className="font-black text-xs tracking-widest animate-pulse">PROSES SCANNING... {ocrProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-8 group-hover:scale-105 transition-transform">
                    <div className="text-6xl mb-4 group-hover:rotate-6 transition-transform">🪪</div>
                    <p className="text-sm font-black text-alita-black tracking-tight mb-2">Unggah Foto KTP</p>
                    <p className="text-xs font-bold text-alita-gray-400">Ekstrak data NIK & Nama secara otomatis</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleKtpFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>

            <p className="mt-6 text-[10px] font-bold text-alita-gray-400 text-center leading-relaxed">
              * Pastikan pencahayaan cukup dan teks pada KTP terlihat jelas agar sistem AI dapat membaca dengan akurat.
            </p>

            <div className="w-full mt-8">
              <button 
                onClick={handleOcrScan}
                disabled={!memberForm.ktpFile || isScanning}
                className="w-full py-4 bg-alita-black text-alita-white rounded-xl text-xs font-black tracking-[0.2em] hover:bg-alita-gray-800 disabled:opacity-30 disabled:grayscale transition-all shadow-xl uppercase"
              >
                {isScanning ? "SCANNING..." : "MULAI PINDAI KTP"}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-alita-gray-400">Powered by</span>
                <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-red-500">Google AI</span>
              </div>
            </div>
            {ocrError && <p className="mt-4 text-[11px] font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">{ocrError}</p>}
          </div>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
              <span className="text-xl">✨</span>
              <p className="text-[11px] font-bold text-blue-800 leading-normal">
                Verifikasi data di bawah ini. Pastikan Nama dan NIK sesuai dengan kartu identitas personil. Jika data tidak sesuai, silakan klik tombol Kembali untuk mengulang pindaian KTP.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-alita-gray-400 tracking-[0.1em] uppercase mb-2">Nama Lengkap (Sesuai KTP)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-alita-gray-100/50 border border-alita-gray-200 rounded-xl text-sm font-bold cursor-not-allowed select-none text-alita-gray-500" 
                  value={memberForm.name} 
                  readOnly 
                  required 
                  title="Data terkunci sesuai hasil pindaian AI KTP"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-alita-gray-400 tracking-[0.1em] uppercase mb-2">NIK KTP (16 Digit)</label>
                   <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-alita-gray-100/50 border border-alita-gray-200 rounded-xl text-sm font-bold cursor-not-allowed select-none text-alita-gray-500" 
                    value={memberForm.nik} 
                    readOnly 
                    required 
                    title="Data terkunci sesuai hasil pindaian AI KTP"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-alita-gray-400 tracking-[0.1em] uppercase mb-2">Nomor WhatsApp</label>
                  <input type="text" className="w-full px-4 py-3 bg-alita-gray-50 border border-alita-gray-200 rounded-xl text-sm font-bold focus:border-alita-orange transition-colors" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} required placeholder="0812xxxx" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-alita-gray-400 tracking-[0.1em] uppercase mb-2">Target Posisi Pekerjaan</label>
                <select 
                  className="w-full px-4 py-3 bg-alita-gray-50 border border-alita-gray-200 rounded-xl text-sm font-bold focus:border-alita-orange transition-colors" 
                  value={memberForm.position} 
                  onChange={e => setMemberForm({...memberForm, position: e.target.value})} 
                  required
                >
                  <option value="">-- Pilih Posisi --</option>
                  <option value="Technician">Technician</option>
                  <option value="Helper">Helper</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>

              {/* Selfie Upload Section */}
              <div className="border-2 border-dashed border-alita-gray-200 rounded-2xl p-6 bg-alita-gray-50/50 hover:bg-alita-gray-100/50 transition-all relative group">
                <div className="flex flex-col items-center text-center">
                  {selfiePreview ? (
                    <div className="relative w-24 h-24 mb-3">
                      <img src={selfiePreview} alt="Selfie Preview" className="w-full h-full object-cover rounded-xl border-2 border-alita-orange shadow-md" />
                      <div className="absolute -top-2 -right-2 bg-alita-orange text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg">✓</div>
                    </div>
                  ) : (
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🤳</div>
                  )}
                  <p className="text-[11px] font-black text-alita-black tracking-tight mb-1">Upload Foto Selfie Anggota</p>
                  <p className="text-[9px] font-bold text-alita-gray-400 uppercase tracking-widest">Wajib untuk verifikasi identitas</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleSelfieFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {memberForm.ktpFile && (
                <div className="flex items-center gap-4 bg-alita-gray-50 border border-alita-gray-100 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-alita-white rounded flex items-center justify-center text-lg border border-alita-gray-200 shadow-sm">📄</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[11px] font-black text-alita-black truncate uppercase">{memberForm.ktpFile.name}</div>
                    <div className="text-[9px] font-bold text-alita-gray-400 tracking-wider">FILE KTP TERUNGGAH</div>
                  </div>
                  <button type="button" onClick={() => setMemberStep(1)} className="text-[10px] font-black text-alita-orange hover:brightness-90 uppercase">Ganti File</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
               <button type="button" className="col-span-1 py-3.5 border-2 border-alita-gray-50 rounded-xl text-[10px] font-black text-alita-gray-400 hover:bg-alita-gray-50 transition-all uppercase" onClick={() => setMemberStep(1)} disabled={submitting}>Kembali</button>
               <button type="submit" className="col-span-2 py-3.5 bg-alita-black text-alita-white rounded-xl text-[10px] font-black tracking-[0.15em] hover:bg-alita-orange transition-all uppercase shadow-lg shadow-black/10 disabled:opacity-50" disabled={submitting}>
                 {submitting ? "PROSES MENYIMPAN..." : "SIMPAN ANGGOTA TIM"}
               </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
