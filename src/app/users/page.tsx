"use client";
import React, { useEffect, useState } from 'react'
import AdminLayout from '../adminnavbar/layout'
import AddUsers from './AddUsers'
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
    CircularProgress,
    TablePagination,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel,
    SelectChangeEvent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FiEdit } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import toast from 'react-hot-toast';
import EditUsersModal from './EditUsersModal';
import TableSkeleton from '../skeletons/TableSkeleton';

type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
    coverImage?: string;
    createdAt: string;
};

interface HeadCell {
    id: keyof User;
    label: string;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role', sortable: true },
    { id: 'createdAt', label: 'Joined', sortable: true },
];

function Page() {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof User>('createdAt');
    const [filterSearch, setFilterSearch] = React.useState('');
    const [filterRole, setFilterRole] = React.useState('all');
    const [debouncedSearch, setDebouncedSearch] = React.useState(filterSearch);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                sort: orderBy,
                order: order,
            });

            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }
            if (filterRole !== 'all') {
                params.append('role', filterRole);
            }
            
            const res = await fetch(`/api/getusers?${params.toString()}`);
            const data = await res.json();
            setUsers(data.data || []);
            setTotal(data.pagination?.total || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
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
        fetchUsers();
    }, [page, rowsPerPage, order, orderBy, debouncedSearch, filterRole]);

    const refresh = () => {
        fetchUsers();
    };

    const handleOpenDelete = (user: User) => {
        setDeletingUser(user);
        setIsConfirmOpen(true);
    };

    const handleCloseDelete = () => {
        if (isDeleteLoading) return;
        setDeletingUser(null);
        setIsConfirmOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!deletingUser) return;
        setIsDeleteLoading(true);
        try {
            const res = await fetch(`/api/users/${deletingUser._id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                toast.success("User deleted successfully");
                refresh();
            } else {
                toast.error(data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsDeleteLoading(false);
            handleCloseDelete();
        }
    };
    
    const handleRequestSort = (property: keyof User) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3, bgcolor: "#E3E3E3", height: "calc(100% - 64px)", overflowY: 'auto' }}>
                <Accordion sx={{ mt: 3, mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="600">Add User</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AddUsers refresh={refresh} />
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
                        label="Search by Name or Email"
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
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={filterRole}
                            label="Role"
                            onChange={(e: SelectChangeEvent<string>) => {
                                setFilterRole(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="all">All Roles</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    {loading ? (
                        <TableSkeleton columns={6} rows={rowsPerPage} />
                    ) : (
                        <>
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader>
                                    <TableHead sx={{ background: "#E5E5E5" }}>
                                        <TableRow>
                                            <TableCell>Cover Image</TableCell>
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
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user._id} hover>
                                                    <TableCell>
                                                        <Avatar
                                                            src={user.coverImage}
                                                            sx={{ width: 50, height: 50, border: "1px solid #E3E3E3", fontSize: '2.5rem', bgcolor: 'primary.main' }}
                                                        ></Avatar>
                                                    </TableCell>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.role}
                                                            color={user.role === "admin" ? "success" : "secondary"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setEditingUser(user)}
                                                            >
                                                                <FiEdit />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleOpenDelete(user)}
                                                            >
                                                                <MdDeleteOutline />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={total}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {editingUser && (
                <EditUsersModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    refresh={refresh}
                />
            )}

            <Dialog
                open={isConfirmOpen}
                onClose={handleCloseDelete}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the user
                        <Typography component="span" fontWeight="bold"> {deletingUser?.name} </Typography>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDelete} disabled={isDeleteLoading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleteLoading}
                        sx={{ minWidth: 90 }}
                    >
                        {isDeleteLoading ? <CircularProgress size={24} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default Page;