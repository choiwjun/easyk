import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Form Rendering', () => {
    it('should render login form with all fields', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/이메일 주소/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
    });

    it('should have a link to signup page', () => {
      render(<LoginPage />);

      const signupLink = screen.getByRole('link', { name: /회원가입/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Form State Management', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/비밀번호/i);

      // Initial state should be password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the eye icon button
      const passwordToggleButtons = screen.getAllByRole('button', { name: '' });
      const passwordToggle = passwordToggleButtons[0];

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Input', () => {
    it('should allow typing in email input', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일 주소/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password input', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/비밀번호/i);
      await user.type(passwordInput, 'Password123!');

      expect(passwordInput).toHaveValue('Password123!');
    });
  });

  describe('Form Submission - API Calls', () => {
    it('should call login API with correct credentials', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fake-jwt-token',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'Password123!',
            }),
          })
        );
      });
    });

    it('should store token in localStorage on successful login', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fake-jwt-token',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBe('fake-jwt-token');
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fake-jwt-token',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when email is invalid', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'invalid-email');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText(/올바른 이메일 주소를 입력해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when email is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText(/이메일 주소를 입력해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when password is empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when credentials are invalid', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: '이메일 또는 비밀번호가 올바르지 않습니다' }),
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'WrongPassword123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API call fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText(/로그인 중 오류가 발생했습니다/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during API call', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ access_token: 'token' }) }), 1000))
      );

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /로그인/i });
      await user.click(submitButton);

      // Check for loading state
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/이메일 주소/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for error messages', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText(/이메일 주소를 입력해주세요/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});
