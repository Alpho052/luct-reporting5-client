import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faComment, faBook, faUsers, faChartLine, faSearch, faStar } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PRLDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchCourses();
    fetchReports();
    fetchAllReports();
    fetchClasses();
    fetchRatings();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      // Filter courses by PRL's stream
      const prlStream = currentUser?.stream || 'Software Development';
      const filteredCourses = response.data.filter(course => 
        course.stream === prlStream
      );
      setCourses(filteredCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('/reports');
      // Filter reports by PRL's stream
      const prlStream = currentUser?.stream || 'Software Development';
      const filteredReports = response.data.filter(report => 
        report.Class?.Course?.stream === prlStream
      );
      setReports(filteredReports);
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

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes');
      // Filter classes by PRL's stream
      const prlStream = currentUser?.stream || 'Software Development';
      const filteredClasses = response.data.filter(classItem => 
        classItem.Course?.stream === prlStream
      );
      setClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      // Get all ratings first
      const classesResponse = await axios.get('/classes');
      const prlStream = currentUser?.stream || 'Software Development';
      
      // Get all class IDs from the stream
      const streamClasses = classesResponse.data.filter(classItem => 
        classItem.Course?.stream === prlStream
      );
      const classIds = streamClasses.map(cls => cls.id);
      
      // Get ratings for each class
      if (classIds.length > 0) {
        const ratingsPromises = classIds.map(classId => 
          axios.get(`/ratings/class/${classId}`)
        );
        const ratingsResponses = await Promise.all(ratingsPromises);
        const allRatings = ratingsResponses.flatMap(response => response.data);
        setRatings(allRatings);
      } else {
        setRatings([]);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
    }
  };

  const handleAddFeedback = (report) => {
    setSelectedReport(report);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Swal.fire('Error!', 'Please enter feedback', 'error');
      return;
    }

    try {
      await axios.post('/reports/feedback', {
        reportId: selectedReport.id,
        feedback: feedback
      });
      
      Swal.fire('Success!', 'Feedback added successfully!', 'success');
      setShowFeedbackModal(false);
      setFeedback('');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      Swal.fire('Error!', 'Failed to add feedback', 'error');
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

  const prlStream = currentUser?.stream || 'Software Development';

  // Filter functions for each tab
  const filteredCourses = courses.filter(course =>
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(report =>
    report.Class?.Course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllReports = allReports.filter(report =>
    report.Class?.Course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(classItem =>
    classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.Course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRatings = ratings.filter(rating =>
    rating.Class?.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.Class?.Course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.User?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Principal Lecturer Dashboard
              </h4>
              <small>Stream: {prlStream} - Faculty of Information Communication Technology (FICT)</small>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="courses" className="mb-4">
        {/* Courses Tab */}
        <Tab eventKey="courses" title={
          <>
            <FontAwesomeIcon icon={faBook} className="me-2" />
            My Stream Courses
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
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
              <h5 className="mb-0">Courses in {prlStream} Stream</h5>
            </Card.Header>
            <Card.Body>
              {filteredCourses.length === 0 ? (
                <Alert variant="info">No courses found in {prlStream} stream</Alert>
              ) : (
                <Row>
                  {filteredCourses.map(course => (
                    <Col md={6} lg={4} key={course.id} className="mb-3">
                      <Card className="h-100 dashboard-card">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">{course.courseCode}</h6>
                        </Card.Header>
                        <Card.Body>
                          <h6 className="card-title">{course.courseName}</h6>
                          <p className="card-text">
                            <Badge bg="info" className="mb-2">{course.stream}</Badge>
                            <br />
                            <small className="text-muted">
                              Lecturer: {course.Lecturer?.name || 'Not assigned'}
                            </small>
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Reports Tab */}
        <Tab eventKey="reports" title={
          <>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Lecture Reports
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search reports..."
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
              <h5 className="mb-0">Lecture Reports from {prlStream} Stream</h5>
            </Card.Header>
            <Card.Body>
              {filteredReports.length === 0 ? (
                <Alert variant="info">No reports available in {prlStream} stream</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Week</th>
                      <th>Attendance</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr key={report.id}>
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
                          <br />
                          <small>
                            {((report.actualStudentsPresent / report.Class?.totalStudents) * 100).toFixed(1)}%
                          </small>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }} title={report.topicTaught}>
                            {report.topicTaught}
                          </div>
                        </td>
                        <td>
                          {report.Feedbacks && report.Feedbacks.length > 0 ? (
                            <Badge bg="success">Reviewed</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2"
                            onClick={() => {
                              setSelectedReport(report);
                              Swal.fire({
                                title: 'Report Details',
                                html: `
                                  <div class="text-start">
                                    <p><strong>Course:</strong> ${report.Class?.Course?.courseName}</p>
                                    <p><strong>Lecturer:</strong> ${report.User?.name}</p>
                                    <p><strong>Week:</strong> ${report.weekOfReporting}</p>
                                    <p><strong>Date:</strong> ${new Date(report.dateOfLecture).toLocaleDateString()}</p>
                                    <p><strong>Attendance:</strong> ${report.actualStudentsPresent}/${report.Class?.totalStudents}</p>
                                    <p><strong>Topic:</strong> ${report.topicTaught}</p>
                                    <p><strong>Learning Outcomes:</strong> ${report.learningOutcomes}</p>
                                    <p><strong>Recommendations:</strong> ${report.recommendations}</p>
                                    ${report.Feedbacks && report.Feedbacks.length > 0 ? `<p><strong>Your Feedback:</strong> ${report.Feedbacks[0].feedback}</p>` : ''}
                                  </div>
                                `,
                                width: 600
                              });
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleAddFeedback(report)}
                            disabled={report.Feedbacks && report.Feedbacks.length > 0}
                          >
                            <FontAwesomeIcon icon={faComment} />
                          </Button>
                        </td>
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
                          {report.Feedbacks && report.Feedbacks.length > 0 ? (
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

        {/* Classes Tab */}
        <Tab eventKey="classes" title={
          <>
            <FontAwesomeIcon icon={faBook} className="me-2" />
            Classes
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search classes..."
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
              <h5 className="mb-0">Classes in {prlStream} Stream</h5>
            </Card.Header>
            <Card.Body>
              {filteredClasses.length === 0 ? (
                <Alert variant="info">No classes found in {prlStream} stream</Alert>
              ) : (
                <Row>
                  {filteredClasses.map(classItem => (
                    <Col md={6} lg={4} key={classItem.id} className="mb-3">
                      <Card className="h-100 dashboard-card">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{classItem.className}</h6>
                          <Badge bg="light" text="dark">{classItem.Course?.courseCode}</Badge>
                        </Card.Header>
                        <Card.Body>
                          <h6 className="card-title text-primary">{classItem.Course?.courseName}</h6>
                          <p className="card-text">
                            <small>
                              <strong>Lecturer:</strong> {classItem.User?.name || 'Not assigned'}<br />
                              <strong>Venue:</strong> {classItem.venue}<br />
                              <strong>Time:</strong> {classItem.scheduledTime}<br />
                              <strong>Total Students:</strong> {classItem.totalStudents}<br />
                              <strong>Stream:</strong> <Badge bg="info">{classItem.Course?.stream}</Badge>
                            </small>
                          </p>
                        </Card.Body>
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
              <h5 className="mb-0">Student Ratings for {prlStream} Stream</h5>
            </Card.Header>
            <Card.Body>
              {filteredRatings.length === 0 ? (
                <Alert variant="info">No ratings available for {prlStream} stream</Alert>
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
      </Tabs>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <div className="mb-3 p-3 bg-light rounded">
              <h6>Report Details:</h6>
              <p><strong>Course:</strong> {selectedReport.Class?.Course?.courseName}</p>
              <p><strong>Lecturer:</strong> {selectedReport.User?.name}</p>
              <p><strong>Week:</strong> {selectedReport.weekOfReporting}</p>
              <p><strong>Topic:</strong> {selectedReport.topicTaught}</p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Your Feedback *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback for this lecture report..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PRLDashboard;