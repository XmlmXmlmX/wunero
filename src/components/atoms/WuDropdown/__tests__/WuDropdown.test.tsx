import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuDropdown } from '../WuDropdown';

describe('WuDropdown', () => {
  it('renders trigger element', () => {
    render(
      <WuDropdown trigger={<button>Open Menu</button>}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('does not show menu by default', () => {
    render(
      <WuDropdown trigger={<button>Open Menu</button>}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
  });

  it('shows menu when trigger is clicked', async () => {
    render(
      <WuDropdown trigger={<button>Open Menu</button>}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    await userEvent.click(screen.getByText('Open Menu'));
    
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
  });

  it('closes menu when trigger is clicked again', async () => {
    render(
      <WuDropdown trigger={<button>Open Menu</button>}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    const trigger = screen.getByText('Open Menu');
    await userEvent.click(trigger);
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
    
    await userEvent.click(trigger);
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', async () => {
    render(
      <div>
        <WuDropdown trigger={<button>Open Menu</button>}>
          <div>Menu Content</div>
        </WuDropdown>
        <div>Outside</div>
      </div>
    );
    
    await userEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Outside'));
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
  });

  it('supports controlled mode with isOpen prop', () => {
    const { rerender } = render(
      <WuDropdown trigger={<button>Open Menu</button>} isOpen={false}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
    
    rerender(
      <WuDropdown trigger={<button>Open Menu</button>} isOpen={true}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
  });

  it('calls onOpenChange callback when state changes', async () => {
    const handleOpenChange = jest.fn();
    
    render(
      <WuDropdown trigger={<button>Open Menu</button>} onOpenChange={handleOpenChange}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    await userEvent.click(screen.getByText('Open Menu'));
    expect(handleOpenChange).toHaveBeenCalledTimes(1);
    
    await userEvent.click(screen.getByText('Open Menu'));
    expect(handleOpenChange).toHaveBeenCalledTimes(2);
  });

  it('applies custom className', () => {
    const { container } = render(
      <WuDropdown trigger={<button>Open Menu</button>} className="custom-class">
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('aligns menu to the left when align="left"', async () => {
    const { container } = render(
      <WuDropdown trigger={<button>Open Menu</button>} align="left">
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    await userEvent.click(screen.getByText('Open Menu'));
    
    const menu = container.querySelector('[class*="menu"]');
    expect(menu?.className).toMatch(/left/);
  });

  it('aligns menu to the right by default', async () => {
    const { container } = render(
      <WuDropdown trigger={<button>Open Menu</button>}>
        <div>Menu Content</div>
      </WuDropdown>
    );
    
    await userEvent.click(screen.getByText('Open Menu'));
    
    const menu = container.querySelector('[class*="menu"]');
    expect(menu?.className).toMatch(/right/);
  });
});
