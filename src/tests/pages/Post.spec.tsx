import { render, screen } from "@testing-library/react"
import { mocked } from "jest-mock";
import Post, { FullPost, getServerSideProps } from "../../pages/posts/[post]"
import { getPrismicClient } from "../../services/prismic";
import { getSession } from 'next-auth/client'
import { GetServerSidePropsResult } from "next";


jest.mock('../../services/prismic');
jest.mock('next-auth/client');

const post: FullPost = {
  slug: 'foo', 
  title: 'bar', 
  content: '<p>This is my post interne text.</p>', 
  updatedAt: '10 de Abril'
}


describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post}/>);

    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('This is my post interne text.')).toBeInTheDocument();
  })

  it('should redirect the user if he tries to access logged out', async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({} as any)

    expect(response).toEqual(
      expect.objectContaining<GetServerSidePropsResult<FullPost>>({
        redirect: expect.objectContaining(
          {destination: '/', permanent: false}
        )
      })
    )
  })

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);
    
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    });
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My fake post' }
          ],
          content: [
            { type: 'paragraph', text: 'This is my post interne text.' }
          ]
        },
        last_publication_date: '03-01-2022'
      })
    } as any)


    const response = await getServerSideProps({
      params: {post: 'my-new-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining<GetServerSidePropsResult<{post: FullPost}>>({
        props: expect.objectContaining<{post: FullPost}>({
          post: expect.objectContaining<FullPost>({
            slug: 'my-new-post',
            title: 'My fake post',
            content: '<p>This is my post interne text.</p>',
            updatedAt: '01 de março de 2022'
          })
        })
      })
    )
  })
})