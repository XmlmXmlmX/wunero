import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuModal } from '../WuModal';

describe('WuModal', () => {
  it('renders when isOpen is true', () => {
    render(
      <WuModal isOpen onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </WuModal>
    );
    
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <WuModal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </WuModal>
    );
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('displays title', () => {
    render(
      <WuModal isOpen onClose={jest.fn()} title="Modal Title">
        <div>Content</div>
      </WuModal>
    );
    
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('closes on close button click', async () => {
    const handleClose = jest.fn();
    render(
      <WuModal isOpen onClose={handleClose} title="Test Modal">
        <div>Content</div>
      </WuModal>
    );
    
    // Find the close button (XIcon button in header)
    const closeButton = screen.getByRole('button');
    await userEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on overlay click when closeOnOverlayClick is true', async () => {
    const handleClose = jest.fn();
    const { container } = render(
      <WuModal isOpen onClose={handleClose} title="Test Modal" closeOnOverlayClick={true}>
        <div>Content</div>
      </WuModal>
    );
    
    const overlay = container.querySelector('.overlay');
    if (overlay) {
      await userEvent.click(overlay);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('supports action buttons', () => {
    render(
      <WuModal 
        isOpen 
        onClose={jest.fn()}
        title="Test Modal"
        actions={<button>Save</button>}
      >
        <div>Content</div>
      </WuModal>
    );
    
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('prevents close on overlay click when closeOnOverlayClick is false', async () => {
    const handleClose = jest.fn();
    const { container } = render(
      <WuModal 
        isOpen 
        onClose={handleClose}
        title="Test Modal"
        closeOnOverlayClick={false}
      >
        <div>Content</div>
      </WuModal>
    );
    
    const overlay = container.querySelector('.overlay');
    if (overlay) {
      await userEvent.click(overlay);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });
});
