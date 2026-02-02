import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuInputGroup } from '../WuInputGroup';

// Mock WuInput and WuButton components
jest.mock('@/components/atoms/WuInput/WuInput', () => ({
  WuInput: ({ className, ...props }: any) => (
    <input className={className} {...props} />
  )
}));

jest.mock('@/components/atoms/WuButton/WuButton', () => ({
  WuButton: ({ className, ...props }: any) => (
    <button className={className} {...props} />
  )
}));

describe('WuInputGroup', () => {
  it('renders input group with input and button', () => {
    render(
      <WuInputGroup 
        inputProps={{ placeholder: 'username' }}
        buttonProps={{ children: 'Submit' }}
      />
    );
    
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(
      <WuInputGroup 
        inputProps={{ placeholder: 'test' }}
        buttonProps={{ children: 'Button' }}
        fullWidth={true}
      />
    );
    
    const group = container.querySelector('.group');
    expect(group?.className).toContain('fullWidth');
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();
    render(
      <WuInputGroup 
        inputProps={{ onChange: handleChange, placeholder: 'test' }}
        buttonProps={{ children: 'Submit' }}
      />
    );
    
    const input = screen.getByPlaceholderText('test');
    await userEvent.type(input, 'value');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('passes custom className to container', () => {
    const { container } = render(
      <WuInputGroup 
        inputProps={{ placeholder: 'test' }}
        buttonProps={{ children: 'Button' }}
        className="custom-class"
      />
    );
    
    const group = container.querySelector('.group');
    expect(group?.className).toContain('custom-class');
  });

  it('handles button click', async () => {
    const handleClick = jest.fn();
    render(
      <WuInputGroup 
        inputProps={{ placeholder: 'test' }}
        buttonProps={{ onClick: handleClick, children: 'Click' }}
      />
    );
    
    const button = screen.getByText('Click');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });
});
