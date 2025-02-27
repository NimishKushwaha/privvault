import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, error } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Attempting to log in with:', { email, password })
    
    // Disable the button immediately
    setIsLoading(true)

    try {
      await login(email, password)
      console.log('Login successful')
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setIsLoading(false) // Re-enable the button after the attempt
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden' // Prevent any scrolling
      }}
    >
      <Paper
        elevation={20}
        sx={{
          borderRadius: 2,
          width: '100%',
          maxWidth: { xs: '90%', sm: 450 },
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #283593 0%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LockIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: 'white' }} />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            color="white"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              lineHeight: 1.2 
            }}
          >
            PrivVault
          </Typography>
        </Box>
        <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            textAlign="center" 
            color="text.secondary"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Secure Access
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size={isMobile ? "small" : "medium"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: { xs: 1, sm: 1.5 },
                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)',
                },
                position: 'relative', // Add this
                minHeight: 36 // Add this to maintain button height
              }}
              disabled={isLoading}
              size={isMobile ? "medium" : "large"}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              ) : 'Sign In'}
            </Button>
          </form>
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
                borderRadius: 'inherit'
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {/* <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: 'center',
              color: 'text.secondary',
              p: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Demo credentials: admin@privvault.com / admin123
          </Typography> */}
        </CardContent>
      </Paper>
    </Box>
  )
}