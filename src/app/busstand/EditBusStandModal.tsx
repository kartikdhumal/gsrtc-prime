import { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import { gujaratCities } from "@/lib/utils";

interface BusStand {
  _id: string;
  name: string;
  location: string;
  code: string;
  district?: string;
}

interface EditBusStandModalProps {
  busStand: BusStand;
  onClose: () => void;
  refresh: () => void;
}

export default function EditBusStandModal({
  busStand,
  onClose,
  refresh,
}: EditBusStandModalProps) {
  const [form, setForm] = useState({
    name: busStand.name || "",
    location: busStand.location || "",
    code: busStand.code || "",
    district: busStand.district || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/busstand/${busStand._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Bus stand updated successfully");
        refresh();
        onClose();
      } else {
        toast.error(data.message || "An unknown error occurred");
      }
    } catch (err: unknown) {
      let message = "Update request failed";

      if (err instanceof Error) {
        message += ": " + err.message;
      }

      toast.error(message);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="edit-busstand-modal-title"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper
        sx={{
          position: "absolute",
          width: 450,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Typography id="edit-busstand-modal-title" variant="h6" component="h2">
            Edit Bus Stand
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>District</InputLabel>
            <Select
              name="district"
              value={form.district}
              onChange={handleSelectChange}
              fullWidth
            >
              {gujaratCities["Gujarat"].map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" sx={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                p: 1.5,
                width: "100%",
                bgcolor: "#343478",
                color: "#e3e3e3",
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "#202058",
                },
              }}
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
}
