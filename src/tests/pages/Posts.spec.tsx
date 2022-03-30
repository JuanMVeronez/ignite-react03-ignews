import { render, screen } from "@testing-library/react"
import { mocked } from "jest-mock";
import Posts, { getStaticProps, Post } from "../../pages/posts"
import { getPrismicClient } from "../../services/prismic";

jest.mock('../../services/prismic');

const posts: Post[] = [
  {slug: 'foo', title: 'bar', excerpt: 'foo bar', updatedAt: '10 de Abril'},
]

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts}/>);

    expect(screen.getByText('bar')).toBeInTheDocument();
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    
    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'fake-post',
            data: {
              title: [
                { type: 'heading', text: 'My fake post' }
              ],
              content: [
                { type: 'paragraph', text: 'This is my post interne text.' }
              ]
            },
            last_publication_date: '03-01-2022',
          }
        ]
      })
    } as any)
    

    const response = await getStaticProps({});
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'fake-post',
            title: 'My fake post',
            excerpt: 'This is my post interne text.',
            updatedAt: '01 de março de 2022'
          }]
        }
      })
    )
  })
})