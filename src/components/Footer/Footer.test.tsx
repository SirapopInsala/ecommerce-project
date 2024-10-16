import { render, screen } from '@testing-library/react';
import Footer from './Footer';

test('renders privacy, terms, and contact links', () => {
  render(<Footer />);
  
  expect(screen.getByText('Privacy Policy')).not.toBeNull();
  expect(screen.getByText('Terms of Service')).not.toBeNull();
  expect(screen.getByText('Contact Us')).not.toBeNull();
});

test('renders footer with correct year', () => {
  render(<Footer />);
  const currentYear = new Date().getFullYear();
  expect(screen.getByText(`© ${currentYear} Your E-commerce. All Rights Reserved.`)).not.toBeNull();
});
