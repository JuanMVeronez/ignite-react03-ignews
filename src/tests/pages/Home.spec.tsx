import { render, screen } from "@testing-library/react"
import { mocked } from "jest-mock";
import Home, { getStaticProps } from "../../pages"
import { stripe } from "../../services/stripe";

jest.mock('next/router');
jest.mock('next-auth/client', () => ({
  useSession: () => [null, false]
}));
jest.mock('../../services/stripe');

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{id: 'foo', amount: '$10.00'}}/>);

    expect(screen.getByText('for $10.00 month')).toBeInTheDocument();
  })

  it('loads initial data', async () => {
    const retrievePricesStripeMocked = mocked(stripe.prices.retrieve);
    
    retrievePricesStripeMocked.mockResolvedValueOnce({
      id: 'fake-amount',
      unit_amount: 1000
    } as any)

    const response = await getStaticProps({});
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-amount',
            amount: '$10.00',
          }
        }
      })
    )
  })
})