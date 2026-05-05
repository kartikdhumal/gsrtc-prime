"use client";
import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import AdminLayout from "../adminnavbar/layout";

function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/getusers?limit=1");
        const usersData = await res.json();
        setTotalUsers(usersData.pagination?.total || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="min-h-[calc(100vh-64px)] bg-[#E3E3E3] p-6">
        <h1 className="mb-6 text-3xl font-semibold">Dashboard</h1>
        <div className="max-w-[250px] rounded-2xl bg-white p-6 text-center shadow">
          {loading ? (
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 animate-pulse rounded bg-slate-200" />
              <div className="mx-auto h-8 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#212153]/10 text-[#212153]">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500">Total Current Users</p>
              <p className="text-4xl font-semibold text-[#212153]">{totalUsers}</p>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
