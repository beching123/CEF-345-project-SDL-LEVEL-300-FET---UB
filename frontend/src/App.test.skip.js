import React from "react";
import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import App from './App';

  test("renders navigation links", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Report/i)).toBeInTheDocument();
  expect(screen.getByText(/Map/i)).toBeInTheDocument();
});
 test("renders footer content", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/Secure & Encrypted/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Network Helper/i)).toBeInTheDocument();
  });
