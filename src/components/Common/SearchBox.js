import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBox = ({ placeholder, value, onChange, className = '' }) => {
  return (
    <Form.Group className={className}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button variant="outline-secondary">
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </InputGroup>
    </Form.Group>
  );
};

export default SearchBox;