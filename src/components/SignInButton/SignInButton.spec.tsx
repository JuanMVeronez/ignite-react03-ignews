import { render, screen } from '@testing-library/react';
import { SignInButton } from '.';

import { useSession } from 'next-auth/client';
import { mocked } from 'jest-mock';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
  const mockedUseSession = mocked(useSession);
  it('renders as SignIn when not authenticated', () => {
    mockedUseSession.mockReturnValueOnce([null, false]);
    render(<SignInButton />);
  
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('renders as Logged in when authenticated', () => {
    mockedUseSession.mockReturnValueOnce([{user: {name: 'John Doe'}}, false]);
    render(<SignInButton />);
  
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
