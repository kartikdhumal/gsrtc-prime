"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { convertTimeToMinutes } from "@/lib/utils";

type StandItem = {
    stand: string;
    sequence: number;
    arrivalTime?: string;
    departureTime?: string;
    distanceFromPrev?: number;
    fare?: { sleeper?: number; seating?: number };
};

type RouteFormData = {
    name: string;
    bus: string;
    conductor?: string;
    stands: StandItem[];
    distanceKm: number;
    totalFare: { sleeper?: number; seating?: number };
    isSpecialRoute?: boolean;
    festivalName?: string;
    validFrom?: string;
    validTo?: string;
    status: "Active" | "Inactive";
};

type Conductor = {
    _id: string;
    name: string;
    employeeId: string;
    status: string;
};

type PropsType = { refresh: () => void };

export default function AddRoute({ refresh }: PropsType) {
    const [buses, setBuses] = useState<any[]>([]);
    const [busStands, setBusStands] = useState<any[]>([]);
    const [conductors, setConductors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBus, setSelectedBus] = useState<any>(null);

    const { control, register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<RouteFormData>({
        defaultValues: {
            name: "",
            bus: "",
            conductor: "",
            stands: [{ stand: "", sequence: 1, arrivalTime: "", departureTime: "", distanceFromPrev: 0, fare: { sleeper: 0, seating: 0 } }],
            distanceKm: 0,
            totalFare: { sleeper: 0, seating: 0 },
            status: "Active",
            isSpecialRoute: false,
            festivalName: "",
            validFrom: "",
            validTo: "",
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "stands" });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [busRes, standRes, conductorRes] = await Promise.all([
                    fetch("/api/getbuses"),
                    fetch("/api/getbusstands"),
                    fetch("/api/getconductors"),
                ]);
                const [busesData, standsData, conductorsData] = await Promise.all([busRes.json(), standRes.json(), conductorRes.json()]);
                setBuses(busesData.data || []);
                setBusStands(standsData.data || []);
                setConductors((conductorsData.data || []).filter((conductor: Conductor) => conductor.status === 'active'));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: RouteFormData) => {

        const totalDistance = data.stands.reduce((sum, s) => sum + (Number(s.distanceFromPrev) || 0), 0);
        data.distanceKm = parseFloat(totalDistance.toFixed(2));

        const apiPayload = {
            ...data,
            distanceKm: parseFloat(totalDistance.toFixed(2)),
            totalFare: {
                sleeper: data.totalFare?.sleeper ?? 0,
                seating: data.totalFare?.seating ?? 0,
            },
            stands: data.stands.map((s, i) => ({
                stand: s.stand,
                sequence: i + 1,
                distanceFromPrev: s.distanceFromPrev ?? 0,

                arrivalTime: convertTimeToMinutes(s.arrivalTime),
                departureTime: convertTimeToMinutes(s.departureTime),

                fare: {
                    sleeper: s.fare?.sleeper ?? 0,
                    seating: s.fare?.seating ?? 0,
                },
            })),
        }
        try {
            const res = await fetch("/api/addroute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiPayload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to add route");
            toast.success("Route added successfully!");
            reset();
            refresh();
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Paper>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField label="Route Name" {...register("name", { required: "Route name is required" })} error={!!errors.name} helperText={errors.name?.message} fullWidth />

                        <FormControl fullWidth>
                            <InputLabel>Bus</InputLabel>
                            <Controller name="bus" control={control} rules={{ required: "Bus is required" }}
                                render={({ field }) => (
                                    <Select {...field} onChange={(e) => {
                                        field.onChange(e);
                                        const bus = buses.find((b) => b._id === e.target.value);
                                        setSelectedBus(bus || null);
                                    }}>
                                        {buses.map(b => <MenuItem key={b._id} value={b._id}>{b.name} ({b.type})</MenuItem>)}
                                    </Select>
                                )} />
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Conductor</InputLabel>
                            <Controller name="conductor" control={control}
                                render={({ field }) => (
                                    <Select {...field}>
                                        <MenuItem value="">None</MenuItem>
                                        {conductors.map(c => <MenuItem key={c._id} value={c._id}>{c.name} ({c.employeeId})</MenuItem>)}
                                    </Select>
                                )} />
                        </FormControl>

                        <Typography variant="subtitle1">Bus Stands / Legs</Typography>
                        {fields.map((item, index) => (
                            <Stack key={item.id} direction="row" spacing={1} justifyContent={"flex-start"} alignItems="center">
                                <FormControl sx={{ width: "40%" }}>
                                    <InputLabel>Stand</InputLabel>
                                    <Controller name={`stands.${index}.stand`} control={control} render={({ field }) => (
                                        <Select {...field}>
                                            <MenuItem value="" disabled selected>
                                                Select Bus Stand
                                            </MenuItem>
                                            {busStands.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.code})</MenuItem>)}
                                        </Select>
                                    )} />
                                </FormControl>

                                {
                                    index !== 0 && <TextField
                                        label="Arrival Time"
                                        placeholder="HH:MM"
                                        style={{ width: "100%" }}
                                        {...register(`stands.${index}.arrivalTime`, {
                                            pattern: {
                                                value: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
                                                message: "Invalid time (HH:MM)",
                                            },
                                        })}
                                        error={!!errors.stands?.[index]?.arrivalTime}
                                        helperText={errors.stands?.[index]?.arrivalTime?.message}
                                        inputProps={{ maxLength: 5 }}
                                        fullWidth
                                    />
                                }
                                {index === 0 && <Box sx={{ width: '100%' }} />}
                                {index !== fields.length - 1 && (
                                    <TextField
                                        label="Departure Time"
                                        placeholder="HH:MM"
                                        style={{ width: "100%" }}
                                        {...register(`stands.${index}.departureTime`, {
                                            pattern: {
                                                value: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
                                                message: "Invalid time (HH:MM)",
                                            },
                                        })}
                                        error={!!errors.stands?.[index]?.departureTime}
                                        helperText={errors.stands?.[index]?.departureTime?.message}
                                        inputProps={{ maxLength: 5 }}
                                        fullWidth
                                    />
                                )}
                                <TextField label="Distance from Previous" type="number" InputProps={{ inputProps: { step: 0.1, min: 0 } }} style={{ width: "100px" }} {...register(`stands.${index}.distanceFromPrev`, { valueAsNumber: true })} />
                                {selectedBus?.sleeperSeats > 0 && (
                                    <TextField
                                        label="Fare - Sleeper"
                                        InputProps={{ inputProps: { step: 1, min: 0 } }}
                                        type="number"
                                        style={{ width: "100px" }}
                                        {...register(`stands.${index}.fare.sleeper`, { valueAsNumber: true })}
                                    />
                                )}
                                <TextField label={`Fare ${selectedBus?.sleeperSeats > 0 ? " - Seating" : ""}`} type="number" InputProps={{ inputProps: { step: 1, min: 0 } }} style={{ width: "100px" }} {...register(`stands.${index}.fare.seating`, { valueAsNumber: true })} />

                                {fields.length > 1 && index !== 0 && (
                                    <MdDeleteOutline
                                        size={40}
                                        style={{ cursor: "pointer", color: "red" }}
                                        onClick={() => remove(index)}
                                    />
                                )}
                            </Stack>
                        ))}
                        <Button variant="outlined" sx={{
                            mb: 2,
                            p: 0.5,
                            width: "100%",
                            borderRadius: '8px',
                            bgcolor: '#212153',
                            color: "#E3E3E3",
                        }} onClick={() => append({ stand: "", sequence: fields.length + 1, distanceFromPrev: 0, fare: { sleeper: 0, seating: 0 } })}>Add Stand</Button>

                        <Stack direction="row" spacing={2}>
                            {selectedBus?.sleeperSeats > 0 && (
                                <TextField
                                    label="Route Fare - Sleeper"
                                    type="number"
                                    {...register("totalFare.sleeper", { valueAsNumber: true })}
                                    fullWidth
                                />
                            )}
                            <TextField
                                label={`Route Fare ${selectedBus?.sleeperSeats > 0 ? " - Seating" : ""}`}
                                type="number"
                                {...register("totalFare.seating", { valueAsNumber: true })}
                                fullWidth
                            />
                        </Stack>


                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            )} />
                        </FormControl>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Controller name="isSpecialRoute" control={control} render={({ field }) => {
                                const { value, onChange, ...rest } = field;
                                return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} {...rest} />;
                            }} />
                            <Typography>Special / Festival Route</Typography>
                        </Stack>

                        {watch("isSpecialRoute") && (
                            <Stack direction="row" spacing={2}>
                                <TextField label="Festival Name" {...register("festivalName")} fullWidth />
                                <TextField label="Valid From" type="date" {...register("validFrom")} InputLabelProps={{ shrink: true }} fullWidth />
                                <TextField label="Valid To" type="date" {...register("validTo")} InputLabelProps={{ shrink: true }} fullWidth />
                            </Stack>
                        )}

                        <Button type="submit" variant="contained" sx={{
                            mb: 2,
                            p: 1.5,
                            width: "100%",
                            borderRadius: '8px',
                            bgcolor: '#212153',
                            color: "#E3E3E3",
                        }} disabled={isSubmitting || loading}>
                            {isSubmitting || loading ? <CircularProgress size={20} /> : "Add Route"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
