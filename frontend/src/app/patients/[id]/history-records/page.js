'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';

export default function HistoryRecordsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, API_BASE_URL } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load patient');
        return res.json();
      })
      .then((data) => { setPatient(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id, token]);

  if (loading) return <div className="p-8 text-slate-500">Loading records...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full p-8">
        <button onClick={() => router.back()} className="mb-6 text-sm text-teal-600 hover:underline">
          ← Back to Patient
        </button>
        <h1 className="text-2xl font-bold mb-1">Diagnostic History Records</h1>
        <p className="text-slate-400 mb-8">Patient: {patient?.name}</p>

        {patient?.appointments?.length > 0 ? (
          <div className="space-y-4">
            {patient.appointments.map((appt) => (
              <div key={appt.id} className="p-5 border rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Dr. {appt.doctor?.name ?? 'Unknown Physician'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {appt.notes ?? 'No notes recorded.'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appt.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {new Date(appt.slotTime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border rounded-xl border-dashed">
            <p className="text-slate-400">No diagnostic records found for this patient.</p>
          </div>
        )}
      </main>
    </div>
  );
}
