import { render, screen } from '@testing-library/react';
import App from './App';

// Mock MapComponent to avoid react-leaflet ES module issues
jest.mock('./components/MapComponent', () => {
  return function MockMapComponent() {
    return <div>Map Component</div>;
  };
});

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

describe('App Component', () => {
  test('should render without crashing', () => {
    render(<App />);
    // Check that Dashboard link exists in navbar
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    // Check that Report Issue link exists
    expect(screen.getByText(/Report Issue/i)).toBeInTheDocument();
  });

  test('should display footer with secure message', () => {
    render(<App />);
    expect(screen.getByText(/Secure & Encrypted/i)).toBeInTheDocument();
  });

  test('should have navigation links', () => {
    render(<App />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
