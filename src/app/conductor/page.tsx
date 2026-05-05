"use client";
import React from "react";
import AdminLayout from "../adminnavbar/layout";
import AddConductor from "./AddConductor";
import toast from "react-hot-toast";
import EditConductorModal from "./EditConductorModal";
import { Pencil } from "lucide-react";
import Loader from "../loaders/Loader";
import { gujaratCities } from "@/lib/utils";

type Conductor={_id:string;name:string;phone:string;address:string;joiningDate:string;status:string;employeeId:string;totalTrips?:number};

export default function ConductorsPage(){
const [data,setData]=React.useState<Conductor[]>([]);const [editingConductor,setEditingConductor]=React.useState<Conductor|null>(null);
const [page,setPage]=React.useState(0);const [rowsPerPage,setRowsPerPage]=React.useState(5);const [total,setTotal]=React.useState(0);const [loading,setLoading]=React.useState(false);
const [filterSearch,setFilterSearch]=React.useState('');const [filterStatus,setFilterStatus]=React.useState('all');const [filterCity,setFilterCity]=React.useState('all');const [debouncedSearch,setDebouncedSearch]=React.useState(filterSearch);
const fetchConductors=async()=>{try{setLoading(true);const params=new URLSearchParams({page:(page+1).toString(),limit:rowsPerPage.toString()});if(debouncedSearch)params.append('search',debouncedSearch);if(filterStatus!=='all')params.append('status',filterStatus);if(filterCity!=='all')params.append('city',filterCity);const res=await fetch(`/api/getconductors?${params}`);const r=await res.json();setData(r.data||[]);setTotal(r.pagination?.total||0);}catch{toast.error('Failed to fetch conductors')}finally{setLoading(false)}};
React.useEffect(()=>{const t=setTimeout(()=>{setDebouncedSearch(filterSearch);setPage(0)},500);return()=>clearTimeout(t)},[filterSearch]);
React.useEffect(()=>{fetchConductors()},[page,rowsPerPage,debouncedSearch,filterStatus,filterCity]);
return <AdminLayout><div className="bg-[#E3E3E3] p-4"><details className="mb-4 rounded bg-white p-3"><summary className="cursor-pointer font-semibold">Add Conductor</summary><AddConductor refresh={fetchConductors}/></details>
<h1 className="mb-3 text-2xl font-semibold">Conductors</h1>
<div className="mb-3 flex flex-wrap gap-2"><input className="rounded border px-3 py-2" placeholder="Search" value={filterSearch} onChange={e=>setFilterSearch(e.target.value)}/><select className="rounded border px-3 py-2" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select><select className="rounded border px-3 py-2" value={filterCity} onChange={e=>setFilterCity(e.target.value)}><option value="all">All Cities</option>{gujaratCities.Gujarat.sort().map(c=><option key={c} value={c}>{c}</option>)}</select></div>
<div className="overflow-auto rounded bg-white">{loading?<div className="p-8 text-center"><Loader/></div>:<table className="w-full text-sm"><thead><tr className="bg-slate-100"><th className="p-2">Emp ID</th><th>Name</th><th>Phone</th><th>Address</th><th>Joining</th><th>Status</th><th>Trips</th><th>Action</th></tr></thead><tbody>{data.map(c=><tr key={c._id} className="border-t"><td className="p-2">{c.employeeId}</td><td>{c.name}</td><td>{c.phone}</td><td>{c.address}</td><td>{new Date(c.joiningDate).toLocaleDateString()}</td><td><select value={c.status} onChange={e=>fetch(`/api/conductor/${c._id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:e.target.value})}).then(()=>fetchConductors())} className="rounded border px-2 py-1"><option value="active">active</option><option value="inactive">inactive</option><option value="suspended">suspended</option></select></td><td>{c.totalTrips||0}</td><td><button onClick={()=>setEditingConductor(c)}><Pencil className="h-4 w-4"/></button></td></tr>)}</tbody></table>}<div className="flex items-center justify-end gap-2 p-2"><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</button><span>{page+1}</span><button disabled={(page+1)*rowsPerPage>=total} onClick={()=>setPage(p=>p+1)}>Next</button><select value={rowsPerPage} onChange={e=>{setRowsPerPage(parseInt(e.target.value));setPage(0)}}><option>5</option><option>10</option><option>25</option></select></div></div>
{editingConductor&&<EditConductorModal conductor={editingConductor} onClose={()=>setEditingConductor(null)} refresh={fetchConductors}/>}
</div></AdminLayout>}
