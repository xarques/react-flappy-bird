import { GLView } from 'expo';
import * as React from 'react';
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

import {
  createScore as createScoreGraphQL,
  updateScore as updateScoreGraphQL
} from './src/graphql/mutations';

import config from './src/aws-exports';

Amplify.configure(config);

logyo('https://twitter.com/baconbrix');
class App extends React.Component {
  state = {
    id: undefined,
    userName: undefined,
    score: 0
  };

  componentDidMount() {
    Auth.currentAuthenticatedUser()
      .then(user => {
        // console.log('currentAuthenticatedUser', { user });
        this.initScore(user.attributes.email);
      })
      .catch(error => console.log({ error }));
  }

  initScore = async userName => {
    try {
      const id = uuid();
      this.setState({
        userName,
        id,
        score: 0
      });
      const score = {
        userName,
        id,
        score: 0
      };
      console.log('initScore', score);
      const res = await API.graphql(
        graphqlOperation(createScoreGraphQL, {
          input: score
        })
      );
    } catch (err) {
      console.log('error creating score...', err);
    }
  };

  updateScore = async score => {
    try {
      this.setState(state => ({ ...state, score }));
      const newScore = { ...this.state, score };
      console.log('newScore', newScore);
      await API.graphql(
        graphqlOperation(updateScoreGraphQL, {
          input: newScore
        })
      );
    } catch (err) {
      console.log('error updating score...', err);
    }
  };

  render() {
    const { style, ...props } = this.props;
    return (
      <View
        style={[{ width: '100vw', height: '100vh', overflow: 'hidden' }, style]}
      >
        <DisableBodyScrollingView>
          <KeyboardControlsView
            onKeyDown={({ code }) => {
              if (this.game) {
                if (code === 'Space') {
                  if (this.game.isDead) {
                    this.initScore(this.state.userName);
                  }
                  this.game.onPress();
                }
              }
            }}
          >
            <TouchableWithoutFeedback
              onPressIn={() => {
                if (this.game) {
                  if (this.game.isDead) {
                    this.initScore(this.state.userName);
                  }
                  this.game.onPress();
                }
              }}
            >
              <GLView
                style={{ flex: 1, backgroundColor: 'black' }}
                onContextCreate={context => {
                  this.game = new Game(context);
                  this.game.onScore = score => this.updateScore(score);
                }}
              />
            </TouchableWithoutFeedback>

            <Score>{this.state.score}</Score>
          </KeyboardControlsView>
        </DisableBodyScrollingView>
        <ExpoButton />
        <GithubButton />
      </View>
    );
  }
}

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
