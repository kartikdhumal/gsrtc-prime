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
import AddBus from "./AddBus";
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast";
import EditBusModal from "./EditBusModal";
import Loader from "../loaders/Loader";
import TableSkeleton from "../skeletons/TableSkeleton";

type BusFormData = {
    _id: string,
    name: string;
    code: string;
    type: string;
    totalSeats: number;
    sleeperSeats?: number;
    seatingSeats?: number;
    isAirconditioned: boolean;
    status: "Active" | "Inactive";
};

interface HeadCell {
    id: keyof BusFormData;
    label: string;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'code', label: 'Code', sortable: true },
    { id: 'type', label: 'Type', sortable: true },
    { id: 'totalSeats', label: 'Total Seats', sortable: true },
    { id: 'sleeperSeats', label: 'Sleeper Seats', sortable: true },
    { id: 'seatingSeats', label: 'Seating Seats', sortable: true },
    { id: 'isAirconditioned', label: 'AC', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
];

export default function BusPage() {
    const [data, setData] = useState<BusFormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [total, setTotal] = React.useState(0);
    const [editingBus, setEditingBus] = React.useState<BusFormData | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBusID, setSelectedBusID] = useState<string | null>(null);

    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof BusFormData>('name');
    const [filterSearch, setFilterSearch] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterACType, setFilterACType] = React.useState('all');
    const [debouncedSearch, setDebouncedSearch] = React.useState(filterSearch);

    const refresh = () => {
        fetchBuses();
    };

    const fetchBuses = async () => {
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
            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }
            if (filterACType !== 'all') {
                params.append('isAirconditioned', filterACType);
            }

            const res = await fetch(`/api/getbuses?${params.toString()}`);
            const result = await res.json();
            setData(result.data || []);
            setTotal(result.pagination?.total || 0);
        } catch (error) {
            console.error("Error fetching buses:", error);
            toast.error("Failed to fetch buses");
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
        fetchBuses();
    }, [page, rowsPerPage, order, orderBy, debouncedSearch, filterStatus, filterACType]);

    const handleRequestSort = (property: keyof BusFormData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const confirmDelete = (id: string) => {
        setSelectedBusID(id);
        setDeleteDialogOpen(true);
    };

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const deleteBus = async () => {
        if (!selectedBusID) return;

        try {
            const res = await fetch(`/api/bus/${selectedBusID}`, { method: "DELETE" });
            const result = await res.json();

            if (result.success) {
                toast.success("Bus deleted successfully");
                refresh();
            } else {
                toast.error(result.message || "Failed to delete");
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Delete request failed");
        } finally {
            setDeleteDialogOpen(false);
            setSelectedBusID(null);
        }
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#E3E3E3", height: "calc(100% - 64px)" }}>
                <Accordion sx={{ mt: 3, mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="600">Add Bus</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AddBus refresh={refresh} />
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
                        label="Search by Name, Code, or Type"
                        variant="outlined"
                        size="small"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        sx={{
                            flexGrow: 1,
                            minWidth: '250px',
                            maxWidth: '300px',
                            bgcolor: 'background.paper'
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            label="Status"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterStatus(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
                        <InputLabel>AC Type</InputLabel>
                        <Select
                            value={filterACType}
                            label="AC Type"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterACType(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">AC types</MenuItem>
                            <MenuItem value="true">AC</MenuItem>
                            <MenuItem value="false">Non-AC</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    {loading ? (
                        // <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        //     <Loader />
                        // </Box>
                        <TableSkeleton columns={10}></TableSkeleton>
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
                                            <TableCell>{b.type}</TableCell>
                                            <TableCell>{b.totalSeats}</TableCell>
                                            <TableCell width={"10%"}>{b.sleeperSeats || 0}</TableCell>
                                            <TableCell width={"10%"}>{b.seatingSeats || 0}</TableCell>
                                            <TableCell>
                                                <p style={{ backgroundColor: b.isAirconditioned ? "#29B6F6" : "#DDA221", textAlign: "center", width:"100%" , padding:"0px 2px" , borderRadius:"3px"}}>{b.isAirconditioned ? "AC" : "NON-AC"}</p>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color: b.status === 'Active' ? '#388e3c' : '#d32f2f',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {b.status}
                                            </TableCell>
                                            <TableCell style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                                                <FiEdit size={20} style={{ cursor: "pointer" }} onClick={() => setEditingBus(b)} />
                                                <MdDeleteOutline size={20} style={{ cursor: "pointer", color: "red" }} onClick={() => confirmDelete(b._id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                No buses found for these filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {editingBus && (
                                <EditBusModal
                                    BusFormData={editingBus}
                                    onClose={() => setEditingBus(null)}
                                    refresh={refresh}
                                />
                            )}
                        </TableContainer>
                    )}
                    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                        <DialogTitle>Delete Bus</DialogTitle>
                        <DialogContent>
                            <Typography>Are you sure you want to delete this bus?</Typography>
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
                                    onClick={deleteBus}
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