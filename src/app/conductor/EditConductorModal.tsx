import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface Conductor { _id: string; name: string; phone: string; address: string; }
interface EditConductorModalProps { conductor: Conductor; onClose: () => void; refresh: () => void; }

export default function EditConductorModal({ conductor, onClose, refresh }: EditConductorModalProps) {
  const [form, setForm] = useState({ name: conductor.name || "", phone: conductor.phone || "", address: conductor.address || "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/conductor/${conductor._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast.success("Conductor updated successfully"); refresh(); onClose(); }
      else toast.error(data.message || "An unknown error occurred");
    } catch { toast.error("Update request failed. Please try again."); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e)=>e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">Edit Conductor Details</h2>
        <button onClick={onClose}><X className="h-5 w-5"/></button>
      </div>
      <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2" name="name" value={form.name} onChange={handleChange} required />
        <input className="w-full rounded border px-3 py-2" name="phone" value={form.phone} onChange={handleChange} required />
        <textarea className="w-full rounded border px-3 py-2" name="address" rows={2} value={form.address} onChange={handleChange} />
        <button className="w-full rounded bg-[#343478] py-2 text-[#e3e3e3]" onClick={handleSubmit}>Save Changes</button>
      </div>
    </div>
  </div>;
}
