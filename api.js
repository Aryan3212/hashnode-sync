const { request, gql } = require('graphql-request');


let token;
let hashnodeBaseUrl = 'https://gql.hashnode.com';

function setToken(_token) {
  token = _token
}
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

const removePostMutation = gql`
  mutation removePost($input: RemovePostInput!) {
    removePost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;
const meQuery = gql`
  query User{
    me {
      id
      username
      name
      publications(first: 50){
        edges {
          node{
            id
            title
            url
          }
        }
      }
    }
  }
`;

async function getMyUser() {
  return await request({ url: hashnodeBaseUrl, document: meQuery, requestHeaders: { "Authorization": token } })
}
async function updatePost(post) {
  const input = post
  return await request({ url: hashnodeBaseUrl, document: updatePostMutation, variables: { input }, requestHeaders: { "Authorization": token } })
}
async function removePost(postId) {
  const input = {
    id: postId
  }
  return await request({ url: hashnodeBaseUrl, document: removePostMutation, variables: { input }, requestHeaders: { "Authorization": token } })
}
async function publishPost(post) {
  const input = {
    ...post,
    tags: []
  }
  return await request({ url: hashnodeBaseUrl, document: publishNewPostMutation, variables: { input }, requestHeaders: { "Authorization": token } })
}

module.exports = {
  getMyUser,
  publishPost,
  setToken,
  updatePost,
  removePost
}