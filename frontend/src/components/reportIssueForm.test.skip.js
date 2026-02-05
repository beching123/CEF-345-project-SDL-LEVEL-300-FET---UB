import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import App from "../App"; // Make sure this path points to your App.js

  test("renders navigation links", () => {
 
  // Check if the main title exists
  const titleElement = screen.getByText(/Network Pulse/i);
  expect(titleElement).toBeInTheDocument();
});

  test("renders navigation links", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const homeLink = screen.getByText(/Home/i);
  const reportLink = screen.getByText(/Report/i);
  const mapLink = screen.getByText(/Map/i);
  const faqLink = screen.getByText(/FAQ/i);

  expect(homeLink).toBeInTheDocument();
  expect(reportLink).toBeInTheDocument();
  expect(mapLink).toBeInTheDocument();
  expect(faqLink).toBeInTheDocument();
});
