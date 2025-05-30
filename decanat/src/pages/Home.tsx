import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';
import { 
  Box, Typography, Button, Paper, Container, Avatar,
  CircularProgress, Snackbar, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UploadIcon from '@mui/icons-material/Upload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import { addCourse, getCourses, getProgramms, uploadFile } from '../api/api';

interface Course {
  name: string;
}

interface Program {
  name: string;
}

export default function Home() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState({
    courses: false,
    programs: false,
    upload: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        console.log(`failed to fetch userData ${err}`)
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchData = async () => {
    if (activeTab === 0) {
      await fetchCourses();
    } else {
      await fetchPrograms();
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading({...loading, courses: true});
      const courses = await getCourses();
      setCourses(courses);
    } catch (err) {
        console.log(`failed to fetch courses ${err}`)
        showError('Не удалось загрузить список курсов');
    } finally {
      setLoading({...loading, courses: false});
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading({...loading, programs: true});
      const programms = await getProgramms();
      setPrograms(programms);
    } catch (err) {
        console.log(`failed to fetch programms ${err}`)
        showError('Не удалось загрузить список программ');
    } finally {
      setLoading({...loading, programs: false});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        console.log(`Error type was given: ${file.type}`)
      showError('Пожалуйста, загрузите файл в формате PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        setLoading({...loading, upload: true});
        await uploadFile(formData)
        showSuccess('Файл успешно загружен');
        fetchPrograms();
    } catch (err) {
        console.log(`failed to load file ${err}`)
        showError('Ошибка при загрузке файла');
    } finally {
        setLoading({...loading, upload: false});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleAddCourse = async () => {
    try {
        const status = await addCourse({name: newCourseName})
        
        if (status.status == 'success'){
            showSuccess('Курс успешно добавлен');
        }
        else {
            showError('Ошибка при добавлении курса');      
        }
        setNewCourseDialog(false);
        setNewCourseName('');
        fetchCourses();
    
    } catch (err) {
        console.log(`failed to set new course ${err}`)
        showError('Ошибка при добавлении курса');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const showError = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
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

          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Курсы" />
            <Tab label="Образовательные программы" />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {activeTab === 0 && user.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNewCourseDialog(true)}
              >
                Добавить курс
              </Button>
            )}
            
            {activeTab === 1 && user.role === 'admin' && (
              <>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={triggerFileInput}
                  disabled={loading.upload}
                >
                  {loading.upload ? <CircularProgress size={24} /> : 'Загрузить программу'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
              </>
            )}

            <Button
              variant="contained"
              startIcon={<ListAltIcon />}
              onClick={fetchData}
              disabled={loading.courses || loading.programs}
            >
              Обновить данные
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

          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Название курса</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.courses ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : courses.length > 0 ? (
                    courses.map((course, index) => (
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{course.name}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        Нет данных о курсах
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Название программы</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.programs ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : programs.length > 0 ? (
                    programs.map((program, index) => (
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{program.name}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Нет данных о программах
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Dialog open={newCourseDialog} onClose={() => setNewCourseDialog(false)}>
        <DialogTitle>Добавить новый курс</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название курса"
            fullWidth
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCourseDialog(false)}>Отмена</Button>
          <Button onClick={handleAddCourse} disabled={!newCourseName}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

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