"use client"

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// MUI Imports
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Loader from '../loaders/Loader';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Profile = () => { 
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("currentUser");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setName(userData.name);
            setEmail(userData.email);
            if (userData.coverImage) {
                setProfileImageUrl(userData.coverImage);
            }
        } else {
            toast.error("Please login to view your profile.");
            navigate("/login");
        }
    }, [navigate]);


const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []); // Ensure files is an array
    if (files.length === 0) return;

    setAvatarUploading(true); // Start avatar loader

    try {
        // We only expect one file for a profile picture
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        if (data.secure_url) {
            setProfileImageUrl(data.secure_url); // Set the Cloudinary URL
            toast.success("Profile image uploaded successfully!");
        } else {
            console.error('No secure URL found in the Cloudinary response:', data);
            toast.error("Cloudinary upload failed: No URL returned.");
        }
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        toast.error("Error uploading profile image.");
    } finally {
        setAvatarUploading(false); // Stop avatar loader
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the input so same file can be selected again
        }
    }
};

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name || !email) {
            toast.error("Name and Email are required");
            return;
        }

        setLoading(true);

        const storedUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
        const token = storedUser?.token;
        const userId = storedUser?.id

        const payload = {
            userId,
            name,
            email,
            coverImage: profileImageUrl || "",
        };

        try {
            const res = await fetch("/api/editprofile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to update profile");
                return;
            }

            const updatedUser = {
                ...storedUser,
                name: data.user.name,
                email: data.user.email,
                coverImage: data.user.coverImage || profileImageUrl,
            };

            sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));

            toast.success("Profile updated successfully!");
            navigates("/admindashboard");

        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Something went wrong during the update.");
        } finally {
            setLoading(false);
        }
    };


    return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: '#212153',
                }}
            >
                <Box
                    sx={{
                        width: { xs: '90%', sm: '400px' },
                        p: 4,
                        borderRadius: '16px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        bgcolor: '#E3E3E3',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" component="h1" style={{ color: "#E3E3E3" }} gutterBottom>
                        Update Profile
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        position: 'relative',
                        width: 100,
                        height: 100,
                        mx: 'auto'
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                            <Avatar
                                src={profileImageUrl || undefined}
                                sx={{ width: 100, height: 100, border: "1px solid #E3E3E3", fontSize: '2.5rem', bgcolor: 'primary.main' }}
                            >
                                {!profileImageUrl && name ? name.charAt(0).toUpperCase() : ''}
                            </Avatar>
                        </IconButton>

                        {avatarUploading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '50%',
                                }}
                            >
                                <Loader />
                            </Box>
                        )}
                    </Box>


                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ borderRadius: "8px" }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ borderRadius: "8px" }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            variant="outlined"
                            sx={{
                                mt: 3,
                                mb: 2,
                                p: 1.5,
                                bgcolor: '#343478',
                                color: "#E3E3E3",
                                borderRadius: '8px',
                            }}
                        >
                            {loading ? <Loader /> : "Save Changes"}
                        </Button>
                    </Box>
                </Box>
            </Box>
    );
};

export default Profile;