"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { MdDomainAdd } from "react-icons/md";
import toast from "react-hot-toast";
import { gujaratCities } from "@/lib/utils";

type BusStandFormData = {
  name: string;
  location: string;
  code: string;
  district: string;
};

type PropsType = {
  refresh: () => void;
  setFilterDistrict: React.Dispatch<React.SetStateAction<string>>;
}

export default function AddBusStand({ refresh, setFilterDistrict }: PropsType) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BusStandFormData>({
    defaultValues: { name: "", location: "", code: "", district: "" },
  });

  const onSubmit = async (data: BusStandFormData) => {
    try {
      const res = await fetch("/api/addbusstand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add bus stand");
      toast.success("Bus Stand added successfully!");
      setFilterDistrict("all");
      refresh();
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "auto", display: "flex" }}>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ bgcolor: "transparent" }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <Divider />

              <TextField
                fullWidth
                label="Bus Stand Name *"
                {...register("name", { required: "Name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                fullWidth
                label="Location *"
                {...register("location", { required: "Location is required" })}
                error={!!errors.location}
                helperText={errors.location?.message}
              />

              <TextField
                fullWidth
                label="Code *"
                {...register("code", { required: "Code is required" })}
                error={!!errors.code}
                helperText={errors.code?.message}
              />

              <Controller
                name="district"
                control={control}
                rules={{ required: "District is required" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.district}>
                    <InputLabel>District *</InputLabel>
                    <Select {...field} label="District *">
                      {gujaratCities["Gujarat"].map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.district && (
                      <Typography variant="caption" color="error">
                        {errors.district.message}
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
                    bgcolor: "#E3E3E3",
                    color: "#212153",
                    border: "1px solid #212153",
                  },
                }}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <MdDomainAdd size={20} />
                  )
                }
              >
                {isSubmitting ? "Adding..." : "Add Bus Stand"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
