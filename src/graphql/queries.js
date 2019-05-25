// eslint-disable
// this is an auto generated file. This will be overwritten

export const getScore = `query GetScore($id: ID!) {
  getScore(id: $id) {
    id
    userName
    score
  }
}
`;
export const listScores = `query ListScores(
  $filter: ModelScoreFilterInput
  $limit: Int
  $nextToken: String
) {
  listScores(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userName
      score
    }
    nextToken
  }
}
`;
