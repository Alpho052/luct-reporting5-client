import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBook, faUsers, faDownload, faSearch, faEye, faStar, faUser, faChartLine, faUserTie } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';

const PLDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [prls, setPrls] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseName: '',
    stream: ''
  });

  const [classForm, setClassForm] = useState({
    className: '',
    venue: '',
    scheduledTime: '',
    totalStudents: '',
    courseId: '',
    lecturerId: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
    fetchClasses();
    fetchReports();
    fetchAllReports();
    fetchAllLecturersData();
    fetchAllRatings();
    fetchPRLs();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await axios.get('/users/lecturers');
      setLecturers(response.data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    }
  };

  const fetchAllLecturersData = async () => {
    try {
      const response = await axios.get('/users');
      const lecturersData = response.data.filter(user => user.role === 'lecturer');
      setAllLecturers(lecturersData);
    } catch (error) {
      console.error('Error fetching all lecturers:', error);
    }
  };

  const fetchPRLs = async () => {
    try {
      const response = await axios.get('/users');
      const prlsData = response.data.filter(user => user.role === 'prl');
      setPrls(prlsData);
    } catch (error) {
      console.error('Error fetching PRLs:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('/reports/prl-feedback');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchAllReports = async () => {
    try {
      const response = await axios.get('/reports');
      setAllReports(response.data);
    } catch (error) {
      console.error('Error fetching all reports:', error);
    }
  };

  const fetchAllRatings = async () => {
    try {
      const response = await axios.get('/classes');
      const allClasses = response.data;
      const classIds = allClasses.map(cls => cls.id);
      
      if (classIds.length > 0) {
        const ratingsPromises = classIds.map(classId => 
          axios.get(`/ratings/class/${classId}`)
        );
        const ratingsResponses = await Promise.all(ratingsPromises);
        const allRatingsData = ratingsResponses.flatMap(response => response.data);
        setAllRatings(allRatingsData);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`/courses/${editingCourse.id}`, courseForm);
        Swal.fire('Success!', 'Course updated successfully!', 'success');
      } else {
        await axios.post('/courses', courseForm);
        Swal.fire('Success!', 'Course created successfully!', 'success');
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ courseCode: '', courseName: '', stream: '' });
      fetchCourses();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to save course', 'error');
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/classes', classForm);
      Swal.fire('Success!', 'Class created successfully!', 'success');
      setShowClassModal(false);
      setClassForm({
        className: '',
        venue: '',
        scheduledTime: '',
        totalStudents: '',
        courseId: '',
        lecturerId: ''
      });
      fetchClasses();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to create class', 'error');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      courseCode: course.courseCode,
      courseName: course.courseName,
      stream: course.stream
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/courses/${courseId}`);
        Swal.fire('Deleted!', 'Course has been deleted.', 'success');
        fetchCourses();
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete course', 'error');
      }
    }
  };

  const assignLecturer = async (courseId, lecturerId) => {
    try {
      await axios.post('/courses/assign-lecturer', { courseId, lecturerId });
      Swal.fire('Success!', 'Lecturer assigned successfully!', 'success');
      fetchCourses(); // Refresh the courses list
    } catch (error) {
      Swal.fire('Error!', 'Failed to assign lecturer', 'error');
    }
  };

  const assignPRLStream = async (prlId, stream) => {
    try {
      await axios.put(`/users/${prlId}`, { stream });
      Swal.fire('Success!', 'Stream assigned successfully!', 'success');
      fetchPRLs();
    } catch (error) {
      Swal.fire('Error!', 'Failed to assign stream', 'error');
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get('/reports/export-excel', {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      // Check if response is valid
      if (response.status !== 200) {
        throw new Error('Failed to generate report');
      }

      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `luct-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire('Success!', 'Excel report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire(
        'Error!', 
        error.response?.data?.message || 'Failed to export report. Please try again.', 
        'error'
      );
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < rating ? 'text-warning' : 'text-muted'}
        size="sm"
      />
    ));
  };

  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.stream.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllReports = allReports.filter(report =>
    report.Class?.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.User?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLecturers = allLecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRatings = allRatings.filter(rating =>
    rating.Class?.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.Class?.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.User?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPRLs = prls.filter(prl =>
    prl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prl.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prl.stream && prl.stream.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique streams from courses
  const allStreams = [...new Set(courses.map(course => course.stream))];

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Program Leader Dashboard
              </h4>
              <small>Faculty of Information Communication Technology (FICT)</small>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="courses" className="mb-4">
        {/* Courses Tab */}
        <Tab eventKey="courses" title={
          <>
            <FontAwesomeIcon icon={faBook} className="me-2" />
            Courses Management
          </>
        }>
          <Row className="mb-4">
            <Col md={6}>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => setShowCourseModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Course
                </Button>
                <Button variant="success" onClick={() => setShowClassModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Class
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">All Courses</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Stream</th>
                    <th>Assigned Lecturer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr key={course.id}>
                      <td className="fw-bold">{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>
                        <span className="badge bg-info">{course.stream}</span>
                      </td>
                      <td>
                        <Form.Select 
                          size="sm" 
                          value={course.Lecturer?.id || ''}
                          onChange={(e) => assignLecturer(course.id, e.target.value)}
                        >
                          <option value="">Assign Lecturer</option>
                          {lecturers.map(lecturer => (
                            <option key={lecturer.id} value={lecturer.id}>
                              {lecturer.name}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditCourse(course)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Classes Tab */}
        <Tab eventKey="classes" title={
          <>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Classes
          </>
        }>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">All Classes</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Venue</th>
                    <th>Time</th>
                    <th>Total Students</th>
                    <th>Stream</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(classItem => (
                    <tr key={classItem.id}>
                      <td>{classItem.className}</td>
                      <td>{classItem.Course?.courseName}</td>
                      <td>{classItem.User?.name || 'Not assigned'}</td>
                      <td>{classItem.venue}</td>
                      <td>{classItem.scheduledTime}</td>
                      <td>{classItem.totalStudents}</td>
                      <td>
                        <Badge bg="info">{classItem.Course?.stream}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Reports Tab */}
        <Tab eventKey="reports" title={
          <>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            PRL Reports
          </>
        }>
          <Row className="mb-3">
            <Col>
              <Button variant="success" onClick={exportToExcel}>
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Export to Excel
              </Button>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Reports with PRL Feedback</h5>
            </Card.Header>
            <Card.Body>
              {reports.length === 0 ? (
                <Alert variant="info">No reports with PRL feedback available</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Week</th>
                      <th>Students Present</th>
                      <th>Topic</th>
                      <th>PRL Feedback</th>
                      <th>Feedback By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>
                          <strong>{report.Class?.Course?.courseCode}</strong>
                          <br />
                          <small>{report.Class?.Course?.courseName}</small>
                        </td>
                        <td>{report.User?.name}</td>
                        <td>{report.weekOfReporting}</td>
                        <td>
                          <span className={`badge ${report.actualStudentsPresent > (report.Class?.totalStudents * 0.7) ? 'bg-success' : 'bg-warning'}`}>
                            {report.actualStudentsPresent}/{report.Class?.totalStudents}
                          </span>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '150px' }} title={report.topicTaught}>
                            {report.topicTaught}
                          </div>
                        </td>
                        <td>
                          {report.Feedbacks && report.Feedbacks.length > 0 ? (
                            <div>
                              <div className="text-truncate" style={{ maxWidth: '200px' }} title={report.Feedbacks[0].feedback}>
                                {report.Feedbacks[0].feedback}
                              </div>
                              <small className="text-muted">
                                By: {report.Feedbacks[0].User?.name}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">No feedback</span>
                          )}
                        </td>
                        <td>
                          {report.Feedbacks && report.Feedbacks.length > 0 ? (
                            <Badge bg="info">{report.Feedbacks[0].User?.name}</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{new Date(report.dateOfLecture).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Monitoring Tab */}
        <Tab eventKey="monitoring" title={
          <>
            <FontAwesomeIcon icon={faEye} className="me-2" />
            Monitoring
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search all reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">All Reports Monitoring</h5>
            </Card.Header>
            <Card.Body>
              {filteredAllReports.length === 0 ? (
                <Alert variant="info">No reports available for monitoring</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Week</th>
                      <th>Attendance</th>
                      <th>Topic</th>
                      <th>Date</th>
                      <th>Stream</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllReports.map(report => (
                      <tr key={report.id}>
                        <td>{report.Class?.className}</td>
                        <td>
                          <strong>{report.Class?.Course?.courseCode}</strong>
                          <br />
                          <small>{report.Class?.Course?.courseName}</small>
                        </td>
                        <td>{report.User?.name}</td>
                        <td>{report.weekOfReporting}</td>
                        <td>
                          <Badge 
                            bg={
                              report.actualStudentsPresent > (report.Class?.totalStudents * 0.8) ? 'success' :
                              report.actualStudentsPresent > (report.Class?.totalStudents * 0.6) ? 'warning' : 'danger'
                            }
                          >
                            {report.actualStudentsPresent}/{report.Class?.totalStudents}
                          </Badge>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }} title={report.topicTaught}>
                            {report.topicTaught}
                          </div>
                        </td>
                        <td>{new Date(report.dateOfLecture).toLocaleDateString()}</td>
                        <td>
                          <Badge bg="info">{report.Class?.Course?.stream}</Badge>
                        </td>
                        <td>
                          {report.Feedbacks?.[0] ? (
                            <Badge bg="success">Reviewed</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Lectures Tab */}
        <Tab eventKey="lectures" title={
          <>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Lectures
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search lecturers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Lecturers Management</h5>
            </Card.Header>
            <Card.Body>
              {filteredLecturers.length === 0 ? (
                <Alert variant="info">No lecturers found</Alert>
              ) : (
                <Row>
                  {filteredLecturers.map(lecturer => (
                    <Col md={6} lg={4} key={lecturer.id} className="mb-3">
                      <Card className="h-100 dashboard-card">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">{lecturer.name}</h6>
                        </Card.Header>
                        <Card.Body>
                          <p className="card-text">
                            <strong>Email:</strong> {lecturer.email}<br />
                            <strong>Faculty:</strong> {lecturer.faculty}<br />
                            <strong>Role:</strong> <Badge bg="info">{lecturer.role}</Badge>
                          </p>
                        </Card.Body>
                        <Card.Footer>
                          <small className="text-muted">
                            Registered: {new Date(lecturer.createdAt).toLocaleDateString()}
                          </small>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Rating Tab */}
        <Tab eventKey="rating" title={
          <>
            <FontAwesomeIcon icon={faStar} className="me-2" />
            Ratings
          </>
        }>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">All Student Ratings</h5>
            </Card.Header>
            <Card.Body>
              {filteredRatings.length === 0 ? (
                <Alert variant="info">No ratings available</Alert>
              ) : (
                <Row>
                  {filteredRatings.map(rating => (
                    <Col md={6} key={rating.id} className="mb-3">
                      <Card>
                        <Card.Header className="bg-warning text-dark">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{rating.Class?.className}</h6>
                            <div>{renderStars(rating.rating)}</div>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <p className="card-text">
                            <strong>Course:</strong> {rating.Class?.Course?.courseName}<br />
                            <strong>Rating:</strong> {rating.rating}/5<br />
                            <strong>Student:</strong> {rating.User?.name}<br />
                            <strong>Lecturer:</strong> {rating.Class?.User?.name}<br />
                            <strong>Stream:</strong> <Badge bg="info">{rating.Class?.Course?.stream}</Badge><br />
                            {rating.comment && (
                              <>
                                <strong>Comment:</strong> {rating.comment}
                              </>
                            )}
                          </p>
                          <small className="text-muted">
                            Rated on: {new Date(rating.createdAt).toLocaleDateString()}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* PRL Management Tab */}
        <Tab eventKey="prl-management" title={
          <>
            <FontAwesomeIcon icon={faUserTie} className="me-2" />
            PRL Management
          </>
        }>
          <Row className="mb-4">
            <Col md={6}>
              <Alert variant="info" className="mb-0">
                <small>
                  PRLs must register through the registration page. 
                  Use this panel to assign existing PRLs to streams.
                </small>
              </Alert>
            </Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search PRLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Assign Streams to Principal Lecturers</h5>
            </Card.Header>
            <Card.Body>
              {filteredPRLs.length === 0 ? (
                <Alert variant="info">No PRLs found. PRLs must register through the registration page first.</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Assigned Stream</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPRLs.map(prl => (
                      <tr key={prl.id}>
                        <td>{prl.name}</td>
                        <td>{prl.email}</td>
                        <td>
                          <Form.Select 
                            size="sm" 
                            value={prl.stream || ''}
                            onChange={(e) => assignPRLStream(prl.id, e.target.value)}
                          >
                            <option value="">Select Stream</option>
                            {allStreams.map(stream => (
                              <option key={stream} value={stream}>
                                {stream}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Badge bg={prl.stream ? 'success' : 'warning'}>
                            {prl.stream ? 'Assigned' : 'Unassigned'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Stream Overview Card */}
          <Card className="shadow-sm mt-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Stream Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Courses by Stream:</h6>
                  {Object.entries(
                    courses.reduce((acc, course) => {
                      acc[course.stream] = (acc[course.stream] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([stream, count]) => (
                    <div key={stream} className="d-flex justify-content-between mb-2">
                      <span>{stream}</span>
                      <Badge bg="primary">{count} courses</Badge>
                    </div>
                  ))}
                </Col>
                <Col md={6}>
                  <h6>PRL Assignments:</h6>
                  {prls.filter(prl => prl.stream).map(prl => (
                    <div key={prl.id} className="d-flex justify-content-between mb-2">
                      <span>{prl.stream}</span>
                      <Badge bg="success">{prl.name}</Badge>
                    </div>
                  ))}
                  {prls.filter(prl => !prl.stream).length > 0 && (
                    <div className="mt-3">
                      <Alert variant="warning" className="py-2">
                        <small>
                          <strong>Unassigned PRLs:</strong> {prls.filter(prl => !prl.stream).length}
                          <br />
                          Assign streams to these PRLs so they can access their dashboard data.
                        </small>
                      </Alert>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Course Modal */}
      <Modal show={showCourseModal} onHide={() => {
        setShowCourseModal(false);
        setEditingCourse(null);
        setCourseForm({ courseCode: '', courseName: '', stream: '' });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCourseSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Course Code *</Form.Label>
              <Form.Control
                type="text"
                value={courseForm.courseCode}
                onChange={(e) => setCourseForm({...courseForm, courseCode: e.target.value})}
                required
                placeholder="e.g., DIWA2110"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course Name *</Form.Label>
              <Form.Control
                type="text"
                value={courseForm.courseName}
                onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})}
                required
                placeholder="e.g., Web Application Development"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stream *</Form.Label>
              <Form.Control
                type="text"
                value={courseForm.stream}
                onChange={(e) => setCourseForm({...courseForm, stream: e.target.value})}
                required
                placeholder="e.g., Software Development"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCourse ? 'Update Course' : 'Add Course'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Class Modal */}
      <Modal show={showClassModal} onHide={() => setShowClassModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Class</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleClassSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Class Name *</Form.Label>
              <Form.Control
                type="text"
                value={classForm.className}
                onChange={(e) => setClassForm({...classForm, className: e.target.value})}
                required
                placeholder="e.g., IT Year 1 Group A"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course *</Form.Label>
              <Form.Select
                value={classForm.courseId}
                onChange={(e) => setClassForm({...classForm, courseId: e.target.value})}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lecturer *</Form.Label>
              <Form.Select
                value={classForm.lecturerId}
                onChange={(e) => setClassForm({...classForm, lecturerId: e.target.value})}
                required
              >
                <option value="">Select Lecturer</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Venue *</Form.Label>
              <Form.Control
                type="text"
                value={classForm.venue}
                onChange={(e) => setClassForm({...classForm, venue: e.target.value})}
                required
                placeholder="e.g., Lab 101"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Time *</Form.Label>
              <Form.Control
                type="text"
                value={classForm.scheduledTime}
                onChange={(e) => setClassForm({...classForm, scheduledTime: e.target.value})}
                required
                placeholder="e.g., Mon 10:00-12:00"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Students *</Form.Label>
              <Form.Control
                type="number"
                value={classForm.totalStudents}
                onChange={(e) => setClassForm({...classForm, totalStudents: e.target.value})}
                required
                min="1"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowClassModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Create Class
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PLDashboard;