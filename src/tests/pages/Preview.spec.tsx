import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { GetStaticPropsResult } from "next";
import { useSession } from "next-auth/client";
import { useRouter } from 'next/router';
import PostPreview, { FullPost, getStaticProps } from "../../pages/posts/preview/[post]";
import { getPrismicClient } from "../../services/prismic";

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

const post: FullPost = {
  slug: 'fake-post',
  title: 'My fake post',
  content: '<p>This is my post interne text.</p>',
  updatedAt: '01 de março de 2022'
}

describe('Preview Page', () => {
  const useSessionMocked = mocked(useSession);
  useSessionMocked.mockReturnValue([null, false]);

  it('should redirect user to full post page if he is a subscriber', () => {
    const useRouterMocked = mocked(useRouter);
    const useRouterPushMocked = jest.fn();
    
    useSessionMocked.mockReturnValueOnce([
      {activeSubscription: 'fake-active-sub'},
      false
    ]);
    useRouterMocked.mockReturnValueOnce({
      push: useRouterPushMocked
    } as any)

    render( <PostPreview post={post} /> );

    expect(useRouterPushMocked).toHaveBeenCalledWith(`/posts/${post.slug}`);
  });

  it('should render the screen if user isn\'t a subscriber ', () => {
    render( <PostPreview post={post} /> );

    expect(screen.getByText('My fake post')).toBeInTheDocument();
    expect(screen.getByText('This is my post interne text.')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    
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


    const response = await getStaticProps({
      params: {post: 'my-new-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining<GetStaticPropsResult<{post: FullPost}>>({
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