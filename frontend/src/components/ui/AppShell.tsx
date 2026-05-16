import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useAuthStore } from '../../store/authStore'
import { SyncStatusIndicator } from './SyncStatusIndicator'

const DRAWER_WIDTH = 220

// Inline SVG icons — no @mui/icons-material dependency needed
const MenuIcon = () => (
  <SvgIcon><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></SvgIcon>
)
const POSIcon = () => (
  <SvgIcon><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z" /></SvgIcon>
)
const ProductIcon = () => (
  <SvgIcon><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.47 0 12.36 0c-1.73 0-3.24.86-4.19 2.18L12 6H4L2 8l2 12h16l2-12-2-2zM12.36 2c1.28 0 2.32 1.04 2.32 2.32 0 .48-.14.93-.38 1.32L12 9.5 9.7 5.64A2.32 2.32 0 0 1 9.32 4.32C9.32 3.04 10.36 2 11.64 2h.72z" /></SvgIcon>
)
const DebtIcon = () => (
  <SvgIcon><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></SvgIcon>
)
const ReportIcon = () => (
  <SvgIcon><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" /></SvgIcon>
)
const SettingsIcon = () => (
  <SvgIcon><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></SvgIcon>
)
const LogoutIcon = () => (
  <SvgIcon><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></SvgIcon>
)

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Bán hàng', path: '/', icon: <POSIcon /> },
  { label: 'Sản phẩm', path: '/products', icon: <ProductIcon /> },
  { label: 'Công nợ', path: '/debt', icon: <DebtIcon />, ownerOnly: true },
  { label: 'Báo cáo', path: '/reports', icon: <ReportIcon />, ownerOnly: true },
  { label: 'Cài đặt', path: '/settings', icon: <SettingsIcon />, ownerOnly: true },
]

export function AppShell() {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.up('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const role = useAuthStore((s) => s.role)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter((item) => !item.ownerOnly || role === 'OWNER')

  function handleNav(path: string) {
    navigate(path)
    setDrawerOpen(false)
  }

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          🛒 GroceryStore
        </Typography>
      </Toolbar>

      <List sx={{ flex: 1, px: 1 }}>
        {visibleItems.map((item) => {
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>

      <List sx={{ px: 1, pb: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItemButton>
      </List>
    </Box>
  )

  const tabIndex = visibleItems.findIndex((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'primary.main',
          color: '#fff',
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          {!isTablet && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: '#fff' }}
              aria-label="Mở menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ flexGrow: 1, color: '#fff', display: isTablet ? 'none' : 'block' }}
          >
            🛒 GroceryStore
          </Typography>
          <SyncStatusIndicator />
        </Toolbar>
      </AppBar>

      {/* Sidebar — permanent on tablet, temporary drawer on phone */}
      {isTablet ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: '64px',
          mb: isTablet ? 0 : '56px',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom tab bar — phone only */}
      {!isTablet && (
        <BottomNavigation
          value={tabIndex === -1 ? 0 : tabIndex}
          onChange={(_, newIndex) => handleNav(visibleItems[newIndex].path)}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.appBar,
          }}
        >
          {visibleItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{ '&.Mui-selected': { color: 'primary.main' }, minWidth: 0 }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  )
}
