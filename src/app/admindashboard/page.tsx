"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '../adminnavbar/layout';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  alpha,
  Skeleton
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const CardSkeleton = () => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 3,
      maxWidth: '250px',
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}
  >
    <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1.5 }} />
    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} width="80%" />
    <Skeleton variant="text" sx={{ fontSize: '2.5rem' }} width="40%" />
  </Paper>
);

function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/getusers?limit=1');
        const usersData = await res.json();
        setTotalUsers(usersData.pagination?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to show the skeleton
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ p: 3, bgcolor: "#E3E3E3", minHeight: "calc(100vh - 64px)" }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 3 }}>
          Dashboard
        </Typography>

        {loading ? (
          <CardSkeleton />
        ) : (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              borderRadius: 3,
              maxWidth: '250px',
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha('#212153', 0.1),
                color: '#212153',
                width: 48,
                height: 48,
                mb: 1.5
              }}
            >
              <PeopleIcon sx={{ fontSize: '1.5rem' }} />
            </Avatar>

            <Typography
              color="text.secondary"
              sx={{ fontSize: '0.9rem', mb: 0.5 }}
            >
              Total Current Users
            </Typography>

            <Typography
              variant="h4"
              component="h2"
              fontWeight="600"
              sx={{ color: '#212153' }}
            >
              {totalUsers}
            </Typography>
          </Paper>
        )}
      </Box>
    </AdminLayout>
  );
}

export default DashboardPage;