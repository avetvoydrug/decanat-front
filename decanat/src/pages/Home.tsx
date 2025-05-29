import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';
import { 
  Box, Typography, Button, Paper, Container, Avatar,
  CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UploadIcon from '@mui/icons-material/Upload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { uploadFile, getCourses } from '../api/api';

interface Course {
    name: string
}

export default function Home() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchCourses  = async () => {
    setCoursesLoading(true);
    const courses = await getCourses();
    setCourses(courses);
    setCoursesLoading(false);
    return courses;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, загрузите файл в формате PDF',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const responseStatus = await uploadFile(formData);
      if (responseStatus.status == "success" ){
        setSnackbar({
            open: true,
            message: 'Файл успешно загружен',
            severity: 'success'
          });
      }
      else {
        setSnackbar({
            open: true,
            message: 'Ошибка при загрузке файла',
            severity: 'error'
          });
    }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Ошибка при загрузке файла',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, mb: 2 }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Добро пожаловать, {user.username}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Ваша роль: {user.role}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={triggerFileInput}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Загрузить образовательную программу'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<ListAltIcon />}
              onClick={fetchCourses}
              disabled={coursesLoading}
            >
              {coursesLoading ? <CircularProgress size={24} /> : 'Показать курсы'}
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </Box>
          {courses.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Название курса</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{course.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}