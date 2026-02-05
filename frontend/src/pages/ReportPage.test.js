import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportPage from './ReportPage';
import * as axios from '../api/axios';

// Mock the axios API
jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

describe('ReportPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock geolocation
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn((success) =>
        success({
          coords: {
            latitude: 3.8667,
            longitude: 11.5167
          }
        })
      )
    };
  });

  // ========== Render Tests ==========
  test('should render the report form', () => {
    render(<ReportPage />);
    const heading = screen.getByText(/Report Network Issue/i);
    expect(heading).toBeInTheDocument();
  });

  test('should have network type select field', () => {
    render(<ReportPage />);
    const networkSelect = screen.getByLabelText(/Network Type/i);
    expect(networkSelect).toBeInTheDocument();
  });

  test('should have phone number input field', () => {
    render(<ReportPage />);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    expect(phoneInput).toBeInTheDocument();
  });

  test('should have issue select field', () => {
    render(<ReportPage />);
    const issueSelect = screen.getByLabelText(/Main Issue/i);
    expect(issueSelect).toBeInTheDocument();
  });

  test('should have description textarea', () => {
    render(<ReportPage />);
    const description = screen.getByLabelText(/Problem Description/i);
    expect(description).toBeInTheDocument();
  });

  test('should have location consent checkbox', () => {
    render(<ReportPage />);
    const checkbox = screen.getByLabelText(/allow NETLINK to collect my location/i);
    expect(checkbox).toBeInTheDocument();
  });

  test('should have submit button', () => {
    render(<ReportPage />);
    const button = screen.getByRole('button', { name: /Submit Report/i });
    expect(button).toBeInTheDocument();
  });

  // ========== Form Input Tests ==========
  test('should update network type when selected', () => {
    render(<ReportPage />);
    const networkSelect = screen.getByLabelText(/Network Type/i);
    
    fireEvent.change(networkSelect, { target: { value: 'MTN' } });
    expect(networkSelect.value).toBe('MTN');
  });

  test('should update phone number input', () => {
    render(<ReportPage />);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    
    fireEvent.change(phoneInput, { target: { value: '678901234' } });
    expect(phoneInput.value).toBe('678901234');
  });

  test('should update issue selection', () => {
    render(<ReportPage />);
    const issueSelect = screen.getByLabelText(/Main Issue/i);
    
    fireEvent.change(issueSelect, { target: { value: 'slow-speed' } });
    expect(issueSelect.value).toBe('slow-speed');
  });

  test('should update description textarea', () => {
    render(<ReportPage />);
    const description = screen.getByLabelText(/Problem Description/i);
    
    fireEvent.change(description, { target: { value: 'Internet is very slow' } });
    expect(description.value).toBe('Internet is very slow');
  });

  test('should toggle location consent checkbox', () => {
    render(<ReportPage />);
    const checkbox = screen.getByLabelText(/allow NETLINK to collect my location/i);
    
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  // ========== Accessibility Tests ==========
  test('should have proper label associations', () => {
    render(<ReportPage />);
    
    expect(screen.getByLabelText(/Network Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Main Issue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Problem Description/i)).toBeInTheDocument();
  });

  test('should have form element', () => {
    render(<ReportPage />);
    const form = screen.getByRole('button', { name: /Submit/i }).closest('form');
    expect(form).toBeInTheDocument();
  });
});
