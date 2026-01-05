"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Paper, Typography, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, Switch, ButtonBase } from "@mui/material";
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Hot icon
import AcUnitIcon from '@mui/icons-material/AcUnit';

type BusFormData = {
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
    refresh: () => void;
}

export default function AddBus({ refresh }: PropsType) {
    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BusFormData>({
        defaultValues: { name: "", code: "", type: "", totalSeats: 0, sleeperSeats: 0, seatingSeats: 0, isAirconditioned: true, status: "Active" }
    });

    const onSubmit = async (data: BusFormData) => {
        try {
            const res = await fetch("/api/addbus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to add bus");

            toast.success("Bus added successfully!");
            reset();
            refresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Paper>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Bus Name" {...register("name", { required: "Name is required" })} error={!!errors.name} helperText={errors.name?.message} fullWidth />
                        <TextField label="Bus Code" {...register("code", { required: "Code is required" })} error={!!errors.code} helperText={errors.code?.message} fullWidth />
                        <TextField label="Type" {...register("type", { required: "Type is required" })} error={!!errors.type} helperText={errors.type?.message} fullWidth />
                        <TextField label="Total Seats" type="number" {...register("totalSeats", { required: "Total seats required", valueAsNumber: true })} error={!!errors.totalSeats} helperText={errors.totalSeats?.message} fullWidth />
                        <TextField label="Sleeper Seats" type="number" {...register("sleeperSeats", { valueAsNumber: true })} fullWidth />
                        <TextField label="Seating Seats" type="number" {...register("seatingSeats", { valueAsNumber: true })} fullWidth />

                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            )} />
                        </FormControl>

                        <FormControl fullWidth>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                AC / Non-AC
                            </Typography>
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
                                        mt: 0.5
                                    }}>
                                        {/* NON-AC BUTTON */}
                                        <ButtonBase
                                            onClick={() => field.onChange(false)}
                                            sx={{
                                                flex: 1,
                                                py: 1.5,
                                                display: 'flex',
                                                gap: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease-in-out',
                                                backgroundColor: !field.value ? '#DDA221' : 'transparent',
                                                color: !field.value ? '#000' : 'text.secondary',
                                            }}
                                        >
                                            <WbSunnyIcon fontSize="small" />
                                            <Typography variant="button">Non-AC</Typography>
                                        </ButtonBase>

                                        {/* AC BUTTON */}
                                        <ButtonBase
                                            onClick={() => field.onChange(true)}
                                            sx={{
                                                flex: 1,
                                                py: 1.5,
                                                display: 'flex',
                                                gap: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease-in-out',
                                                // Dynamic styling for the "cool" / AC side
                                                backgroundColor: field.value ? '#29B6F6' : 'transparent', // Cool blue
                                                color: field.value ? '#fff' : 'text.secondary',
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
                            {isSubmitting ? <CircularProgress size={20} /> : "Add Bus"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
