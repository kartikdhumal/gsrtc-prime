"use client"
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import AdminLayout from '../adminnavbar/layout'
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TablePagination,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel,
    SelectChangeEvent,
} from "@mui/material";
import AddRoutes from './AddRoutes'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FiEdit } from 'react-icons/fi';
import EditRoutesModal from './EditRoutesModal';
import { inrFormatter } from '@/lib/utils';
import TableSkeleton from '../skeletons/TableSkeleton';

const formatMinutesTo12Hour = (timeMinutes?: string | number): string => {
    if (timeMinutes === null || timeMinutes === undefined || timeMinutes === "") return "—";
    
    const totalMinutes = Number(timeMinutes);
    if (isNaN(totalMinutes)) return "—";

    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    
    const suffix = hours24 >= 12 ? 'PM' : 'AM';
    let displayHours = hours24 % 12;
    if (displayHours === 0) displayHours = 12;
    const paddedMins = String(minutes).padStart(2, '0');

    return `${displayHours}:${paddedMins} ${suffix}`;
};

type Conductor = {
    _id: string;
    name: string;
    employeeId: string;
    status: string;
};

type Bus = {
    _id: string;
    name: string;
    code: string;
    type: string;
    totalSeats: number;
    sleeperSeats: number;
    seatingSeats: number;
    isAirconditioned: boolean;
    status: "Active" | "Inactive";
};

type BusStand = {
    _id: string;
    name: string;
    location: string;
    code: string;
    district?: string;
};

type StandItem = {
    _id: string;
    stand: BusStand;
    sequence: number;
    arrivalTime?: string;
    departureTime?: string;
    distanceFromPrev?: number;
    fare?: {
        sleeper?: number;
        seating?: number;
    };
};

type BusRoute = {
    _id: string;
    name: string;
    code: string;
    bus: Bus;
    conductor?: Conductor;
    stands: StandItem[];
    status: "Active" | "Inactive";
    isSpecialRoute: boolean;
    festivalName?: string;
    distanceKm: number,
    totalFare: {
        seating: number;
        sleeper: number;
    },
    validFrom?: string;
    validTo?: string;
    createdAt?: string;
    updatedAt?: string;
};

interface HeadCell {
    id: keyof BusRoute | 'timings' | 'duration';
    label: string;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'code', label: 'Tripcode', sortable: false },
    { id: 'name', label: 'Route Name', sortable: true },
    { id: 'bus', label: 'Bus', sortable: false },
    { id: 'conductor', label: 'Conductor', sortable: false },
    { id: 'stands', label: 'Total Stands', sortable: false },
    { id: 'timings', label: 'Timings', sortable: false },
    { id: 'duration', label: 'Duration', sortable: false },
    { id: 'totalFare', label: 'Fare', sortable: true },
    { id: 'distanceKm', label: 'Total Distance (Km)', sortable: true },
    { id: 'isSpecialRoute', label: 'Type', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
];


