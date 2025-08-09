import { render, screen } from '@testing-library/react';
import { ProductRating } from '@/components/ProductRating';

describe('ProductRating', () => {
  it('renders correct number of stars and count', () => {
    render(<ProductRating rating={4.5} reviewCount={12} />);
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});