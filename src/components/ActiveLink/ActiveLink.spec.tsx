import { render } from '@testing-library/react';
import ActiveLink from '.';

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/'
  })
}));

describe('ActiveLink component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ActiveLink href='/' activeClassName='active'>
        <a>Home</a>
      </ActiveLink>
    );
  
    expect(getByText('Home')).toBeInTheDocument();
  });

  it('has active class if href match with asPath', () => {
    const { getByText } = render(
      <ActiveLink href='/' activeClassName='active'>
        <a>Home</a>
      </ActiveLink>
    );
  
    expect(getByText('Home')).toHaveClass('active');
  });

  it('hasn\'t active class if href don\'t match with asPath', () => {
    const { getByText } = render(
      <ActiveLink href='/test' activeClassName='active'>
        <a>Home</a>
      </ActiveLink>
    );
  
    expect(getByText('Home')).not.toHaveClass('active');
  });
});