import React from 'react';
import { render, screen } from '@testing-library/react';
import { WuAvatar } from '../WuAvatar';

describe('WuAvatar', () => {
  it('renders avatar with initials', () => {
    render(<WuAvatar fallbackText="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders avatar with image', () => {
    render(
      <WuAvatar 
        fallbackText="John Doe" 
        src="https://example.com/avatar.jpg" 
        alt="John Doe"
      />
    );
    
    const img = screen.getByAltText('John Doe');
    expect(img).toHaveAttribute('src', expect.stringContaining('avatar.jpg'));
  });

  it('handles different sizes', () => {
    render(<WuAvatar fallbackText="JD" size="lg" />);
    const avatar = screen.getByText('JD').parentElement;
    
    expect(avatar).toHaveClass('avatar-lg');
  });

  it('applies custom className', () => {
    render(<WuAvatar fallbackText="JD" className="custom-class" />);
    const avatar = screen.getByText('JD').parentElement;
    
    expect(avatar).toHaveClass('custom-class');
  });

  it('handles single letter names', () => {
    render(<WuAvatar fallbackText="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('handles names with multiple words', () => {
    render(<WuAvatar fallbackText="John Michael Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
