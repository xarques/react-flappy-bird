import { GLView } from 'expo';
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import uuid from 'uuid/v4';

import DisableBodyScrollingView from './components/DisableBodyScrollingView';
import ExpoButton from './components/ExpoButton';
import GithubButton from './components/GithubButton';
import KeyboardControlsView from './components/KeyboardControlsView';
import logyo from './components/logyo';
import Game from './src/game';

import { listScores } from './src/graphql/queries';
import {
  createScore as createScoreGraphQL,
  updateScore as updateScoreGraphQL
} from './src/graphql/mutations';

import config from './src/aws-exports';

const CLIENT_ID = uuid();
Amplify.configure(config);

logyo('https://twitter.com/baconbrix');

const App = props => {
  const [userScore, setUserScore] = useState();
  const [signedUser, setSignedUser] = useState(null);
  const game = useRef(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log('currentAuthenticatedUser', { user });
        setSignedUser(user.attributes.email);
      })
      .catch(error => console.log({ error }));
  });

  useEffect(() => {
    if (signedUser) {
      setUserScore({
        id: CLIENT_ID,
        userName,
        score: 0
      });
      initScore(signedUser);
    }
  }, [signedUser]);

  // async function getData() {
  //   try {
  //     const scoreData = await API.graphql(graphqlOperation(listScores));
  //     console.log('data from API: ', scoreData);
  //     setScore(scoreData.data.listScores.items[0].score);
  //   } catch (err) {
  //     console.log('error fetching data..', err);
  //   }
  // }

  const initScore = userName => {
    try {
      const score = {
        id: CLIENT_ID,
        userName,
        score: 0
      };
      setUserScore({
        id: CLIENT_ID,
        userName,
        score: 0
      });
      console.log('initScore', score);
      // const res = await API.graphql(
      //   graphqlOperation(createScoreGraphQL, {
      //     input: { ...score }
      //   })
      // );
      //console.log('initScore from db ', res);
      console.log('initScore userScore after db ', userScore);
    } catch (err) {
      console.log('error creating score...', err);
    }
  };

  const updateScore = async score => {
    console.log('updateScore signedUser', signedUser);
    console.log('updateScore userScore', userScore);

    try {
      const newScore = { id: CLIENT_ID, userName: signedUser, score };
      console.log('newScore', newScore);
      setUserScore(newScore);
      await API.graphql(
        graphqlOperation(updateScoreGraphQL, {
          input: newScore
        })
      );
    } catch (err) {
      console.log('error updating score...', err);
    }
  };

  const { style, ...rest } = props;
  return (
    <View
      style={[{ width: '100vw', height: '100vh', overflow: 'hidden' }, style]}
    >
      <DisableBodyScrollingView>
        <KeyboardControlsView
          onKeyDown={({ code }) => {
            console.log('onKeyDown', game.current);

            if (game.current) {
              if (code === 'Space') {
                game.current.onPress();
              }
            }
          }}
        >
          <TouchableWithoutFeedback
            onPressIn={() => {
              console.log('onPressIn', game.current);
              if (game.current) game.current.onPress();
            }}
          >
            <GLView
              style={{ flex: 1, backgroundColor: 'black' }}
              onContextCreate={context => {
                console.log('onContextCreate');
                game.current = new Game(context);
                game.current.onScore = score => {
                  console.log('onScore', score);
                  updateScore(score);
                };
              }}
            />
          </TouchableWithoutFeedback>

          <Score>{userScore && userScore.score}</Score>
        </KeyboardControlsView>
      </DisableBodyScrollingView>
      <ExpoButton />
      <GithubButton />
    </View>
  );
};

const Score = ({ children }) => (
  <Text
    style={{
      position: 'absolute',
      left: 0,
      top: '10%',
      right: 0,
      textAlign: 'center',
      color: 'white',
      fontSize: 48,
      userSelect: 'none'
    }}
  >
    {children}
  </Text>
);

export default withAuthenticator(App, { includeGreetings: true });
