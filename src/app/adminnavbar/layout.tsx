// components/layout/AdminLayout.tsx

"use client";
import React, { useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// MUI Imports
import {
    AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Popover,
    Tooltip, CssBaseline, useTheme,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import { MdAccountCircle, MdDashboard, MdDirectionsBus, MdFeedback, MdLibraryBooks, MdLogout } from "react-icons/md";
import {
    FiUsers, FiMapPin, FiCompass, FiBarChart2, FiTruck, FiUserCheck
} from "react-icons/fi"; 
import { useNavigate } from "react-router-dom";

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

const navItems = [
    { label: "Dashboard", path: "/admindashboard", icon: <MdDashboard size={22}/> },
    { label: "Conductors", path: "/conductor", icon: <FiUserCheck size={22} /> },
    { label: "Stands", path: "/busstand", icon: <FiMapPin size={22} /> },
    { label: "Bus", path: "/bus", icon: <MdDirectionsBus size={22} /> },
    { label: "Routes", path: "/routes", icon: <FiCompass size={22} /> },
    { label: "Users", path: "/users", icon: <FiUsers size={22} /> },
    { label: "Boooking", path: "/booking", icon: <MdLibraryBooks size={22} /> },
    { label: "Reports", path: "/reports", icon: <FiBarChart2 size={22} /> },
    { label: "feedback", path: "/feedback", icon: <MdFeedback size={22} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const navigate = useNavigate();
    const theme = useTheme();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const user = useAuthGuard();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleSidebarToggle = () => setIsCollapsed(!isCollapsed);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleEditProfile = () => {
        navigate('/editprofile');
        handleMenuClose();
    };

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        handleMenuClose();
        navigate("/login");
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: 3.5,
                }}
            >
                <Image src="/images/gsrtclogo.png" width={40} height={40} alt="GSRTC logo" />
                {!isCollapsed && (
                    <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
                        GSRTC
                    </Typography>
                )}
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(227, 227, 227, 0.2)' }} />
            <List sx={{ p: 2, flexGrow: 1 }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItem key={item.label} disablePadding sx={{ display: "block", mb: 1 }}>
                            <Tooltip title={isCollapsed ? item.label : ''} placement="right">
                                <ListItemButton
                                    component={Link}
                                    href={item.path}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: isCollapsed ? "center" : "initial",
                                        px: 2.5,
                                        borderRadius: '12px',
                                        bgcolor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        color: isActive ? '#fff' : 'rgba(227, 227, 227, 0.8)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: 0,
                                        mr: isCollapsed ? "auto" : 1,
                                        justifyContent: "center",
                                        color: 'inherit'
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} sx={{ opacity: isCollapsed ? 0 : 1, whiteSpace: 'nowrap' }} />
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>
            {/* <Box sx={{ display: { xs: 'none', md: 'flex' , justifyContent:'center' , flexDirection:"column" , alignItems:"center"} }}>
                <Divider sx={{ borderColor: 'rgba(227, 227, 227, 0.2)' }} />
                <Toolbar sx={{ justifyContent: 'center' }}>
                    <IconButton onClick={handleSidebarToggle} sx={{ color: '#e3e3e3' }}>
                        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </Toolbar>
            </Box> */}
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: '100vh', bgcolor: '#f4f6f8' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${isCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
                    ml: { md: `${isCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: '#212153',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* --- START: CORRECTED TOOLBAR --- */}
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: "none" } , color:"#E3E3E3" }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    {/* This Box acts as a spacer, pushing the profile icon to the right */}
                    <Box sx={{ flexGrow: 1 }} />

                    <Box>
                        <Tooltip title="Profile Settings">
                            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                                <Avatar alt={user?.name} src={user?.coverImage || './defaultimage.jpg'}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                sx: {
                                    minWidth: 240,
                                    borderRadius:5,
                                    backgroundColor:"#212153",
                                    border:"1px solid #e3e3e3",
                                    color:"#E3e3e3",
                                    boxShadow: '0px 10px 30px rgba(0,0,0,0.12)',
                                    mt: 1.5,
                                    p: 1
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
                                <Typography variant="body2" >{user?.email}</Typography>
                            </Box>
                            <Divider />
                            <List>
                                <ListItemButton onClick={handleEditProfile} sx={{ borderRadius: 2 }}>
                                    <ListItemIcon><MdAccountCircle size={22} color="#e3e3e3" /></ListItemIcon>
                                    <ListItemText>Edit Profile</ListItemText>
                                </ListItemButton>
                                <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2  }}>
                                    <ListItemIcon><MdLogout size={22} color="#E3E3E3"/></ListItemIcon>
                                    <ListItemText color="#E3E3E3">Logout</ListItemText>
                                </ListItemButton>
                            </List>
                        </Popover>
                    </Box>
                </Toolbar>
                {/* --- END: CORRECTED TOOLBAR --- */}
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: isCollapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            bgcolor: '#212153',
                            color: '#e3e3e3',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            borderRight: 'none',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
                            bgcolor: '#212153',
                            color: '#e3e3e3',
                            borderRight: 'none',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${isCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
                }}
            >
                <Toolbar /> 
                {children}
            </Box>
        </Box>
    );
}