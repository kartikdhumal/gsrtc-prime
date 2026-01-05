"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Paper, Typography, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, ButtonBase } from "@mui/material";
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Non-AC icon
import AcUnitIcon from '@mui/icons-material/AcUnit'; // AC icon
import CloseIcon from '@mui/icons-material/Close';
import { Modal, IconButton } from "@mui/material";

type BusFormData = {
    _id: string;
    name: string;
    code: string;
    type: string;
    totalSeats: number;
    sleeperSeats?: number;
    seatingSeats?: number;
    isAirconditioned: boolean;
    status: "Active" | "Inactive";
};

type PropsType = {
    BusFormData: BusFormData;
    onClose: () => void;
    refresh: () => void;
};

export default function EditBusModal({ BusFormData, onClose, refresh }: PropsType) {
    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BusFormData>({
        defaultValues: { ...BusFormData }
    });

    const onSubmit = async (data: BusFormData) => {
        try {
            const res = await fetch(`/api/bus/${BusFormData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to update bus");

            toast.success("Bus updated successfully!");
            refresh();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Modal open={true} onClose={onClose} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Paper sx={{ width: 450, p: 3, borderRadius: 2, position: "relative" }}>
                <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Edit Bus</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Bus Name" {...register("name", { required: "Name is required" })} error={!!errors.name} helperText={errors.name?.message} size="small" fullWidth/>
                        <TextField label="Bus Code" {...register("code", { required: "Code is required" })} error={!!errors.code} helperText={errors.code?.message} size="small"  fullWidth />
                        <TextField label="Type" {...register("type", { required: "Type is required" })} error={!!errors.type} helperText={errors.type?.message} size="small"  fullWidth />
                        <TextField label="Total Seats" type="number" {...register("totalSeats", { required: "Total seats required", valueAsNumber: true })} error={!!errors.totalSeats} helperText={errors.totalSeats?.message} size="small"  fullWidth />
                        <TextField label="Sleeper Seats" type="number" {...register("sleeperSeats", { valueAsNumber: true })} size="small"  fullWidth />
                        <TextField label="Seating Seats" type="number" {...register("seatingSeats", { valueAsNumber: true })} size="small"  fullWidth />

                        <FormControl size="small"  fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            )} />
                        </FormControl>

                        <FormControl size="small"  fullWidth>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>AC / Non-AC</Typography>
                            <Controller
                                name="isAirconditioned"
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{
                                        display: 'flex',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        overflow: 'hidden',
                                    }}>
                                        <ButtonBase
                                            onClick={() => field.onChange(false)}
                                          
                                            sx={{
                                                flex: 1,
                                                py: 0.5,
                                                display: 'flex',
                                                gap: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: !field.value ? '#DDA221' : 'transparent',
                                                color: !field.value ? '#000' : 'text.secondary',
                                                transition: 'all 0.3s',
                                            }}
                                        >
                                            <WbSunnyIcon fontSize="small" />
                                            <Typography variant="button">Non-AC</Typography>
                                        </ButtonBase>
                                        <ButtonBase
                                            onClick={() => field.onChange(true)}
                                            sx={{
                                                flex: 1,
                                                py: 0.5,
                                                display: 'flex',
                                                gap: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: field.value ? '#29B6F6' : 'transparent',
                                                color: field.value ? '#fff' : 'text.secondary',
                                                transition: 'all 0.3s',
                                            }}
                                        >
                                            <AcUnitIcon fontSize="small" />
                                            <Typography variant="button">AC</Typography>
                                        </ButtonBase>
                                    </Box>
                                )}
                            />
                        </FormControl>

                        <Button type="submit" variant="contained" sx={{
                            mb: 2,
                            p: 1.5,
                            width: "100%",
                            borderRadius: '8px',
                            bgcolor: '#212153',
                            color: "#E3E3E3",
                        }} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={20} /> : "Update Bus"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Modal>
    );
}
