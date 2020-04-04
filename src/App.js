import './App.css';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import serializeForm from 'form-serialize';
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useLocation,
  BrowserRouter,
} from 'react-router-dom';

const UNSET_OPTION = 'UNSET';

/**
 * Main application entry
 */
function Main() {
  const [persons, setPersons] = useState(3);
  const formRef = useRef();
  const focusRef = useRef();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const values = serializeForm(event.target, { hash: true })
      .ages.filter(v => v !== UNSET_OPTION);

    navigate(`infected/?ages=${values}`);
  }
  
  return (
    <div id="App">
      <div className="agenda">
        <h1>Social Distancing</h1>
        <p>
          Many people are skeptical that covid-19 is a big deal (especially in Belarus).
          I've made this illustration to show how your action will affect you,
          your household, and the community around you. All equations are based
          on the latest infection growth and fatality rates of the virus as of
          March 29, 2020.
        </p>
      </div>
      <hr />
      <form id="RelativeForm" ref={formRef} onSubmit={handleSubmit}>
        {Array.from({ length: persons }).map((_, index, array) => (
          <label
            key={index}
            ref={array.length - 1 === index ? focusRef : undefined}
          >
            <span>
              {index === 0 ? 'Your age' : `Relative Member ${index}`}
            </span>
            <SelectAge defaultValue={index < 1 ? 23 : undefined} />
          </label>
        ))}
        <button type="button" onClick={() => setPersons(persons + 1)}>
          Add another
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function SelectAge(props) {
  return (
    <select name="ages" {...props}>
      <option value={UNSET_OPTION}>- provide an age</option>
      {Array.from({ length: 100 }).map((_, index) => (
        <option key={index}>{index}</option>
      ))}
    </select>
  )
}

function Infection() {
  const location = useLocation();
  const navigate = useNavigate();

  const ages = parseAges(location.search);
  if (ages === null) {
    setTimeout(() => navigate('/'), 0);
    return null;
  }

  return (
    <div id="App">
      <div className="agenda">
        <h1>In case if you're infected</h1>
        <p>
          Let's roll the dice and see if it kills any of your family.
          It probably won't.
        </p>
      </div>
      <div id="DiceRoll" className="center">
        {ages.map((age, index) => (
          <DiceRoll key={index} age={age}></DiceRoll> 
        ))}
      </div>
      <p>
        As expected, you probably didn't die. But it's not about you. Let's look
        at how many people your family is going to kill by not practicing social
        distancing.
      </p>
      <Link className="big-link" to={`/killers${location.search}`}>
        Your Kill Count ▸
      </Link>

      <hr />
      <h2>More information</h2>
      <p>
        Unless you're over 60, or are immuno-comprimised{" "}
        <i>(lots of your friends and family are!)</i> you're going to have to
        click the button a lot before you die.
      </p>
      <p>So this is just like the flu, right?</p>
      <p>
        Not quite. People have been quoting how many deaths per year there are
        for the flu (
        <a href="https://www.cdc.gov/flu/about/burden/index.html#:~:text=">
          12,000 to 61,000
        </a>
        ) to the deaths so far with coronavirus (
        <a href="https://www.cnn.com/interactive/2020/health/coronavirus-maps-and-cases/">
          ~50
        </a>
        ) in the US.
      </p>
      <p>
        To get the full story you usually have to look at more than static
        numbers. In this case, we need to look at:
      </p>
      <ul>
        <li>Fatality Rate</li>
        <li>Infection Growth Rate</li>
      </ul>
      <p>
        The flu has a general fatality rate of 0.1%
        <br />
        COVID-19's fatality rate right now is 3.4%
      </p>
      <p>
        <b>
          <a href="https://www.sciencealert.com/covid-19-s-death-rate-is-higher-than-thought-but-it-should-drop">
            That's 34x
          </a>
        </b>
        . The red bar here is 34 times bigger.
      </p>

      <div className="bars">
        <div className="bar covid">
          <span className="padding-adjust">COVID-19</span>
        </div>
        <div className="bar flu">
          <span className="padding-adjust">Influenza</span>
        </div>
      </div>
      <p>
        It's easy to tell this virus is worse even without all the data,{" "}
        <b>the flu doesn't completely overwhelm the health care system</b> in
        Italy each year, but{" "}
        <a href="https://www.theatlantic.com/ideas/archive/2020/03/who-gets-hospital-bed/607807/">
          that's exactly what coronavirus has done
        </a>
        .
      </p>
      <p>But still, only ~50 deaths in the US right? What's the big deal?</p>
      <p>
        The big deal is mixing a fatality rate that's 34x of the flu with
        exponential growth.
      </p>
    </div>
  )
}

const rates = [
  [9, 0],
  [19, 0.002],
  [29, 0.002],
  [39, 0.002],
  [49, 0.004],
  [59, 0.013],
  [69, 0.036],
  [79, 0.08],
  [79, 0.148],
];

function DiceRoll({ age }) {
  const [state, setState] = useState('alive');
  const [rolls, setRolls] = useState(0);

  const rate = useMemo(() => {
    let rate;
    for (const [maxAge, ageRate] of rates) {
      rate = ageRate;
      if (age < maxAge) break;
    }
    return rate;
  }, [age]);

  function rollDice() {
    setRolls(rolls + 1);
    setState('rolling');
  }

  useEffect(() => {
    if (state === 'rolling') {
      const timer = setTimeout(() => {
        const rando = Math.random();
        if (rando <= rate) {
          setState('dead');
        } else {
          setState('alive');
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [state, rate]);

  return (
    <div className="DiceRoll" data-state={state}>
      <div>
        <span aria-label={state} role="img">
          {state === "dead"
            ? "💀"
            : state === "alive"
            ? "😅"
            : state === "rolling"
            ? "🤮"
            : null}
        </span>{" "}
        <span>
          <b>{age} year old</b>
          <br />
          Fatality Rate: {(rate * 100).toFixed(1)}%
        </span>
      </div>
      <div>
        <button disabled={state === "dead"} onClick={rollDice}>
          Roll the dice
        </button>{" "}
        <span>Rolls: {rolls}</span>
      </div>
    </div>
  )
}

function KillCount({ ages }) {
  let [infected, setInfected] = useState(2)
  let [weeks, setWeeks] = useState(1)
  let rate = 0.034
  let Ro = 2

  let killed = Math.round(infected * rate)

  function nextWeek() {
    setInfected(infected * Ro)
    setWeeks(weeks + 1)
  }

  return (
    <div id="KillCount">
      <div aria-hidden="true">
        {Array.from({ length: killed }).map((_, index) => (
          // eslint-disable-next-line
          <span key={index}>💀</span>
        ))}
      </div>
      <p>Week: {weeks}</p>
      <p>People You Infected: {infected}</p>
      <p>People You Killed: {killed}</p>
      <button onClick={nextWeek}>Live another week</button>
    </div>
  )
}

function Killers() {
  let location = useLocation()
  let navigate = useNavigate()
  let ages = parseAges(location.search)
  if (ages === null) {
    setTimeout(() => navigate("/"), [])
    return null
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>Your Kill Count</h1>
        <p>
          Social distancing is about how many people you want to kill (I hope
          that's zero). Right now, a COVID-19 infected person infects two more.
          And since you don't show symptoms for two weeks you don't even know
          you're doing it.
        </p>
      </div>
      <KillCount ages={ages} />
      <p>
        So you infect two people, and next week they infect two people each, and
        then they infect two more, etc. etc.
      </p>
      <p>
        So let's say you just came home with the virus. Go ahead and click the
        button once. Now you and two people in your family are infected. Now
        keep clicking it to see how many people's deaths you could have avoided
        by staying home.
      </p>
      <p>
        So please, stay home. And while you're there{" "}
        <a href="https://www.washingtonpost.com/graphics/2020/world/corona-simulator/">
          I think this article is worth your time
        </a>
        . Extreme social distancing, the kind that feels like "overreacting"
        seems to be our only option right now.
      </p>
      <hr />
      <h2>More information</h2>
      <p>
        <Link to={`/infected${location.search}`}>
          On the previous page we looked at the fatality rate
        </Link>{" "}
        of COVID-19 and saw that statistically, you and your family will
        probably be fine, but social distancing isn't about you.
      </p>
      <p>
        What really sucks about this virus vs. the flu is that you can carry it
        around with you for weeks infecting people before you even know you have
        it. There is no way to know until it's too late. That's why containment
        is so important.
      </p>
      <p>
        You just saw that exponential growth is a powerful thing. The
        coronavirus is following a nearly perfect exponential curve in the
        US--even with our low levels of testing. While network marketers hope to
        use it in their favor to gain financial independence, a virus doesn't
        have to be convinced to keep the downline going.
      </p>
      <a
        style={{ display: "block", border: "solid 1px" }}
        href="https://www.worldometers.info/coronavirus/country/us/"
      >
        <img
          style={{ width: "100%" }}
          alt="graph showing a nearly perfect algorithmic growth rate"
          src="/graph.png"
        />
      </a>
      <p>
        The <i>Attack Rate</i> of COVID-19 is estimated by the World Health
        Organization to be{" "}
        <a href="https://www.worldometers.info/coronavirus/#repro">
          between 1.4 and 2.5
        </a>
        . That means if you get it, you're going to infect 2 other people (other
        studies have it as high as 4!). By comparison, the flu is 1.3 and
        anything less than 1 will just die off.
      </p>
      <p>
        Our numbers are following behind Italy's perfectly. There should be no
        doubt in any thinking person's mind that the only way to avoid killing
        untold numbers of people is to practice extreme social distancing{" "}
        <i>now</i>–even before the government tells you to.
      </p>
      <img
        style={{ width: "100%" }}
        alt="chart showing US's nearly identical numbers to Italy, just 10 days behind"
        src="/chart.jpg"
      />
      <h2 className="center">STAY HOME PLZ 😇</h2>
    </div>
  )
}

/**
 * Parse a given string into a array of numbers with ages
 * @param {string} search
 * @returns {Array}
 */
function parseAges(search) {
  try {
    const params = new URLSearchParams(search);
    return params
      .get('ages')
      .split(',')
      .map(age => Number(age));
  } catch (error) {
    return null;
  }
}

function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Main />}></Route>
      <Route path="/infected" element={<Infection />}></Route>
      <Route path="/killers" element={<Killers />}></Route>
    </Routes>
  )
}

export default () => (
  <BrowserRouter>
    <App />
    <p className="center">
      <small>
        Made by Nikolay Lebedev
      </small>
    </p>
  </BrowserRouter>
);
