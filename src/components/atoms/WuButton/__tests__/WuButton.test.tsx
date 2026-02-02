import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuButton } from '../WuButton';

describe('WuButton', () => {
  it('renders with text', () => {
    render(<WuButton>Click me</WuButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<WuButton onClick={handleClick}>Click me</WuButton>);
    
    const button = screen.getByText('Click me');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with variant prop', () => {
    render(<WuButton variant="primary">Primary</WuButton>);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<WuButton disabled>Disabled</WuButton>);
    const button = screen.getByText('Disabled') as HTMLButtonElement;
    
    expect(button.disabled).toBe(true);
  });

  it('handles fullWidth prop', () => {
    render(<WuButton fullWidth>Full Width</WuButton>);
    const button = screen.getByText('Full Width');
    
    expect(button.className).toContain('fullWidth');
  });

  it('accepts custom className', () => {
    render(<WuButton className="custom-class">Custom</WuButton>);
    const button = screen.getByText('Custom');
    
    expect(button).toHaveClass('custom-class');
  });
});
