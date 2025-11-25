import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '../product-form';
import { useCreateProduct, useProduct } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useBrands } from '@/lib/hooks/use-brands';

// Mock hooks
jest.mock('@/lib/hooks/use-products');
jest.mock('@/lib/hooks/use-categories');
jest.mock('@/lib/hooks/use-brands');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockUseCreateProduct = useCreateProduct as jest.MockedFunction<typeof useCreateProduct>;
const mockUseProduct = useProduct as jest.MockedFunction<typeof useProduct>;
const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>;
const mockUseBrands = useBrands as jest.MockedFunction<typeof useBrands>;

describe('ProductForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form', () => {
    mockUseCreateProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateProduct>);

    mockUseProduct.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProduct>);

    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    mockUseBrands.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBrands>);

    render(<ProductForm />);

    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    mockUseCreateProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateProduct>);

    mockUseProduct.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProduct>);

    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    mockUseBrands.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBrands>);

    render(<ProductForm />);

    const submitButton = screen.getByRole('button', { name: /crear/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });
  });
});

