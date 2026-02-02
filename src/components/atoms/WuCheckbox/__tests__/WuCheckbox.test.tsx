import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuCheckbox } from '../WuCheckbox';

describe('WuCheckbox', () => {
  it('renders checkbox', () => {
    render(<WuCheckbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<WuCheckbox checked={true} onChange={() => {}} readOnly />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('toggles on click', async () => {
    const handleChange = jest.fn();
    render(<WuCheckbox checked={false} onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays label', () => {
    render(<WuCheckbox checked={false} onChange={() => {}} label="Agree to terms" />);
    expect(screen.getByText('Agree to terms')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<WuCheckbox checked={false} onChange={() => {}} disabled={true} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('shows error message with label', () => {
    render(
      <WuCheckbox 
        checked={false}
        onChange={() => {}}
        label="Accept"
        error="This is required" 
      />
    );
    
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('supports description text', () => {
    render(<WuCheckbox checked={false} onChange={() => {}} description="Additional info" />);
    expect(screen.getByText('Additional info')).toBeInTheDocument();
  });
});
