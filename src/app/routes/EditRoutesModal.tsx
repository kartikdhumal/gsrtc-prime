"use client";
import { useState, useEffect, Fragment, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { convertMinutesToTime } from "@/lib/utils";
import { convertTimeToMinutes } from "@/lib/utils";


type BusStand = {
  _id: string;
  name: string;
  location: string;
  code: string;
  district?: string;
};

type Bus = {
  _id: string;
  name: string;
  type: string;
  sleeperSeats: number;
  seatingSeats: number;
};

type Conductor = {
  _id: string;
  name: string;
  employeeId: string;
};

type StandItemFromDB = {
  _id: string;
  stand: BusStand | null;
  sequence: number;
  arrivalTime?: number;
  departureTime?: number;
  distanceFromPrev?: number;
  fare?: { sleeper?: number; seating?: number };
};

type StandItemForForm = {
  _id: string;
  stand: BusStand | null;
  sequence: number;
  arrivalTime?: string;
  departureTime?: string;
  distanceFromPrev?: number;
  fare?: { sleeper?: number; seating?: number };
};

type BusRouteFromDB = {
  _id: string;
  name: string;
  bus: Bus;
  conductor?: Conductor;
  stands: StandItemFromDB[];
  distanceKm: number;
  totalFare: { sleeper?: number; seating?: number };
  status: "Active" | "Inactive";
  isSpecialRoute?: boolean;
  festivalName?: string;
  validFrom?: string;
  validTo?: string;
};

type FormStateType = Omit<BusRouteFromDB, 'stands'> & {
  stands: StandItemForForm[];
};

interface EditRoutesModalProps {
  busRoute: BusRouteFromDB;
  onClose: () => void;
  refresh: () => void;
}

const initializeFormState = (route: BusRouteFromDB): FormStateType => {
  return {
    ...route,
    stands: route.stands.map(stand => ({
      ...stand,
      arrivalTime: convertMinutesToTime(stand.arrivalTime),
      departureTime: convertMinutesToTime(stand.departureTime),
    }))
  };
};

export default function EditRoutesModal({ busRoute, onClose, refresh }: EditRoutesModalProps) {

  const [form, setForm] = useState<FormStateType>(() => initializeFormState(busRoute));
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busStands, setBusStands] = useState<BusStand[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [busRes, standRes, conductorRes] = await Promise.all([
          fetch("/api/getbuses"),
          fetch("/api/getbusstands"),
          fetch("/api/getconductors"),
        ]);
        const [busesData, standsData, conductorsData] = await Promise.all([
          busRes.json(),
          standRes.json(),
          conductorRes.json(),
        ]);
        setBuses(busesData.data || []);
        setBusStands(standsData.data || []);
        setConductors(conductorsData.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load initial data.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInsertStand = (index: number) => {
    const newStands = [...form.stands];
    const newBlankStand: StandItemForForm = {
      _id: `new-${Date.now()}`,
      stand: null,
      arrivalTime: "00:00",
      departureTime: "00:00",
      distanceFromPrev: 0,
      fare: { sleeper: 0, seating: 0 },
      sequence: 0,
    };
    newStands.splice(index, 0, newBlankStand);
    const updatedStandsWithSequence = newStands.map((stand, i) => ({
      ...stand,
      sequence: i + 1,
    }));
    setForm((prev) => ({ ...prev, stands: updatedStandsWithSequence }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "bus") {
      const selectedBus = buses.find(b => b._id === value);
      setForm((prev) => ({ ...prev, bus: selectedBus as Bus }));
    } else if (name === "conductor") {
      const selectedConductor = conductors.find(c => c._id === value);
      setForm((prev) => ({ ...prev, conductor: selectedConductor as Conductor }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStandChange = (index: number, key: string, value: any) => {
    const newStands = [...form.stands];
    let updatedStand = { ...newStands[index] };

    if (key === "stand") {
      const selectedStand = busStands.find(bs => bs._id === value);
      updatedStand.stand = selectedStand as BusStand;
    } else {
      updatedStand = { ...updatedStand, [key]: value };
    }

    newStands[index] = updatedStand;
    setForm((prev) => ({ ...prev, stands: newStands }));
  };

  const handleDeleteStand = (index: number) => {
    if (form.stands.length <= 1) {
      toast.error("A route must have at least one stand.");
      return;
    }
    const newStands = [...form.stands];
    newStands.splice(index, 1);
    const updatedStandsWithSequence = newStands.map((stand, i) => ({
      ...stand,
      sequence: i + 1,
    }));
    setForm((prev) => ({ ...prev, stands: updatedStandsWithSequence }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const totalDistance = form.stands.reduce(
        (acc, s) => acc + (Number(s.distanceFromPrev) || 0),
        0
      );

      const apiPayload = {
        ...form,
        bus: form.bus._id,
        conductor: form.conductor?._id || null,
        distanceKm: totalDistance,
        totalFare: {
          sleeper: form.totalFare?.sleeper ?? 0,
          seating: form.totalFare?.seating ?? 0,
        },
        stands: form.stands.map((s) => ({
          _id: s._id.startsWith("new-") ? undefined : s._id,
          stand: s.stand?._id,
          sequence: s.sequence,
          distanceFromPrev: s.distanceFromPrev ?? 0,
          arrivalTime: convertTimeToMinutes(s.arrivalTime),
          departureTime: convertTimeToMinutes(s.departureTime),
          fare: {
            sleeper: s.fare?.sleeper ?? 0,
            seating: s.fare?.seating ?? 0,
          },
        })),
      };

      const res = await fetch(`/api/busroute/${busRoute._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Bus route updated successfully!");
        refresh();
        onClose();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{
        width: { xs: '90vw', md: 700 },
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: "background.paper",
        p: 3,
        borderRadius: 2,
        outline: "none"
      }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Edit Bus Route</Typography>
          <IconButton onClick={onClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {isDataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              label="Route Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Bus</InputLabel>
              <Select
                name="bus"
                value={form.bus?._id || ""}
                onChange={handleSelectChange}
                label="Bus"
              >
                {buses.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name} ({b.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Conductor</InputLabel>
              <Select
                name="conductor"
                value={form.conductor?._id || ""}
                onChange={handleSelectChange}
                label="Conductor"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {conductors.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} ({c.employeeId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ pt: 1 }}>Bus Stands / Legs</Typography>
            {form.stands.map((s, idx) => (
              <Fragment key={s._id || `new-${idx}`}>
                <Box key={idx} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Stand</InputLabel>
                      <Select
                        value={s.stand?._id || ""}
                        label="Stand"
                        onChange={(e) => handleStandChange(idx, "stand", e.target.value)}
                      >
                        {busStands.map((bs) => (
                          <MenuItem key={bs._id} value={bs._id}>
                            {bs.name} ({bs.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Arrival Time"
                        type="text"
                        placeholder="HH:MM"
                        value={s.arrivalTime || ""}
                        onChange={(e) => handleStandChange(idx, "arrivalTime", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ maxLength: 5 }}
                        fullWidth
                        disabled={idx === 0}
                      />
                      <TextField
                        label="Departure Time"
                        type="text"
                        placeholder="HH:MM"
                        value={s.departureTime || ""}
                        onChange={(e) => handleStandChange(idx, "departureTime", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ maxLength: 5 }}
                        fullWidth
                        disabled={idx === form.stands.length - 1}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Distance (Km)"
                        type="number"
                        value={s.distanceFromPrev || 0}
                        onChange={(e) => handleStandChange(idx, "distanceFromPrev", parseFloat(e.target.value))}
                        InputProps={{ inputProps: { step: 0.1, min: 0 } }}
                        fullWidth
                      />
                      {form.bus?.sleeperSeats > 0 && (
                        <TextField
                          label="Fare - Sleeper"
                          type="number"
                          value={s.fare?.sleeper || 0}
                          onChange={(e) =>
                            handleStandChange(idx, "fare", { ...s.fare, sleeper: parseFloat(e.target.value) })
                          }
                          InputProps={{ inputProps: { step: 1, min: 0 } }}
                          fullWidth
                        />
                      )}
                      <TextField
                        label="Fare - Seating"
                        type="number"
                        value={s.fare?.seating || 0}
                        onChange={(e) =>
                          handleStandChange(idx, "fare", { ...s.fare, seating: parseFloat(e.target.value) })
                        }
                        InputProps={{ inputProps: { step: 1, min: 0 } }}
                        fullWidth
                      />
                    </Stack>
                  </Stack>
                </Box>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ py: 1.5 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleInsertStand(idx + 1)}
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      color: 'text.secondary',
                      borderColor: 'divider'
                    }}
                  >
                    Add Stand Below
                  </Button>
                  {form.stands.length > 1 && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteStand(idx)}
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                      }}
                    >
                      Delete This Stand
                    </Button>
                  )}
                </Stack>
              </Fragment>
            ))}

            <Stack direction="row" spacing={2}>
              {form.bus?.sleeperSeats > 0 && (
                <TextField
                  label="Route Fare - Sleeper"
                  type="number"
                  value={form.totalFare?.sleeper || 0}
                  onChange={(e) => setForm({ ...form, totalFare: { ...form.totalFare, sleeper: parseFloat(e.target.value) } })}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
              )}
              <TextField
                label="Route Fare - Seating"
                type="number"
                value={form.totalFare?.seating || 0}
                onChange={(e) => setForm({ ...form, totalFare: { ...form.totalFare, seating: parseFloat(e.target.value) } })}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                label="Status"
                value={form.status}
                onChange={handleSelectChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                type="checkbox"
                id="isSpecialRoute"
                checked={!!form.isSpecialRoute}
                onChange={(e) => setForm({ ...form, isSpecialRoute: e.target.checked })}
              />
              <label htmlFor="isSpecialRoute" style={{ cursor: 'pointer' }}>
                <Typography>Special / Festival Route</Typography>
              </label>
            </Stack>
            {form.isSpecialRoute && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Festival Name"
                  value={form.festivalName || ""}
                  onChange={(e) => setForm({ ...form, festivalName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Valid From"
                  type="date"
                  value={form.validFrom?.split("T")[0] || ""}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Valid To"
                  type="date"
                  value={form.validTo?.split("T")[0] || ""}
                  onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            )}
            <Button
              variant="contained"
              sx={{ p: 1.5, bgcolor: "#343478", color: "#e3e3e3", "&:hover": { bgcolor: "#202058" } }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >

              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
            </Button>
          </Stack>
        )}
      </Paper>
    </Modal>
  );
}

