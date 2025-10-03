import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUsers, faPlus, faEdit, faChartLine, faSearch, faClipboardList, faEye, faStar } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';

const LecturerDashboard = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [reportForm, setReportForm] = useState({
    weekOfReporting: '',
    dateOfLecture: '',
    actualStudentsPresent: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: '',
    classId: ''
  });

  useEffect(() => {
    fetchMyClasses();
    fetchMyReports();
    fetchAllReports();
    fetchMyRatings();
  }, []);

  const fetchMyClasses = async () => {
    try {
      const response = await axios.get('/users/my-classes');
      setMyClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchMyReports = async () => {
    try {
      const response = await axios.get('/reports/my-reports');
      setMyReports(response.data);
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

  const fetchMyRatings = async () => {
    try {
      // Get ratings for lecturer's classes
      const classesResponse = await axios.get('/users/my-classes');
      const myClassIds = classesResponse.data.map(cls => cls.id);
      
      if (myClassIds.length > 0) {
        const ratingsPromises = myClassIds.map(classId => 
          axios.get(`/ratings/class/${classId}`)
        );
        const ratingsResponses = await Promise.all(ratingsPromises);
        const allRatings = ratingsResponses.flatMap(response => response.data);
        setRatings(allRatings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleCreateReport = (classItem) => {
    setSelectedClass(classItem);
    setReportForm({
      weekOfReporting: '',
      dateOfLecture: '',
      actualStudentsPresent: '',
      topicTaught: '',
      learningOutcomes: '',
      recommendations: '',
      classId: classItem.id
    });
    setShowReportModal(true);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/reports', reportForm);
      Swal.fire('Success!', 'Report submitted successfully!', 'success');
      setShowReportModal(false);
      setSelectedClass(null);
      fetchMyReports();
      fetchAllReports();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to submit report', 'error');
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

  const filteredClasses = myClasses.filter(classItem =>
    classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = myReports.filter(report =>
    report.Class?.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.weekOfReporting.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllReports = allReports.filter(report =>
    report.Class?.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.Class?.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Lecturer Dashboard
              </h4>
              <small>Faculty of Information Communication Technology (FICT)</small>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="classes" className="mb-4">
        {/* My Classes Tab */}
        <Tab eventKey="classes" title={
          <>
            <FontAwesomeIcon icon={faBook} className="me-2" />
            My Classes
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
              <h5 className="mb-0">Assigned Classes</h5>
            </Card.Header>
            <Card.Body>
              {filteredClasses.length === 0 ? (
                <Alert variant="info">No classes assigned to you</Alert>
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
                              <strong>Venue:</strong> {classItem.venue}<br />
                              <strong>Time:</strong> {classItem.scheduledTime}<br />
                              <strong>Total Students:</strong> {classItem.totalStudents}<br />
                              <strong>Stream:</strong> <Badge bg="info">{classItem.Course?.stream}</Badge>
                            </small>
                          </p>
                        </Card.Body>
                        <Card.Footer>
                          <Button
                            variant="success"
                            size="sm"
                            className="w-100"
                            onClick={() => handleCreateReport(classItem)}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Submit Report
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* My Reports Tab */}
        <Tab eventKey="reports" title={
          <>
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />
            My Reports
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
              <h5 className="mb-0">Submitted Reports</h5>
            </Card.Header>
            <Card.Body>
              {filteredReports.length === 0 ? (
                <Alert variant="info">No reports submitted yet</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Course</th>
                      <th>Week</th>
                      <th>Date</th>
                      <th>Attendance</th>
                      <th>Topic</th>
                      <th>PRL Feedback</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr key={report.id}>
                        <td>{report.Class?.className}</td>
                        <td>
                          <strong>{report.Class?.Course?.courseCode}</strong>
                          <br />
                          <small>{report.Class?.Course?.courseName}</small>
                        </td>
                        <td>{report.weekOfReporting}</td>
                        <td>{new Date(report.dateOfLecture).toLocaleDateString()}</td>
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
                          <div className="text-truncate" style={{ maxWidth: '150px' }} title={report.topicTaught}>
                            {report.topicTaught}
                          </div>
                        </td>
                        <td>
                          {report.Feedbacks?.[0] ? (
                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={report.Feedbacks[0].feedback}>
                              {report.Feedbacks[0].feedback}
                            </div>
                          ) : (
                            <span className="text-muted">No feedback yet</span>
                          )}
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
              <h5 className="mb-0">All Lecture Reports Monitoring</h5>
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

        {/* Rating Tab */}
        <Tab eventKey="rating" title={
          <>
            <FontAwesomeIcon icon={faStar} className="me-2" />
            Student Ratings
          </>
        }>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Student Ratings for My Classes</h5>
            </Card.Header>
            <Card.Body>
              {ratings.length === 0 ? (
                <Alert variant="info">No ratings received yet</Alert>
              ) : (
                <Row>
                  {ratings.map(rating => (
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

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Lecture Report</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitReport}>
          <Modal.Body>
            {selectedClass && (
              <div className="mb-3 p-3 bg-light rounded">
                <h6>Class Details:</h6>
                <p><strong>Class:</strong> {selectedClass.className}</p>
                <p><strong>Course:</strong> {selectedClass.Course?.courseName}</p>
                <p><strong>Venue:</strong> {selectedClass.venue}</p>
                <p><strong>Total Students:</strong> {selectedClass.totalStudents}</p>
              </div>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Week of Reporting *</Form.Label>
                  <Form.Control
                    type="text"
                    value={reportForm.weekOfReporting}
                    onChange={(e) => setReportForm({...reportForm, weekOfReporting: e.target.value})}
                    required
                    placeholder="e.g., Week 6"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Lecture *</Form.Label>
                  <Form.Control
                    type="date"
                    value={reportForm.dateOfLecture}
                    onChange={(e) => setReportForm({...reportForm, dateOfLecture: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Actual Number of Students Present *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={selectedClass?.totalStudents}
                value={reportForm.actualStudentsPresent}
                onChange={(e) => setReportForm({...reportForm, actualStudentsPresent: e.target.value})}
                required
              />
              <Form.Text className="text-muted">
                Total registered students: {selectedClass?.totalStudents}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic Taught *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={reportForm.topicTaught}
                onChange={(e) => setReportForm({...reportForm, topicTaught: e.target.value})}
                required
                placeholder="Describe the topic covered in this lecture..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Learning Outcomes *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reportForm.learningOutcomes}
                onChange={(e) => setReportForm({...reportForm, learningOutcomes: e.target.value})}
                required
                placeholder="What were the key learning outcomes for this session?"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lecturer's Recommendations *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reportForm.recommendations}
                onChange={(e) => setReportForm({...reportForm, recommendations: e.target.value})}
                required
                placeholder="Any recommendations for improvement or follow-up actions?"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Report
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default LecturerDashboard;