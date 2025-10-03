import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faStar, faChartLine, faSearch, faUsers, faBook } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: '',
    classId: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchReports();
    fetchRatings();
  }, []);

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
      const response = await axios.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await axios.get('/ratings/class/1'); // This would need to be dynamic based on student's classes
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRateClass = (classItem) => {
    setSelectedClass(classItem);
    setRatingForm({
      rating: 5,
      comment: '',
      classId: classItem.id
    });
    setShowRatingModal(true);
  };

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/ratings', ratingForm);
      Swal.fire('Success!', 'Rating submitted successfully!', 'success');
      setShowRatingModal(false);
      setSelectedClass(null);
      fetchRatings();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to submit rating', 'error');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < rating ? 'text-warning' : 'text-muted'}
      />
    ));
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(report =>
    report.Class?.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.Class?.Course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Student Dashboard
              </h4>
              <small>Faculty of Information Communication Technology (FICT)</small>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="monitoring" className="mb-4">
        {/* Monitoring Tab */}
        <Tab eventKey="monitoring" title={
          <>
            <FontAwesomeIcon icon={faEye} className="me-2" />
            Class Monitoring
          </>
        }>
          <Row className="mb-4">
            <Col md={6}></Col>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search classes or reports..."
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

          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Available Classes</h5>
            </Card.Header>
            <Card.Body>
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
                            <strong>Lecturer:</strong> {classItem.User?.name || 'TBA'}<br />
                            <strong>Venue:</strong> {classItem.venue}<br />
                            <strong>Time:</strong> {classItem.scheduledTime}<br />
                            <strong>Stream:</strong> <Badge bg="info">{classItem.Course?.stream}</Badge>
                          </small>
                        </p>
                      </Card.Body>
                      <Card.Footer>
                        <Button
                          variant="warning"
                          size="sm"
                          className="w-100"
                          onClick={() => handleRateClass(classItem)}
                        >
                          <FontAwesomeIcon icon={faStar} className="me-2" />
                          Rate This Class
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Lecture Reports</h5>
            </Card.Header>
            <Card.Body>
              {filteredReports.length === 0 ? (
                <Alert variant="info">No lecture reports available</Alert>
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
                      <th>Actions</th>
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
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => {
                              Swal.fire({
                                title: 'Lecture Report Details',
                                html: `
                                  <div class="text-start">
                                    <p><strong>Class:</strong> ${report.Class?.className}</p>
                                    <p><strong>Course:</strong> ${report.Class?.Course?.courseName}</p>
                                    <p><strong>Lecturer:</strong> ${report.User?.name}</p>
                                    <p><strong>Week:</strong> ${report.weekOfReporting}</p>
                                    <p><strong>Date:</strong> ${new Date(report.dateOfLecture).toLocaleDateString()}</p>
                                    <p><strong>Attendance:</strong> ${report.actualStudentsPresent}/${report.Class?.totalStudents}</p>
                                    <p><strong>Topic:</strong> ${report.topicTaught}</p>
                                    <p><strong>Learning Outcomes:</strong> ${report.learningOutcomes}</p>
                                    <p><strong>Recommendations:</strong> ${report.recommendations}</p>
                                    ${report.Feedbacks?.[0] ? `<p><strong>PRL Feedback:</strong> ${report.Feedbacks[0].feedback}</p>` : ''}
                                  </div>
                                `,
                                width: 600
                              });
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
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

        {/* Rating Tab */}
        <Tab eventKey="rating" title={
          <>
            <FontAwesomeIcon icon={faStar} className="me-2" />
            My Ratings
          </>
        }>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">My Class Ratings</h5>
            </Card.Header>
            <Card.Body>
              {ratings.length === 0 ? (
                <Alert variant="info">You haven't rated any classes yet</Alert>
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

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate Class</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitRating}>
          <Modal.Body>
            {selectedClass && (
              <div className="mb-3 p-3 bg-light rounded">
                <h6>Class Details:</h6>
                <p><strong>Class:</strong> {selectedClass.className}</p>
                <p><strong>Course:</strong> {selectedClass.Course?.courseName}</p>
                <p><strong>Lecturer:</strong> {selectedClass.User?.name}</p>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <div className="d-flex justify-content-between mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    type="button"
                    variant={ratingForm.rating >= star ? 'warning' : 'outline-warning'}
                    onClick={() => setRatingForm({...ratingForm, rating: star})}
                    className="rounded-circle"
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </Button>
                ))}
              </div>
              <Form.Text className="text-muted">
                Selected: {ratingForm.rating} out of 5 stars
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={ratingForm.comment}
                onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})}
                placeholder="Share your feedback about this class..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" type="submit">
              Submit Rating
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default StudentDashboard;