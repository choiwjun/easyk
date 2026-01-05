import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ProfilePage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('ProfilePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    localStorageMock.getItem.mockReturnValue('fake-jwt-token');

    // Default fetch mock for profile load
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        nationality: 'US',
        role: 'foreign',
        visa_type: 'E-1',
        preferred_language: 'en',
        residential_area: '고양시 덕양구',
      }),
    });
  });

  describe('Profile Display', () => {
    it('should display user profile information', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/프로필 관리/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(<ProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByText(/수정/i);
        expect(editButton).toBeInTheDocument();
      });

      await user.click(screen.getByText(/수정/i));

      await waitFor(() => {
        expect(screen.getByDisplayValue('US')).toBeInTheDocument();
      });
    });

    it('should cancel edit when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByText(/수정/i);
        expect(editButton).toBeInTheDocument();
      });

      await user.click(screen.getByText(/수정/i));

      await user.click(screen.getByText(/취소/i));

      await waitFor(() => {
        expect(screen.queryByDisplayValue('UK')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Fields', () => {
    it('should allow editing nationality', async () => {
      const user = userEvent.setup();

      render(<ProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByText(/수정/i);
        expect(editButton).toBeInTheDocument();
      });

      await user.click(screen.getByText(/수정/i));

      const nationalityInput = await screen.findByLabelText(/국적/i);
      await user.clear(nationalityInput);
      await user.type(nationalityInput, 'Japan');

      expect(nationalityInput).toHaveValue('Japan');
    });

    it('should allow editing preferred language', async () => {
      const user = userEvent.setup();

      render(<ProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByText(/수정/i);
        expect(editButton).toBeInTheDocument();
      });

      await user.click(screen.getByText(/수정/i));

      const languageSelect = await screen.findByLabelText(/선호 언어/i);
      fireEvent.change(languageSelect, { target: { value: 'ko' } });

      expect(languageSelect).toHaveValue('ko');
    });
  });

  describe('Authentication', () => {
    it('should redirect to login when no token is found', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByText(/수정/i);
        expect(editButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/수정/i));

      expect(screen.getByLabelText(/국적/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/비자 종류/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/선호 언어/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/거주 지역/i)).toBeInTheDocument();
    });
  });
});
