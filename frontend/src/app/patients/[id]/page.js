'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, API_BASE_URL } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setPatient(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!patient) return <div className="p-8">Patient not found.</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full p-8">
        <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
        <p className="text-slate-500 mb-6">Age: {patient.age} | Gender: {patient.gender}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border rounded-xl">
            <p className="text-xs text-slate-400 uppercase">Phone</p>
            <p className="font-semibold">{patient.phoneNumber}</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-xs text-slate-400 uppercase">Email</p>
            <p className="font-semibold">{patient.email || 'N/A'}</p>
          </div>
        </div>
        <div className="p-4 border rounded-xl mb-6">
          <p className="text-xs text-slate-400 uppercase mb-1">Medical History</p>
          <p>{patient.medicalHistory ?? 'No medical history recorded.'}</p>
        </div>
        <button
          onClick={() => router.push(`/patients/${id}/history-records`)}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700"
        >
          View Diagnostic Reports Details (Legacy App)
        </button>
      </main>
    </div>
  );
}
