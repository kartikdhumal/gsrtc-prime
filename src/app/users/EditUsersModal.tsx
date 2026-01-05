"use client";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Modal,
    Paper,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Stack,
    Divider,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MdPersonAdd } from "react-icons/md";
import toast from "react-hot-toast";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/utils";
import Loader from "../loaders/Loader";

type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
    coverImage?: string;
};

type UserFormData = {
    name: string;
    email: string;
    role: string;
    coverImage?: string;
};

interface EditUsersModalProps {
    user: User;
    onClose: () => void;
    refresh: () => void;
}

export default function EditUsersModal({ user, onClose, refresh }: EditUsersModalProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<UserFormData>({
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            coverImage: user.coverImage || "",
        },
    });

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        reset({
            name: user.name,
            email: user.email,
            role: user.role,
            coverImage: user.coverImage || "",
        });
    }, [user, reset]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setAvatarUploading(true);

        try {

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
                setProfileImageUrl(data.secure_url);
                toast.success("Profile image uploaded successfully!");
            } else {
                console.error('No secure URL found in the Cloudinary response:', data);
                toast.error("Cloudinary upload failed: No URL returned.");
            }
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            toast.error("Error uploading profile image.");
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const onSubmit = async (data: UserFormData) => {

        const updateData: any = {
            ...data,
            coverImage: profileImageUrl || user.coverImage || "",
        };

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to update user");

            toast.success("User updated successfully!");
            refresh();
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <Modal open={true} onClose={onClose} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Paper sx={{
                width: { xs: '90vw', md: 500 },
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
                outline: "none"
            }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Edit User</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Stack spacing={3}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                                position: 'relative',
                                width: "100%",
                                padding: "10px",
                                height: 75,
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
                                        src={profileImageUrl || user.coverImage}
                                        sx={{ width: 75, height: 75, border: "1px solid #E3E3E3", fontSize: '2.5rem', bgcolor: 'primary.main' }}
                                    >
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

                            <TextField
                                fullWidth
                                label="Full Name *"
                                {...register("name", { required: "Name is required" })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                            <TextField
                                fullWidth
                                type="email"
                                label="Email *"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />

                            <Controller
                                name="role"
                                control={control}
                                rules={{ required: "Role is required" }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.role}>
                                        <InputLabel>Role *</InputLabel>
                                        <Select {...field} label="Role *">
                                            <MenuItem value="user">User</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                        </Select>
                                        {errors.role && (
                                            <Typography variant="caption" color="error" sx={{ pl: 2, pt: 0.5 }}>
                                                {errors.role.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={{
                                    mb: 2,
                                    p: 1.5,
                                    width: "100%",
                                    borderRadius: "8px",
                                    bgcolor: "#212153",
                                    color: "#E3E3E3",
                                    "&:hover": {
                                        bgcolor: '#343478',
                                    },
                                }}
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <MdPersonAdd size={20} />
                                    )
                                }
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Modal>
    );
}