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
  IconButton
} from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';

interface Conductor {
  _id: string;
  name: string;
  phone: string;
  address: string;
}

interface EditConductorModalProps {
  conductor: Conductor;
  onClose: () => void;
  refresh: () => void;
}

export default function EditConductorModal({ conductor, onClose, refresh } : EditConductorModalProps) {
  const [form, setForm] = useState({
    name: conductor.name || '',
    phone: conductor.phone || '',
    address: conductor.address || '',
  });

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/conductor/${conductor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Conductor updated successfully");
        refresh();
        onClose();
      } else {
        toast.error(data.message || "An unknown error occurred");
      }
    } catch (err) {
      toast.error("Update request failed. Please try again.");
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="edit-conductor-modal-title"
      aria-describedby="edit-conductor-modal-description"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* We use Paper for the card effect with elevation (shadow) */}
      <Paper
        sx={{
          position: 'absolute',
          width: 450,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4, // More padding
          borderRadius: 2,
          outline: 'none',
        }}
      >
        {/* 1. Modal Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="edit-conductor-modal-title" variant="h6" component="h2">
            Edit Conductor Details
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
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            type="tel"
          />
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          {/* 3. Action Buttons */}
          <Stack direction="row" sx={{ width: "100%" }}>
            <Button
              variant="contained"
              sx={{
                p: 1.5,
                width:"100%",
                bgcolor: '#343478',
                color:"#e3e3e3",
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#202058',
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