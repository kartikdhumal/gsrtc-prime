"use client";
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    Box, Paper, Typography, TextField, Button, Select, MenuItem,
    InputLabel, FormControl, FormHelperText, InputAdornment, CircularProgress,
    Stack, Divider
} from '@mui/material';
import { FiUser, FiPhone, FiHome, FiCalendar } from 'react-icons/fi';
import { MdPersonAdd } from 'react-icons/md';
import { gujaratCities } from '@/lib/utils';

type ConductorFormData = { name: string; phone: string; houseNo: string; street: string; area: string; city: string; state: string; pincode: string; joiningDate: string; status: "active" | "inactive" | "suspended"; };

type PropsType = {
    refresh : () => void
}

export default function AddConductor({refresh} : PropsType) {
    const [cities, setCities] = React.useState<string[]>([]);
    const { control, handleSubmit, formState: { errors, isSubmitting }, register, watch, setValue, getValues , reset } = useForm<ConductorFormData>({
        defaultValues: { name: '', phone: '', houseNo: '', street: '', area: '', city: '', state: 'Gujarat', pincode: '', joiningDate: new Date().toISOString().split('T')[0], status: 'active' }
    });

    const selectedState = watch("state");

    React.useEffect(() => {
        const stateKey = selectedState as keyof typeof gujaratCities;
        const newCities = gujaratCities[stateKey] || [];
        setCities(newCities);
        const currentCity = getValues("city");
        if (!newCities.includes(currentCity)) { setValue('city', ''); }
    }, [selectedState, setValue, getValues]);

    React.useEffect(() => {
        const defaultState = getValues("state") as keyof typeof gujaratCities;
        if (defaultState) { setCities(gujaratCities[defaultState] || []); }
    }, [getValues]);

    const onSubmit = async (data: ConductorFormData) => {
        try {
            const fullAddress = `${data.houseNo}, ${data.street}, ${data.area}, ${data.city}, ${data.state} - ${data.pincode}`;

            const response = await fetch("/api/addconductor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    address: fullAddress,
                    joiningDate: data.joiningDate,
                    status: data.status,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to register conductor");
            }

            await response.json();
            toast.success("Conductor registered successfully!");
            refresh();
            reset({
                name: '',
                phone: '',
                houseNo: '',
                street: '',
                area: '',
                city: '',
                state: 'Gujarat',
                pincode: '',
                joiningDate: new Date().toISOString().split('T')[0],
                status: 'active',
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to register conductor.");
        }
    };


    return (
            <Box sx={{ minHeight: 'auto', display: 'flex' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, flex: 1 }}>

                    <Box sx={{ flexBasis: { xs: '100%', lg: '100%' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box component={Paper} elevation={0} square sx={{ bgcolor: 'transparent', p: { xs: 3, sm: 3, lg: 3 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Stack spacing={2}>
                                    <section>
                                        <Typography variant="h6" component="h2" fontWeight="600" color="slate.700">Personal Information</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2}>
                                            <TextField fullWidth label="Full Name *" {...register('name', { required: 'Full name is required' })} error={!!errors.name} helperText={errors.name?.message} InputProps={{ startAdornment: <InputAdornment position="start"><FiUser /></InputAdornment> }} />
                                            <TextField fullWidth label="Phone Number *" type="tel" {...register('phone', { required: 'Phone number is required', pattern: { value: /^[6-9][0-9]{9}$/, message: 'Enter a valid 10-digit Indian phone number' } })} error={!!errors.phone} helperText={errors.phone?.message} InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone /></InputAdornment> }} />
                                        </Stack>
                                    </section>

                                    <Divider />

                                    <section>
                                        <Typography variant="h6" component="h2" fontWeight="600" color="slate.700">Contact & Address</Typography>
                                        <Stack spacing={3} mt={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <TextField fullWidth label="House No. / Flat No. *" {...register('houseNo', { required: 'House number is required' })} error={!!errors.houseNo} helperText={errors.houseNo?.message} InputProps={{ startAdornment: <InputAdornment position="start"><FiHome /></InputAdornment> }} />
                                                <TextField fullWidth label="Street / Road *" {...register('street', { required: 'Street is required' })} error={!!errors.street} helperText={errors.street?.message} />
                                                <TextField fullWidth label="Area / Landmark *" {...register('area', { required: 'Area is required' })} error={!!errors.area} helperText={errors.area?.message} />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <TextField fullWidth label="Pincode *" {...register('pincode', { required: 'Pincode is required', pattern: { value: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pincode' } })} error={!!errors.pincode} helperText={errors.pincode?.message} />
                                                <FormControl fullWidth error={!!errors.state}>
                                                    <InputLabel id="state-label">State *</InputLabel>
                                                    <Controller name="state" control={control} rules={{ required: 'State is required' }} render={({ field }) => (
                                                        <Select labelId="state-label" label="State *" {...field}>
                                                            {Object.keys(gujaratCities).sort().map((state) => (<MenuItem key={state} value={state}>{state}</MenuItem>))}
                                                        </Select>
                                                    )} />
                                                    {errors.state && <FormHelperText>{errors.state.message}</FormHelperText>}
                                                </FormControl>
                                                <FormControl fullWidth disabled={cities.length === 0} error={!!errors.city}>
                                                    <InputLabel id="city-label">City *</InputLabel>
                                                    <Controller name="city" control={control} rules={{ required: 'City is required' }} render={({ field }) => (
                                                        <Select labelId="city-label" label="City *" {...field}>
                                                            <MenuItem value=""><em>Select a city</em></MenuItem>
                                                            {cities.sort().map((city) => (<MenuItem key={city} value={city}>{city}</MenuItem>))}
                                                        </Select>
                                                    )} />
                                                    {errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
                                                </FormControl>
                                            </Stack>
                                        </Stack>
                                    </section>

                                    <Divider />

                                    <section>
                                        <Typography variant="h6" component="h2" fontWeight="600" color="slate.700">Employment Details</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2}>
                                            <TextField fullWidth label="Joining Date *" type="date" {...register('joiningDate', { required: 'Joining date is required' })} error={!!errors.joiningDate} helperText={errors.joiningDate?.message} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><FiCalendar /></InputAdornment> }} />
                                            <FormControl fullWidth error={!!errors.status}>
                                                <InputLabel id="status-label">Employment Status *</InputLabel>
                                                <Controller name="status" control={control} rules={{ required: 'Status is required' }} render={({ field }) => (
                                                    <Select labelId="status-label" label="Employment Status *" {...field}>
                                                        <MenuItem value="active">Active</MenuItem>
                                                        <MenuItem value="inactive">Inactive</MenuItem>
                                                        <MenuItem value="suspended">Suspended</MenuItem>
                                                    </Select>
                                                )} />
                                                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                            </FormControl>
                                        </Stack>
                                    </section>

                                    <Stack direction="row" justifyContent="center" spacing={2}>
                                        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{
                                            mb: 2,
                                            p: 1.5,
                                            width: "100%",
                                            borderRadius: '8px',
                                            bgcolor: '#212153',
                                            color: "#E3E3E3",
                                            '&:hover': {
                                                bgcolor: '#E3E3E3',
                                                border: "1px solid #212153",
                                                color: "#212153"
                                            },
                                        }} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <MdPersonAdd size={18} />}>
                                            {isSubmitting ? 'Adding...' : 'Add Conductor'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        </Box>
                    </Box>
                </Box>
            </Box>
    );
}   