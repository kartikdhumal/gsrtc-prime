"use client"
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Link from 'next/link';

const Navbar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerOpen = () => {
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    const drawerContent = (
        <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerClose} onKeyDown={handleDrawerClose}>
            <List>
                {['Home', 'About Us', 'Services', 'Contact'].map((text) => (
                    <ListItem key={text} component="button">
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#e3e3e3", color: 'text.primary', boxShadow: 'md' }}>
                <Toolbar sx={{ justifyContent: isMobile ? 'space-between' : 'flex-start', padding: "10px" }}>
                    {isMobile && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleDrawerOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'center' : 'left' }}>
                        <img src="/images/gsrtcfulllogo.png" alt="GSRTC Logo" style={{ height: '70px' }} />
                    </Box>
                    <Box sx={{ display: isMobile ? 'none' : 'block' }}>
                        <Link href="/register" passHref>
                            <Button
                                variant="contained"
                                sx={{
                                    mr: 2,
                                    bgcolor: '#212153',
                                    color: "#E3E3E3",
                                    '&:hover': {
                                        bgcolor: '#343478',
                                    },
                                }}
                            >
                                Register
                            </Button>
                        </Link>

                        <Link href="/login" passHref>
                            <Button
                                variant="filled"
                                sx={{
                                    borderColor: '#212153',
                                    color: '#212153',
                                    '&:hover': {
                                        borderColor: '#212153',
                                        bgcolor: 'rgba(33, 33, 83, 0.04)',
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </Link>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={handleDrawerClose}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Navbar;
