import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignupPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('SignupPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Form State Management', () => {
    it('should toggle user type between foreign and organization', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const foreignButton = screen.getByRole('button', { name: /외국인 회원/i });
      const orgButton = screen.getByRole('button', { name: /지원 기관/i });

      // Default should be foreign
      expect(foreignButton).toHaveClass('bg-blue-600');
      expect(orgButton).not.toHaveClass('bg-blue-600');

      // Click organization
      await user.click(orgButton);
      expect(orgButton).toHaveClass('bg-blue-600');
      expect(foreignButton).not.toHaveClass('bg-blue-600');

      // Click foreign again
      await user.click(foreignButton);
      expect(foreignButton).toHaveClass('bg-blue-600');
      expect(orgButton).not.toHaveClass('bg-blue-600');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^비밀번호$/i);

      // Initial state should be password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the eye icon button for password field
      const passwordToggleButtons = screen.getAllByRole('button', { name: '' });
      const passwordToggle = passwordToggleButtons[0]; // First toggle is for password

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle confirm password visibility', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i);

      // Initial state should be password type
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Find and click the eye icon button for confirm password field
      const passwordToggleButtons = screen.getAllByRole('button', { name: '' });
      const confirmPasswordToggle = passwordToggleButtons[1]; // Second toggle is for confirm password

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should check and uncheck terms agreement checkbox', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const termsCheckbox = screen.getByRole('checkbox', { name: /이용약관 및 개인정보 처리방침/i });

      expect(termsCheckbox).not.toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).not.toBeChecked();
    });
  });

  describe('Form Input', () => {
    it('should allow typing in email input', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/이메일 주소/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password input', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^비밀번호$/i);
      await user.type(passwordInput, 'Password123!');

      expect(passwordInput).toHaveValue('Password123!');
    });

    it('should allow typing in confirm password input', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i);
      await user.type(confirmPasswordInput, 'Password123!');

      expect(confirmPasswordInput).toHaveValue('Password123!');
    });
  });

  describe('Form Submission - API Calls', () => {
    it('should call signup API with correct data for foreign user', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      render(<SignupPage />);

      // Fill in the form
      await user.type(screen.getByLabelText(/이메일 주소/i), 'foreign@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      // Expect API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/signup'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'foreign@example.com',
              password: 'Password123!',
              userType: 'foreign',
            }),
          })
        );
      });
    });

    it('should call signup API with correct data for organization user', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      render(<SignupPage />);

      // Select organization type
      await user.click(screen.getByRole('button', { name: /지원 기관/i }));

      // Fill in the form
      await user.type(screen.getByLabelText(/이메일 주소/i), 'org@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      // Expect API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/signup'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'org@example.com',
              password: 'Password123!',
              userType: 'organization',
            }),
          })
        );
      });
    });

    it('should redirect to login page on successful signup', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      render(<SignupPage />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /회원가입 →/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'DifferentPassword123!');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      // Expect error message to be displayed
      await waitFor(() => {
        expect(screen.getByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument();
      });
    });

    it('should display error message when email is invalid', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'invalid-email');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/올바른 이메일 주소를 입력해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when password is too weak', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'weak');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'weak');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/8자 이상, 영문\/숫자\/특수문자를 포함해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when terms are not agreed', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      // Do NOT check the terms checkbox

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/이용약관에 동의해주세요/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API call fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/회원가입 중 오류가 발생했습니다/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns error response', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '이미 존재하는 이메일입니다' }),
      });

      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/이미 존재하는 이메일입니다/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during API call', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000))
      );

      render(<SignupPage />);

      await user.type(screen.getByLabelText(/이메일 주소/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123!');
      await user.click(screen.getByRole('checkbox'));

      const submitButton = screen.getByRole('button', { name: /회원가입 →/i });
      await user.click(submitButton);

      // Check for loading indicator
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /회원가입 →/i })).toHaveAttribute('disabled');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(<SignupPage />);

      expect(screen.getByLabelText(/이메일 주소/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/이용약관 및 개인정보 처리방침/i)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for error messages', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123!');
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'DifferentPassword!');
      await user.click(screen.getByRole('button', { name: /회원가입 →/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText(/비밀번호가 일치하지 않습니다/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});
