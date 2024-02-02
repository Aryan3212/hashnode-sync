const { request, gql } = require('graphql-request');
const { getHashnodeRc } = require('./config');

let hashnodeRc = getHashnodeRc()
let token = hashnodeRc.token

const publishNewPostMutation = gql`
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;

const updatePostMutation = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;

const deletePostMutation = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;
const meQuery = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;
await gqlClient.request(publishNewPostQuery, {
    input: {
      title,
      subtitle,
      publicationId: loggedInUser.hashnodePublicationId,
      contentMarkdown: notionString.parent,
      slug,
      tags,
      coverImageOptions: {
        coverImageURL,
      },
    },
  });

data = await gqlClient.request(updatePostQuery, {
input: {
    id: hashnodeId,
    title,
    subtitle,
    publicationId: loggedInUser.hashnodePublicationId,
    contentMarkdown: notionString.parent,
    slug,
    tags,
    coverImageOptions: {
    coverImageURL,
    },
},
});

function createBlog(parsedFile) {

}

function updateBlog(parsedFile) {

}

function deleteBlog(parsedFile) {

}
function getPublication() {
    return 'publication';
}
await request('https://api.spacex.land/graphql/', document)