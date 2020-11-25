import {
    Add,
    Assignment,
    CalendarToday,
    Dashboard,
    Logout,
    MedicalServices,
    Menu as MenuIcon,
    People,
    Settings
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleProfile = () => {
    navigate(user?.userType === 'doctor' ? '/doctor/profile' : '/profile');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    // Navigate to settings page
    handleProfileMenuClose();
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    if (user?.userType === 'doctor') {
      return [
        {
          text: 'Dashboard',
          icon: <Dashboard />,
          path: '/doctor/dashboard',
        },
        {
          text: 'Appointments',
          icon: <CalendarToday />,
          path: '/doctor/appointments',
        },
        {
          text: 'Patients',
          icon: <People />,
          path: '/doctor/patients',
        },
      ];
    } else {
      return [
        {
          text: 'Dashboard',
          icon: <Dashboard />,
          path: '/dashboard',
        },
        {
          text: 'Appointments',
          icon: <CalendarToday />,
          path: '/appointments',
        },
        {
          text: 'Book Appointment',
          icon: <Add />,
          path: '/appointments/book',
        },
        {
          text: 'Medical History',
          icon: <Assignment />,
          path: '/medical-history',
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <Box>
      <Toolbar>
        <Box display="flex" alignItems="center">
          <MedicalServices sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" noWrap component="div" color="primary">
            Meditrack
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Meditrack'}
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.name}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <Settings fontSize="small" sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;

