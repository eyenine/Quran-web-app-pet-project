import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Qur\'an Web App', () => {
  render(<App />);
  const titleElement = screen.getByText(/Qur'an Web App/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to the Qur'an Web App/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('renders Arabic title', () => {
  render(<App />);
  const arabicTitle = screen.getByText(/القرآن الكريم/);
  expect(arabicTitle).toBeInTheDocument();
});
