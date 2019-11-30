import React from "react";
import logo from "./logo.png";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CARDS from './Cards.js';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 900,
    height: 600,
  },
}));



function Deck(props) {
  const classes = useStyles();
  const { cards } = props;
  return (
    <div className={classes.root}>
      <GridList cellHeight={300} className={classes.gridList} cols={5}>
        {cards.map((idx, i) => (
          <GridListTile key={i} cols={1}>
            <img src={CARDS[cards[(i+1)%10]-1]} width={180} height={300} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

class MyClass extends React.Component{
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      deck: Array(10).fill(53),
      play: true
    }
  }

  componentDidMount() {
    const {HighLow} = this.props.drizzle.contracts;
    const { accounts } = this.props.drizzleState;
    const { positions } = this.state;
    const { web3 } = this.props.drizzle;

    var new_deck = Array(10);
        var promises = [];
        for(let i = 0; i < 10; i++) {
          promises.push(new Promise((resolve, reject) => HighLow.methods.cards(i).call((error, result) => {
            if(!error) {
              console.log('Result of',i,'card',result);
              new_deck[i] = parseInt(result);
              resolve();
            }
          })));
        }
        Promise.all(promises).then(() => {this.setState({deck: new_deck}); console.log(new_deck)});

    const eventJsonInterface3 = web3.utils._.find(
      HighLow._jsonInterface,
      o => o.name === 'NewCard' && o.type === 'event',
    );
    web3.eth.subscribe('logs', {
      address: HighLow.options.address,
      topics: [eventJsonInterface3.signature]
    }, (e) => {
      if(!e) {
        console.log('Received event, NewCard');
        var new_deck = Array(10);
        var promises = [];
        for(let i = 0; i < 10; i++) {
          promises.push(new Promise((resolve, reject) => HighLow.methods.cards(i).call((error, result) => {
            if(!error) {
              // console.log('Result of',i,'card',result);
              new_deck[i] = parseInt(result);
              resolve();
            }
          })));
        }
        Promise.all(promises).then(() => this.setState({deck: new_deck}));
      }
    });
  }

  commit = async x => {
    
    const { HighLow, Helper } = this.props.drizzle.contracts;
    const { accounts } = this.props.drizzleState;
    const { web3 } = this.props.drizzle;
    // TODO: Randomize the nonce
    var nonce = 42;
  
    let commitment = await Helper.methods.generate_commitment(x,nonce).call();
    const eventJsonInterface3 = web3.utils._.find(
        HighLow._jsonInterface,
        o => o.name === 'NewCard' && o.type === 'event',
      );
    var subscription;
    var y = setTimeout(() => {
        HighLow.methods.bet_reveal(x,nonce).send({from:accounts[0], gas: 6721975});
        subscription.unsubscribe();
        this.setState({play: true});
  }, 55000);
    subscription = web3.eth.subscribe('logs', {
        address: HighLow.options.address,
        topics: [eventJsonInterface3.signature]
      }, (error, result, subscribe) => {
        if (!error) {
          const eventObj = web3.eth.abi.decodeLog(
            eventJsonInterface3.inputs,
            result.data,
            result.topics.slice(1)
          )
          console.log(x, nonce, 'reveal');
          HighLow.methods.bet_reveal(x,nonce).send({from:accounts[0], gas: 6721975});
          clearTimeout(y);
          subscribe.unsubscribe();
          this.setState({play: true});
        }
      });
    console.log(commitment, 'commit', typeof(commitment));
    var commit = await HighLow.methods.bet_commit(commitment).send({from:accounts[0],value:web3.utils.toWei("1"), gas: 6721975});
    this.setState({play: false});
  }

  render() {
    return (<div className="App">
      <div>
        <img src={logo} alt="drizzle-logo" />
        <h1>Drizzle Examples</h1>
        <p>Examples of how to get started with Drizzle in various situations.</p>
      </div>
      <Deck cards={this.state.deck} />
      <div id="draw-shapes" />
      <div className="section">
        <h2>Play</h2>
        <Button variant="outlined" onClick={() => this.commit(1)}>
          High
        </Button>
        <Button variant="outlined" onClick={() => this.commit(0)}>
          Low
        </Button>
      </div>
    </div>);
  }
};

export default MyClass;