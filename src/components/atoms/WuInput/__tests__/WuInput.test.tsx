import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuInput } from '../WuInput';

describe('WuInput', () => {
  it('renders with placeholder', () => {
    render(<WuInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();
    render(<WuInput onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test');
  });

  it('displays error state', () => {
    render(
      <WuInput 
        hasError={true}
        placeholder="Error input"
      />
    );
    
    const input = screen.getByPlaceholderText('Error input');
    expect(input.className).toContain('error');
  });

  it('handles disabled state', () => {
    render(<WuInput disabled />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(input.disabled).toBe(true);
  });

  it('supports different input types', () => {
    render(<WuInput type="email" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(input.type).toBe('email');
  });

  it('supports fullWidth prop', () => {
    render(<WuInput fullWidth placeholder="Full width" />);
    const input = screen.getByPlaceholderText('Full width');
    
    expect(input.className).toContain('fullWidth');
  });

  it('accepts initial value', () => {
    render(<WuInput defaultValue="initial" readOnly />);
    expect(screen.getByRole('textbox')).toHaveValue('initial');
  });
});
