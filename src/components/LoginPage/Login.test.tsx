import { render, screen } from '@testing-library/react';
import Login from '@/components/LoginPage/Login';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('Login Component', () => {
    test('renders the login form', () => {
        render(
            <AuthProvider>
                <Login />
            </AuthProvider>
        );

        expect(screen.getByPlaceholderText('Email')).not.toBeNull();
        expect(screen.getByPlaceholderText('Password')).not.toBeNull();
        
        expect(screen.getByRole('button', { name: /login/i })).not.toBeNull();

        expect(screen.getByText("Don't have an account?")).not.toBeNull();
        expect(screen.getByRole('link', { name: /register here/i })).not.toBeNull();
    });
});
