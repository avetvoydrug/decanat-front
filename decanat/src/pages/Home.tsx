import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';
import { 
  Box, Typography, Button, Paper, Container, Avatar,
  CircularProgress, Snackbar, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UploadIcon from '@mui/icons-material/Upload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import { getCourses, getProgramms, uploadFile, getPayingStudents, getHostelInfo } from '../api/api';

interface Course {
  name: string;
}

interface Program {
  name: string;
}

interface Student {
  name: string;
}

interface Hostel {
  name: string;
  address: string;
  floor: string;
  room: string;
  commander_name: string;
}

export default function Home() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [payingStudents, setPayingStudents] = useState<Student[]>([]);
  const [hostelInfo, setHostelInfo] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState({
    courses: false,
    programs: false,
    students: false,
    hostel: false,
    upload: false,
    payment: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [newCourseDialog, setNewCourseDialog] = useState(false);
  const courseFileInputRef = useRef<HTMLInputElement>(null);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        console.log(`Failed to fetch userData ${err}`);
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (user.role !== 'admin') {
        fetchHostelInfo();
      }
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    switch (activeTab) {
      case 0:
        await fetchCourses();
        break;
      case 1:
        if (user?.role === 'admin') await fetchPrograms();
        break;
      case 2:
        if (user?.role === 'admin') await fetchPayingStudents();
        else await fetchHostelInfo();
        break;
      default:
        break;
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading({...loading, courses: true});
      const courses = await getCourses();
      setCourses(courses);
    } catch (err) {
      console.log(`Failed to fetch courses ${err}`);
      showError('Не удалось загрузить список курсов');
    } finally {
      setLoading({...loading, courses: false});
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading({...loading, programs: true});
      const programs = await getProgramms();
      setPrograms(programs);
    } catch (err) {
      console.log(`Failed to fetch programs ${err}`);
      showError('Не удалось загрузить список программ');
    } finally {
      setLoading({...loading, programs: false});
    }
  };

  const fetchPayingStudents = async () => {
    try {
      setLoading({...loading, students: true});
      const students = await getPayingStudents();
      setPayingStudents(students);
    } catch (err) {
      console.log(`Failed to fetch paying students ${err}`);
      showError('Не удалось загрузить список платников');
    } finally {
      setLoading({...loading, students: false});
    }
  };

  const fetchHostelInfo = async () => {
    try {
      setLoading({...loading, hostel: true});
      const info = await getHostelInfo();
      setHostelInfo(info);
    } catch (err) {
      console.log(`Failed to fetch hostel info ${err}`);
      showError('Не удалось загрузить информацию об общежитии');
    } finally {
      setLoading({...loading, hostel: false});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'program' | 'course' | 'payment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = {
      program: 'application/pdf',
      course: 'application/pdf',
      payment: 'image/png'
    };

    if (file.type !== validTypes[type]) {
      showError(`Пожалуйста, загрузите файл в формате ${type === 'payment' ? 'PNG' : 'PDF'}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading({...loading, upload: true});
      let response;
      
      if (type === 'program') {
        response = await uploadFile(formData);
      } else if (type === 'course') {
        response = await uploadFile(formData);
      } else {
        response = await uploadFile(formData);
      }

      if (response.status === 'success') {
        showSuccess('Файл успешно загружен');
        if (type === 'program') fetchPrograms();
        if (type === 'course') fetchCourses();
      } else {
        showError('Ошибка при загрузке файла');
      }
    } catch (err) {
      console.log(`Failed to upload file ${err}`);
      showError('Ошибка при загрузке файла');
    } finally {
      setLoading({...loading, upload: false});
      const ref = type === 'payment' ? paymentFileInputRef : courseFileInputRef;
      if (ref.current) {
        ref.current.value = '';
      }
    }
  };

  const triggerFileInput = (type: 'program' | 'course' | 'payment') => {
    const ref = type === 'payment' ? paymentFileInputRef : courseFileInputRef;
    ref.current?.click();
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

  const adminTabs = [
    { label: 'Курсы', icon: <ListAltIcon /> },
    { label: 'Образовательные программы', icon: <UploadIcon /> },
    { label: 'Платники на семестр', icon: <PeopleIcon /> }
  ];

  const studentTabs = [
    { label: 'Курсы', icon: <ListAltIcon /> },
    { label: 'Приложить квитанцию', icon: <ReceiptIcon /> },
    { label: 'Моё общежитие', icon: <HomeIcon /> }
  ];

  const tabs = user.role === 'admin' ? adminTabs : studentTabs;

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
            variant="fullWidth"
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} icon={tab.icon} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {/* Admin buttons */}
            {user.role === 'admin' && activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => triggerFileInput('course')}
                disabled={loading.upload}
              >
                {loading.upload ? <CircularProgress size={24} /> : 'Добавить курс'}
              </Button>
            )}
            
            {user.role === 'admin' && activeTab === 1 && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => triggerFileInput('program')}
                disabled={loading.upload}
              >
                {loading.upload ? <CircularProgress size={24} /> : 'Загрузить программу'}
              </Button>
            )}

            {/* Student buttons */}
            {user.role !== 'admin' && activeTab === 1 && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => triggerFileInput('payment')}
                disabled={loading.payment}
              >
                {loading.payment ? <CircularProgress size={24} /> : 'Приложить квитанцию'}
              </Button>
            )}
            {user.role !== 'admin' && activeTab !== 1 && (
                <Button
                    variant="contained"
                    startIcon={<ListAltIcon />}
                    onClick={fetchData}
                    disabled={
                        loading.courses || 
                        loading.programs || 
                        loading.students || 
                        loading.hostel
                    }
                    >
                    Обновить данные
                </Button>
            )}

            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </Box>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={courseFileInputRef}
            onChange={(e) => handleFileUpload(e, 'course')}
            accept=".pdf"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={paymentFileInputRef}
            onChange={(e) => handleFileUpload(e, 'payment')}
            accept=".png"
            style={{ display: 'none' }}
          />

          {/* Courses tab */}
          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Название курса</TableCell>
                    {user.role === 'admin' && <TableCell>Действия</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.courses ? (
                    <TableRow>
                      <TableCell colSpan={user.role === 'admin' ? 3 : 2} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : courses.length > 0 ? (
                    courses.map((course, index) => (
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        {user.role === 'admin' && (
                          <TableCell>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => console.log('Delete course', course)}
                            >
                              Удалить
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={user.role === 'admin' ? 3 : 2} align="center">
                        Нет данных о курсах
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Programs tab (admin) or Payment tab (student) */}
          {activeTab === 1 && (
            user.role === 'admin' ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Название программы</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading.programs ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : programs.length > 0 ? (
                      programs.map((program, index) => (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{program.name}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => console.log('Delete program', program)}
                            >
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Нет данных о программах
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Приложите скан квитанции об оплате
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Формат: PNG
                </Typography>
              </Box>
            )
          )}

          {/* Paying students tab (admin) or Hostel tab (student) */}
          {activeTab === 2 && (
            user.role === 'admin' ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Имя студента</TableCell>
                      <TableCell>Статус оплаты</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading.students ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : payingStudents.length > 0 ? (
                      payingStudents.map((student, index) => (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              color="success"
                              onClick={() => console.log('Confirm payment', student)}
                            >
                              Подтвердить оплату
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          Нет данных о платниках
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 3 }}>
                {loading.hostel ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : hostelInfo ? (
                  <Box sx={{ lineHeight: 2 }}>
                    <Typography variant="h6">Информация об общежитии:</Typography>
                    <Typography><strong>Название:</strong> {hostelInfo.name}</Typography>
                    <Typography><strong>Адрес:</strong> {hostelInfo.address}</Typography>
                    <Typography><strong>Этаж:</strong> {hostelInfo.floor}</Typography>
                    <Typography><strong>Комната:</strong> {hostelInfo.room}</Typography>
                    <Typography><strong>Комендант:</strong> {hostelInfo.commander_name}</Typography>
                  </Box>
                ) : (
                  <Typography>Нет информации об общежитии</Typography>
                )}
              </Paper>
            )
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