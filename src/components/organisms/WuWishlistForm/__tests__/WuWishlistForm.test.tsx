import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuWishlistForm } from '../WuWishlistForm';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key)
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn()
  }))
}));

describe('WuWishlistForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with required fields', () => {
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    expect(screen.getByLabelText(/title|name|titel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description|beschreibung/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    const titleInput = screen.getByLabelText(/title|name/i);
    const submitButton = screen.getByRole('button', { name: /create|save|submit/i });
    
    await userEvent.type(titleInput, 'My Wishlist');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    const submitButton = screen.getByRole('button', { name: /create|save|submit/i });
    await userEvent.click(submitButton);
    
    // Form should not submit if title is empty
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data on successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create|save/i });
    
    await userEvent.type(titleInput, 'My Wishlist');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'My Wishlist'
      }));
    });
  });

  it('disables submit button while loading', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /create|save/i });
    
    await userEvent.type(titleInput, 'My Wishlist');
    await userEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('renders form with empty fields', () => {
    render(
      <WuWishlistForm 
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByRole('textbox', { name: /title/i }) as HTMLInputElement;
    const descriptionInput = screen.getByRole('textbox', { name: /description/i }) as HTMLTextAreaElement;
    
    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
  });

  it('handles privacy settings', () => {
    render(
      <WuWishlistForm onSubmit={mockOnSubmit} />
    );
    
    expect(screen.getByLabelText(/private|public|öffentlich/i)).toBeInTheDocument();
  });
});
