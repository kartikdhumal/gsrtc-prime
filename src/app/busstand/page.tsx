"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel,
    SelectChangeEvent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminLayout from "../adminnavbar/layout";
import AddBusStand from "./AddBusStand";
import EditBusStandModal from "./EditBusStandModal";
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast";
import Loader from "../loaders/Loader";
import { gujaratCities } from "@/lib/utils";
import TableSkeleton from "../skeletons/TableSkeleton";

type BusStand = {
    _id: string;
    name: string;
    location: string;
    code: string;
    district?: string;
};

interface HeadCell {
    id: keyof BusStand;
    label: string;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'code', label: 'Code', sortable: true },
    { id: 'location', label: 'District', sortable: false },
    { id: 'district', label: 'Location', sortable: true },
];

export default function BusStandPage() {
    const [data, setData] = useState<BusStand[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [total, setTotal] = React.useState(0);
    const [editingBusstand, setEditingBusStand] = React.useState<BusStand | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBusStandID, setSelectedBusStandID] = useState<string | null>(null);

    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof BusStand>('name');
    const [filterSearch, setFilterSearch] = React.useState('');
    const [filterDistrict, setFilterDistrict] = React.useState('all');
    const [debouncedSearch, setDebouncedSearch] = React.useState(filterSearch);

    const refresh = () => {
        fetchBusStands();
    };

    const fetchBusStands = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                sort: orderBy,
                order: order,
            });

            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }
            if (filterDistrict !== 'all') {
                params.append('district', filterDistrict);
            }

            const res = await fetch(`/api/getbusstands?${params.toString()}`);
            const result = await res.json();
            setData(result.data || []);
            setTotal(result.pagination?.total || 0);
        } catch (error) {
            console.error("Error fetching bus stands:", error);
            toast.error("Failed to fetch bus stands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filterSearch);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [filterSearch]);

    useEffect(() => {
        fetchBusStands();
    }, [page, rowsPerPage, order, orderBy, debouncedSearch, filterDistrict]);

    const handleRequestSort = (property: keyof BusStand) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const confirmDelete = (id: string) => {
        setSelectedBusStandID(id);
        setDeleteDialogOpen(true);
    };

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const deleteBusStand = async () => {
        if (!selectedBusStandID) return;

        try {
            const res = await fetch(`/api/busstand/${selectedBusStandID}`, { method: "DELETE" });
            const result = await res.json();

            if (result.success) {
                toast.success("Bus Stand deleted successfully");
                refresh();
            } else {
                toast.error(result.message || "Failed to delete");
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Delete request failed");
        } finally {
            setDeleteDialogOpen(false);
            setSelectedBusStandID(null);
        }
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#E3E3E3", height: "calc(100% - 64px)" }}>
                <Accordion sx={{ mt: 3, mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="600">Add Bus Stand</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AddBusStand refresh={refresh} setFilterDistrict={setFilterDistrict} />
                    </AccordionDetails>
                </Accordion>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <TextField
                        label="Search by Name, Code, or District"
                        variant="outlined"
                        size="small"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        sx={{
                            flexGrow: 1,
                            minWidth: '250px',
                            maxWidth: '400px',
                            bgcolor: 'background.paper'
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={filterDistrict}
                            label="Location"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterDistrict(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Locations</MenuItem>
                            {gujaratCities.Gujarat.sort().map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    {loading ? (
                        <TableSkeleton columns={6}></TableSkeleton>
                    ) : (
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader sx={{ minWidth: 900 }}>
                                <TableHead sx={{ background: "#E5E5E5" }}>
                                    <TableRow>
                                        {headCells.map((headCell) => (
                                            <TableCell
                                                key={headCell.id}
                                                sortDirection={orderBy === headCell.id ? order : false}
                                                sx={{ fontWeight: '600' }}
                                            >
                                                {headCell.sortable ? (
                                                    <TableSortLabel
                                                        active={orderBy === headCell.id}
                                                        direction={orderBy === headCell.id ? order : 'asc'}
                                                        onClick={() => handleRequestSort(headCell.id)}
                                                    >
                                                        {headCell.label}
                                                    </TableSortLabel>
                                                ) : (
                                                    headCell.label
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((b) => (
                                        <TableRow key={b._id} hover>
                                            <TableCell>{b.name}</TableCell>
                                            <TableCell>{b.code}</TableCell>
                                            <TableCell>{b.location}</TableCell>
                                            <TableCell>{b.district || "-"}</TableCell>
                                            <TableCell style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                                                <FiEdit size={20} style={{ cursor: "pointer" }} onClick={() => setEditingBusStand(b)} />
                                                <MdDeleteOutline size={20} style={{ cursor: "pointer", color: "red" }} onClick={() => confirmDelete(b._id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No bus stands found for these filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {editingBusstand && (
                                <EditBusStandModal
                                    busStand={editingBusstand}
                                    onClose={() => setEditingBusStand(null)}
                                    refresh={refresh}
                                />
                            )}
                        </TableContainer>
                    )}
                    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                        <DialogTitle>Delete Bus Stand</DialogTitle>
                        <DialogContent>
                            <Typography>Are you sure you want to delete this bus stand?</Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", gap: "10px", width: "100%" }}>
                                <Button
                                    sx={{ flex: 1, borderRadius: 0, color: "black", border: "1px solid black" }}
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    sx={{ flex: 1, borderRadius: 0, color: "white", border: "1px solid black", bgcolor: "red", "&:hover": { bgcolor: "#d32f2f" } }}
                                    onClick={deleteBusStand}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </DialogActions>
                    </Dialog>

                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Paper>
            </Box>
        </AdminLayout>
    );
}