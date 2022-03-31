import { render, screen, fireEvent } from "@testing-library/react"

import { mocked } from "jest-mock";

import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/router";

import { SubscribeButton } from "."

jest.mock('next-auth/client');
jest.mock('next/router');

describe('SubscribeButton component', () => {
  const mockedSignIn = mocked(signIn);
  const mockedUseSession = mocked(useSession);
  mockedUseSession.mockReturnValue([null, false]);

  it('should render correctly', () => {
    render(<SubscribeButton />);
  
    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('fire sign in function when user not authenticated', () => {
    render(<SubscribeButton />);
    
    const subscribeBtn = screen.getByText('Subscribe now');
    fireEvent.click(subscribeBtn);

    expect(mockedSignIn).toHaveBeenCalled();
  });

  it('redirects to posts when user already is a subscriber', () => {
    mockedUseSession.mockReturnValueOnce([{activeSubscription: 'fake-active-sub'}, false])
    
    const mockedUseRouter = mocked(useRouter);
    const mockedPush = jest.fn()

    mockedUseRouter.mockReturnValueOnce({push: mockedPush} as any)

    render(<SubscribeButton />);

    const subscribeBtn = screen.getByText('Subscribe now');
    fireEvent.click(subscribeBtn);

    expect(mockedPush).toHaveBeenCalledWith('/posts');    
  })
})