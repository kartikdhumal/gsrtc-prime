"use client";
import React from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Select,
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    TableSortLabel,
    SelectChangeEvent, // Added for correct event typing
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminLayout from "../adminnavbar/layout";
import AddConductor from "./AddConductor";
import toast from "react-hot-toast";
import EditConductorModal from "./EditConductorModal";
import { FiEdit } from "react-icons/fi";
import Loader from "../loaders/Loader";
import { gujaratCities } from "@/lib/utils"; // You provided this import

type Conductor = {
    _id: string;
    name: string;
    phone: string;
    address: string;
    joiningDate: string;
    status: string;
    employeeId: string;
    totalTrips?: number;
};

interface HeadCell {
    id: keyof Conductor;
    label: string;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'employeeId', label: 'Employee ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: false },
    { id: 'address', label: 'Address', sortable: false },
    { id: 'joiningDate', label: 'Joining Date', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'totalTrips', label: 'Total Trips', sortable: true },
];

export default function ConductorsPage() {
    const [data, setData] = React.useState<Conductor[]>([]);
    const [editingConductor, setEditingConductor] = React.useState<Conductor | null>(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof Conductor>('joiningDate');

    const [filterSearch, setFilterSearch] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterCity, setFilterCity] = React.useState('all'); 
    const [debouncedSearch, setDebouncedSearch] = React.useState(filterSearch);

    const refresh = () => {
        fetchConductors();
    };

    const fetchConductors = async () => {
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
            if (filterCity !== 'all') {
                params.append('city', filterCity);
            }

            const res = await fetch(`/api/getconductors?${params.toString()}`);
            const result = await res.json();
            setData(result.data || []);
            setTotal(result.pagination?.total || 0);
        } catch (error) {
            console.error("Error fetching conductors:", error);
            toast.error("Failed to fetch conductors");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/conductor/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Status updated");
                refresh();
            } else toast.error(data.message);
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filterSearch);
            setPage(0);
        }, 500); 

        return () => {
            clearTimeout(timer);
        };
    }, [filterSearch]);


    React.useEffect(() => {
        fetchConductors();
    }, [page, rowsPerPage, order, orderBy, debouncedSearch, filterStatus, filterCity]);

    const handleRequestSort = (property: keyof Conductor) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#E3E3E3", height: 'calc(100% - 64px)' }}>
                <Accordion sx={{ mt: 3, mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="600">Add Conductor</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AddConductor refresh={refresh} />
                    </AccordionDetails>
                </Accordion>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                    Conductors
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 2, 
                    alignItems: 'center', 
                    flexWrap: 'wrap' 
                }}>
                    <TextField
                        label="Search by Name, Phone, or ID"
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
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                    </FormControl>
                    
                    {/* New City Filter Dropdown */}
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
                        <InputLabel>City</InputLabel>
                        <Select
                            value={filterCity}
                            label="City"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterCity(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Cities</MenuItem>
                            {gujaratCities.Gujarat.sort().map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {loading ? (
                        <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Loader />
                        </Box>
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
                                        <TableCell sx={{ fontWeight: '600' }}>Edit</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {data.map((c) => (
                                        <TableRow key={c._id} hover>
                                            <TableCell>{c.employeeId}</TableCell>
                                            <TableCell>{c.name}</TableCell>
                                            <TableCell>{c.phone}</TableCell>
                                            <TableCell>{c.address}</TableCell>
                                            <TableCell>
                                                {new Date(c.joiningDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={c.status}
                                                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                                                    size="small"
                                                    sx={{ 
                                                        minWidth: 110,
                                                        bgcolor: c.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 
                                                                 c.status === 'inactive' ? 'rgba(244, 67, 54, 0.1)' :
                                                                 'rgba(255, 152, 0, 0.1)',
                                                        '& .MuiSelect-select': {
                                                            color: c.status === 'active' ? '#388e3c' : 
                                                                   c.status === 'inactive' ? '#d32f2f' :
                                                                   '#f57c00',
                                                            fontWeight: 500
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="active">Active</MenuItem>
                                                    <MenuItem value="inactive">Inactive</MenuItem>
                                                    <MenuItem value="suspended">Suspended</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{c.totalTrips || 0}</TableCell>
                                            <TableCell>
                                                <FiEdit 
                                                    style={{ cursor: "pointer", fontSize: '1.2rem', color: '#212153' }} 
                                                    onClick={() => setEditingConductor(c)} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                No conductors found for these filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {editingConductor && (
                                <EditConductorModal
                                    conductor={editingConductor}
                                    onClose={() => setEditingConductor(null)}
                                    refresh={refresh}
                                />
                            )}
                        </TableContainer>
                    )}
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