function RoutesPage() {
    const [routes, setRoutes] = useState<BusRoute[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [editingBusRoute, setEditingBusRoute] = useState<BusRoute | null>(null);

    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<keyof BusRoute>('name');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterDuration, setFilterDuration] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState(filterSearch);

    const queryParams = useMemo(() => {
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
        if (filterType !== 'all') {
            params.append('isSpecialRoute', filterType);
        }
        if (filterDuration !== 'all') {
            const [min, max] = filterDuration.split('-');
            if (min) {
                params.append('minDuration', (parseInt(min) * 60).toString());
            }
            if (max) {
                params.append('maxDuration', (parseInt(max) * 60).toString());
            }
        }
        return params.toString();
    }, [page, rowsPerPage, orderBy, order, debouncedSearch, filterStatus, filterType, filterDuration]);

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/getroutes?${queryParams}`);
            const data = await res.json();
            setRoutes(data.data || []);
            setTotal(data.pagination?.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filterSearch);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [filterSearch]);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const refresh = useCallback(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleRequestSort = useCallback((property: keyof BusRoute) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const handleEdit = useCallback((route: BusRoute) => {
        const normalizedRoute = {
            ...route,
            bus: {
                ...route.bus,
                sleeperSeats: route.bus?.sleeperSeats || 0,
                seatingSeats: route.bus?.seatingSeats || 0,
            },
            distanceKm: route.distanceKm || 0,
            stands: route.stands || [],
            totalFare: {
                sleeper: route.totalFare?.sleeper || 0,
                seating: route.totalFare?.seating || 0,
            }
        };
        setEditingBusRoute(normalizedRoute);
    }, []);

    const handleCloseModal = useCallback(() => {
        setEditingBusRoute(null);
    }, []);

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#E3E3E3", height: "calc(100% - 64px)" }}>
                <Accordion sx={{ mt: 3, mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="600">Add Bus Route</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AddRoutes refresh={refresh} />
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
                        label="Search by Route Name or Code"
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
                        <InputLabel>Route Type</InputLabel>
                        <Select
                            value={filterType}
                            label="Route Type"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterType(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="false">Normal</MenuItem>
                            <MenuItem value="true">Special</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={filterDuration}
                            label="Duration"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterDuration(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Durations</MenuItem>
                            <MenuItem value="0-3">0-3 Hours</MenuItem>
                            <MenuItem value="3-6">3-6 Hours</MenuItem>
                            <MenuItem value="6-10">6-10 Hours</MenuItem>
                            <MenuItem value="10-">10+ Hours</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    {loading ? (
                        <TableSkeleton columns={headCells.length + 1} rows={rowsPerPage} />
                    ) : (
                        <>
                            <TableContainer>
                                <Table stickyHeader>
                                    <TableHead sx={{ background: "#E5E5E5" }}>
                                        <TableRow>
                                            {headCells.map((headCell) => (
                                                <TableCell
                                                    key={headCell.id.toString()}
                                                    sortDirection={orderBy === headCell.id ? order : false}
                                                    sx={{ fontWeight: '600' }}
                                                >
                                                    {headCell.sortable ? (
                                                        <TableSortLabel
                                                            active={orderBy === headCell.id}
                                                            direction={orderBy === headCell.id ? order : 'asc'}
                                                            onClick={() => handleRequestSort(headCell.id as keyof BusRoute)}
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
                                        {routes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                                                    No routes found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            routes.map((r) => {
                                                const firstStand = r.stands?.[0];
                                                const lastStand = r.stands?.[r.stands.length - 1];

                                                const startTimeString = firstStand?.departureTime;
                                                const endTimeString = lastStand?.arrivalTime;

                                                const validStartTime = startTimeString !== null && startTimeString !== undefined && startTimeString !== "";
                                                const validEndTime = endTimeString !== null && endTimeString !== undefined && endTimeString !== "";

                                                let displayTime = "—";
                                                if (validStartTime && validEndTime) {
                                                    displayTime = `${formatMinutesTo12Hour(startTimeString)} - ${formatMinutesTo12Hour(endTimeString)}`;
                                                }

                                                let displayDuration = "—";
                                                if (validStartTime && validEndTime) {
                                                    const startTimeMin = Number(startTimeString);
                                                    const endTimeMin = Number(endTimeString);

                                                    if(!isNaN(startTimeMin) && !isNaN(endTimeMin)) {
                                                        let durationInMinutes = endTimeMin - startTimeMin;
                                                        if (endTimeMin < startTimeMin) {
                                                            durationInMinutes = (1440 - startTimeMin) + endTimeMin;
                                                        }
                                                        const totalHours = durationInMinutes / 60;
                                                        displayDuration = `${totalHours.toFixed(1)} hr`;
                                                    }
                                                }
                                                
                                                return (
                                                    <TableRow key={r._id} hover>
                                                        <TableCell>{r.code}</TableCell>
                                                        <TableCell>{r.name}</TableCell>
                                                        <TableCell>{r.bus?.name || "—"}</TableCell>
                                                        <TableCell>{r.conductor?.name || "—"}</TableCell>
                                                        <TableCell>{r.stands?.length || 0}</TableCell>
                                                        
                                                        <TableCell>{displayTime}</TableCell>
                                                        <TableCell>{displayDuration}</TableCell>

                                                        <TableCell align='left'>
                                                            {
                                                                r.totalFare?.sleeper > 0 ? (
                                                                    <>
                                                                        <div style={{ textAlign: 'left', paddingRight: '1em' }}>
                                                                            {`ST - ${inrFormatter.format(r.totalFare.seating)}`}
                                                                        </div>
                                                                        <div style={{ textAlign: 'left', paddingRight: '1em' }}>
                                                                            {`SL - ${inrFormatter.format(r.totalFare.sleeper)}`}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div style={{ textAlign: 'left', paddingRight: '1em' }}>
                                                                        {`ST - ${inrFormatter.format(r.totalFare?.seating || 0)}`}
                                                                    </div>
                                                                )
                                                            }
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {r?.distanceKm + " KM"}
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            {r.isSpecialRoute ? (
                                                                <Chip label={r.festivalName || "Special"} color="warning" size="small" />
                                                            ) : (
                                                                <Chip label="Normal" color="default" size="small" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={r.status}
                                                                color={r.status === "Active" ? "success" : "error"}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <FiEdit size={20} style={{ cursor: "pointer" }} onClick={() => handleEdit(r)} />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                                {editingBusRoute && (
                                    <EditRoutesModal
                                        busRoute={editingBusRoute}
                                        onClose={handleCloseModal}
                                        refresh={refresh}
                                    />
                                )}
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={total}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 20]}
                            />
                        </>
                    )}
                </Paper>
            </Box>
        </AdminLayout>
    )
}

export default React.memo(RoutesPage);

