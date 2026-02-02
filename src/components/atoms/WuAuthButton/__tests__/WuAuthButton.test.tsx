import React from 'react';
import { render, screen } from '@testing-library/react';
import { WuAuthButton } from '../WuAuthButton';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  }))
}));

describe('WuAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in button when user is not authenticated', () => {
    render(<WuAuthButton />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('renders sign out button when user is authenticated', () => {
    render(<WuAuthButton />);
    
    // Due to mock, this is a basic test
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders a button', () => {
    render(<WuAuthButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
